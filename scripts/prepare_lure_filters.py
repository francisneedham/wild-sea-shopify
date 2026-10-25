"""Stage product filter values from explicit legacy lure categories only."""

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data/catalog/lure-filters"
OUT.mkdir(exist_ok=True)
STYLE = {"/lures/poppers": "Popper", "/lures/diving-poppers": "Diving Popper", "/lures/stickbait": "Stickbait"}
BUOYANCY = {"/lures/floating": "Floating", "/lures/sinking": "Sinking"}


def main():
    products = {node["handle"]: node["id"] for p in sorted((ROOT / "data/catalog/variant-media").glob("audit-*.response.json")) for node in json.loads(p.read_text())["nodes"] if node}
    rows = []
    with (ROOT / "legacy_data/shop.csv").open(newline="") as file:
        for source in csv.DictReader(file):
            if not source["Title"] or "/lures" not in source["Categories"]:
                continue
            handle = source["Product URL"]
            categories = {part.strip() for part in source["Categories"].split(",")}
            styles = [value for key, value in STYLE.items() if key in categories]
            buoyancies = [value for key, value in BUOYANCY.items() if key in categories]
            assert handle in products
            assert len(buoyancies) <= 1, (handle, buoyancies)
            rows.append({"handle": handle, "title": source["Title"], "productId": products[handle], "legacyCategories": sorted(categories), "lureTypes": styles, "buoyancy": buoyancies[0] if buoyancies else None})
    assert len(rows) == 53
    (OUT / "plan.json").write_text(json.dumps(rows, indent=2) + "\n")
    values = []
    for row in rows:
        if row["lureTypes"]:
            values.append({"ownerId": row["productId"], "namespace": "specs", "key": "lure_types", "type": "list.single_line_text_field", "value": json.dumps(row["lureTypes"])})
        if row["buoyancy"]:
            values.append({"ownerId": row["productId"], "namespace": "specs", "key": "lure_buoyancy", "type": "single_line_text_field", "value": row["buoyancy"]})
    for index in range(0, len(values), 25):
        (OUT / f"set-{index // 25 + 1:03d}.variables.json").write_text(json.dumps({"metafields": values[index:index + 25]}, indent=2) + "\n")
    print(json.dumps({"products": len(rows), "typeProducts": sum(bool(r["lureTypes"]) for r in rows), "buoyancyProducts": sum(bool(r["buoyancy"]) for r in rows), "metafields": len(values)}, indent=2))


if __name__ == "__main__":
    main()
