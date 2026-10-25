"""Plan safe lure variant image links from legacy product JSON and Shopify audit."""

import json
import re
from collections import defaultdict
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "data/catalog/variant-media"


def stem(url):
    name = unquote(urlsplit(url).path.rsplit("/", 1)[-1].replace("%28", "_28").replace("%29", "_29")).rsplit(".", 1)[0]
    return re.sub(r"[^a-z0-9]", "", name.lower())


def color(variant):
    return next((option["value"] for option in variant["selectedOptions"] if option["name"].lower() in ("color", "colore")), "")


def source_color(variant):
    return variant.get("attributes", {}).get("Color") or variant.get("attributes", {}).get("Colore", "")


def main():
    legacy = {p.stem: json.loads(p.read_text())["item"] for p in (BASE / "legacy").glob("*.json")}
    products = [node for p in sorted(BASE.glob("audit-*.response.json")) for node in json.loads(p.read_text())["nodes"] if node]
    ready, unresolved = [], []
    for product in products:
        handle = product["handle"]
        source = legacy[handle]
        originals = json.loads((ROOT / f"data/catalog/live-run/{handle}.create.variables.json").read_text())["input"]["files"]
        original_urls = {file["originalSource"] for file in originals}
        source_variants = {v["sku"]: v for v in source["variants"]}
        live_variants = product["variants"]["nodes"]
        assert not product["variants"]["pageInfo"]["hasNextPage"]
        assert not product["media"]["pageInfo"]["hasNextPage"]
        assert len(source_variants) == len(source["variants"]) == len(live_variants)
        used_by_colors = defaultdict(set)
        for variant in source["variants"]:
            if variant.get("mainImageId"):
                used_by_colors[variant["mainImageId"]].add(source_color(variant))
        media = product["media"]["nodes"]
        for variant in live_variants:
            sku = variant["sku"]
            old = source_variants[sku]
            old_options = {({"colore": "color", "taglia": "size"}.get(k.lower(), k.lower())): v for k, v in old.get("attributes", {}).items()}
            new_options = {o["name"].lower(): o["value"] for o in variant["selectedOptions"]}
            if old_options and any(new_options.get(k) != v for k, v in old_options.items()):
                raise ValueError(f"Option mismatch: {handle} {sku}")
            row = {"handle": handle, "sku": sku, "color": color(variant), "variantId": variant["id"]}
            reason = None
            if variant["media"]["nodes"]:
                reason = "already_has_media"
            elif not old.get("mainImageId") or not old.get("mainImage", {}).get("assetUrl"):
                reason = "no_legacy_variant_image"
            else:
                url = old["mainImage"]["assetUrl"]
                row["legacyImageUrl"] = url
                if len(used_by_colors[old["mainImageId"]]) > 1:
                    reason = "legacy_image_shared_across_colors"
                elif url not in original_urls:
                    reason = "legacy_image_not_imported"
                else:
                    key = stem(url)
                    matches = [m for m in media if m["status"] == "READY" and m.get("image", {}).get("url") and (stem(m["image"]["url"]) == key or stem(m["image"]["url"]).startswith(key + "copy"))]
                    if len(matches) != 1:
                        # Shopify may add a hash suffix to source file names.
                        matches = [m for m in media if m["status"] == "READY" and m.get("image", {}).get("url") and stem(m["image"]["url"]).startswith(key)]
                    if len(matches) > 1 and sum(file["originalSource"] == url for file in originals) == len(matches):
                        # Duplicate imports of one exact URL are visually equivalent.
                        matches = matches[:1]
                    if len(matches) != 1:
                        reason = f"shopify_media_match_count_{len(matches)}"
                    else:
                        row["productId"] = product["id"]
                        row["mediaId"] = matches[0]["id"]
                        # A filename naming another known color needs human review.
                        named = [c for c in used_by_colors.values() for c in c if c and stem(c) in key]
                        if named and row["color"] not in named:
                            reason = "image_filename_names_other_color"
            if reason:
                row["reason"] = reason
                unresolved.append(row)
            else:
                ready.append(row)
    plan = {"ready": ready, "unresolved": unresolved}
    (BASE / "plan.json").write_text(json.dumps(plan, indent=2) + "\n")
    batches = defaultdict(list)
    for row in ready:
        batches[(row["handle"], row["productId"])].append({"variantId": row["variantId"], "mediaIds": [row["mediaId"]]})
    for (handle, product_id), variant_media in batches.items():
        (BASE / f"append-{handle}.variables.json").write_text(json.dumps({"productId": product_id, "variantMedia": variant_media}, indent=2) + "\n")
    print(json.dumps({"products": len(products), "ready": len(ready), "unresolved": len(unresolved), "reasons": {r: sum(x["reason"] == r for x in unresolved) for r in sorted({x["reason"] for x in unresolved})}}, indent=2))


if __name__ == "__main__":
    main()
