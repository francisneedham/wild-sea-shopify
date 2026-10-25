"""Stage title-derived vendor changes for merchant review and store update."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data/catalog/vendors"
OUT.mkdir(exist_ok=True)
PREFIXES = {
    "Atoll ": "Atoll",
    "Atlantis ": "Atlantis",
    "CB One ": "CB One",
    "Craftbait ": "Craftbait",
    "FishTrippers Village ": "Fish Trippers Village",
    "FishTripper Village ": "Fish Trippers Village",
    "Full Hands ": "Full Hands",
    "Good Bait ": "Good Bait",
    "Hammerhead ": "Hammerhead",
    "Indigo Blue ": "Indigo Blue",
    "Jumprize ": "Jumprize",
    "Kikuchi Craft ": "Kikuchi Craft",
    "Lazarat ": "Lazarat",
    "MC Works ": "MC Works",
    "Native Works ": "Native Works",
    "Patriot Design ": "Patriot Design",
    "Rodcom ": "Rodcom",
    "RST Supply ": "RST Supply",
    "Truth ": "Truth Japan",
    "Wild Gambler ": "Wild Gambler",
    "Woodream ": "Woodream",
    "Wooodream ": "Woodream",
    "Glide ": "Glide Tackle",
    "Wild Sea ": "Wild Sea Expeditions",
    "Expedition Trucker Cap": "Wild Sea Expeditions",
}


def main():
    live = json.loads((ROOT / "data/catalog/vendor-audit.response.json").read_text())["nodes"]
    assert len(live) == 87 and all(product and product["vendor"] == "Wild Sea Expeditions" for product in live)
    rows = []
    for product in live:
        title = product["title"]
        matches = [vendor for prefix, vendor in PREFIXES.items() if title.startswith(prefix)]
        assert len(matches) == 1, title
        vendor = matches[0]
        if title == "FishTrippers Village Concierto 280":
            vendor = "SOHO Trippers x Fish Trippers Village"
        rows.append({"id": product["id"], "handle": product["handle"], "title": title, "oldVendor": product["vendor"], "vendor": vendor})
    assert len({row["id"] for row in rows}) == 87
    (OUT / "plan.json").write_text(json.dumps(rows, indent=2) + "\n")
    print(json.dumps({"products": len(rows), "changes": sum(row["vendor"] != row["oldVendor"] for row in rows), "vendors": sorted({row["vendor"] for row in rows})}, indent=2))


if __name__ == "__main__":
    main()
