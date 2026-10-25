"""Check vendor mutation journal and independent Shopify readback."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "data/catalog"
OUT = ROOT / "vendors"


def main():
    changed = 0
    for file in sorted(OUT.glob("update-*.response.json")):
        response = json.loads(file.read_text())
        expected = json.loads(file.with_name(file.name.replace(".response.json", ".expected.json")).read_text())
        assert response.keys() == expected.keys(), file
        for alias, result in response.items():
            assert not result["userErrors"], (file, alias, result["userErrors"])
            assert result["product"]["id"] == expected[alias]["id"], (file, alias)
            assert result["product"]["vendor"] == expected[alias]["vendor"], (file, alias)
            changed += 1
    assert changed == 85, changed
    readback = {row["id"]: row for row in json.loads((OUT / "readback.response.json").read_text())["nodes"]}
    plan = json.loads((OUT / "plan.json").read_text())
    assert len(readback) == len(plan) == 87
    mismatches = [row for row in plan if readback[row["id"]]["vendor"] != row["vendor"] or readback[row["id"]]["title"] != row["title"] or readback[row["id"]]["handle"] != row["handle"]]
    assert not mismatches, mismatches
    print(f"Verified {changed} vendor updates; {len(readback)} products read back")


if __name__ == "__main__":
    main()
