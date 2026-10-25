"""Historical staging for the 2026-10-25 rod migration; do not rerun on live store."""

import json
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data/catalog/pe-filter"
RATINGS = tuple(Decimal(x) for x in ("0.8", "1", "1.5", "2", "2.5", "3", "4", "5", "6", "8", "10", "12", "15"))
FIELDS = {"peMin": ("rod_pe_min", "number_decimal"), "peMax": ("rod_pe_max", "number_decimal"), "castMin": ("rod_cast_min_g", "number_integer"), "castMax": ("rod_cast_max_g", "number_integer"), "dragMax": ("rod_drag_max_kg", "number_decimal")}


def number(field):
    return Decimal(field["value"]) if field else None


def label(value):
    return f"PE {value.normalize():f}"


def text_range(low, high):
    if low is not None and high is not None:
        return f"{low:f}–{high:f} g"
    if high is not None:
        return f"≤{high:f} g"
    if low is not None:
        return f"≥{low:f} g"
    return None


def main():
    products = json.loads((OUT / "migration-before.response.json").read_text())["nodes"]
    assert len(products) == 30 and all(p and p["productType"] == "Rods" for p in products)
    staged = []
    expected = []
    for product in products:
        variants = product["variants"]["nodes"]
        assert not product["variants"]["pageInfo"]["hasNextPage"]
        assert len(variants) == (2 if "orquestra" in product["handle"] else 1)
        for variant in variants:
            values = {}
            for alias, (key, kind) in FIELDS.items():
                source = product[alias]
                current = variant[alias]
                assert not (source and current and Decimal(source["value"]) != Decimal(current["value"])), (product["handle"], alias)
                chosen = current or source
                if chosen:
                    values[key] = chosen["value"]
                    if not current:
                        staged.append({"ownerId": variant["id"], "namespace": "specs", "key": key, "type": kind, "value": chosen["value"]})
            low, high = (Decimal(values[k]) if k in values else None for k in ("rod_pe_min", "rod_pe_max"))
            assert low is None or high is None or low <= high
            if low is not None and high is not None:
                supported = [label(r) for r in RATINGS if low <= r <= high]
            elif low is not None or high is not None:
                endpoint = low if low is not None else high
                supported = [label(endpoint)] if endpoint in RATINGS else []
            else:
                supported = []
            casting = text_range(*(Decimal(values[k]) if k in values else None for k in ("rod_cast_min_g", "rod_cast_max_g")))
            assert variant["supportedPe"] is None and variant["castingWeight"] is None
            if supported:
                values["rod_pe_supported"] = supported
                staged.append({"ownerId": variant["id"], "namespace": "specs", "key": "rod_pe_supported", "type": "list.single_line_text_field", "value": json.dumps(supported)})
            if casting:
                values["rod_casting_weight"] = casting
                staged.append({"ownerId": variant["id"], "namespace": "specs", "key": "rod_casting_weight", "type": "single_line_text_field", "value": casting})
            expected.append({"handle": product["handle"], "sku": variant["sku"], "variantId": variant["id"], "fields": values})
    assert len(expected) == 31
    (OUT / "migration-plan.json").write_text(json.dumps(expected, indent=2, ensure_ascii=False) + "\n")
    for index in range(0, len(staged), 25):
        (OUT / f"migration-set-{index // 25 + 1:03d}.variables.json").write_text(json.dumps({"metafields": staged[index:index + 25]}, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"variants": len(expected), "writes": len(staged), "batches": (len(staged) + 24) // 25, "peFilters": sum("rod_pe_supported" in row["fields"] for row in expected), "castingFilters": sum("rod_casting_weight" in row["fields"] for row in expected)}))


if __name__ == "__main__":
    main()
