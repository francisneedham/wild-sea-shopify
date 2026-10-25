"""Build small, auditable GraphQL vendor updates from the approved mapping."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data/catalog/vendors"


def main():
    rows = [row for row in json.loads((OUT / "plan.json").read_text()) if row["vendor"] != row["oldVendor"]]
    assert len(rows) == 85 and len({row["id"] for row in rows}) == len(rows)
    for index in range(0, len(rows), 10):
        batch = rows[index:index + 10]
        number = index // 10 + 1
        lines = [f"mutation UpdateVendorBatch{number:03d} {{"]
        for alias, row in enumerate(batch):
            product_id = json.dumps(row["id"])
            vendor = json.dumps(row["vendor"])
            lines.append(f"  v{alias}: productUpdate(product: {{id: {product_id}, vendor: {vendor}}}) {{")
            lines.append("    product { id handle vendor }")
            lines.append("    userErrors { field message }")
            lines.append("  }")
        lines.append("}")
        (OUT / f"update-{number:03d}.graphql").write_text("\n".join(lines) + "\n")
        (OUT / f"update-{number:03d}.expected.json").write_text(json.dumps({f"v{alias}": row for alias, row in enumerate(batch)}, indent=2) + "\n")
    print(f"Prepared {len(rows)} updates in {(len(rows) + 9) // 10} batches")


if __name__ == "__main__":
    main()
