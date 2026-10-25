"""Audit legacy Color options for Search & Discovery grouping."""

import csv
import re
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/catalog/products.shopify.csv"
OUTPUT = ROOT / "data/catalog/color-group-map.csv"

COLOR_WORDS = {
    "black": "Black", "blue": "Blue", "brown": "Brown",
    "gold": "Gold", "gray": "Gray", "green": "Green",
    "grey": "Gray", "orange": "Orange", "pink": "Pink",
    "purple": "Purple", "red": "Red", "silver": "Silver",
    "white": "White", "yellow": "Yellow",
}
ALIASES = {
    "banana": ("Yellow",),
    "carbon": ("Black",),
    "pearl": ("White",),
    "titanium": ("Gray",),
    "wineback": ("Red",),
    "readhead": ("Red",),
    "blackout": ("Black",),
    "blacklame": ("Black",),
    "blacknow": ("Black",),
    "blackbone": ("Black",),
    "naturalwood": ("Brown",),
    "greenwood": ("Green", "Brown"),
}


def classify(value: str) -> tuple[str, str]:
    key = re.sub(r"[^a-z0-9]", "", value.casefold())
    if key in ALIASES:
        return "|".join(ALIASES[key]), "name_or_material"
    spaced = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", value)
    words = re.findall(r"[a-z]+", spaced.casefold())
    groups = [group for word, group in COLOR_WORDS.items() if word in words]
    # Some legacy labels join a color to Back, Head, Shad, etc.
    for word, group in COLOR_WORDS.items():
        if word in key and group not in groups:
            groups.append(group)
    if groups:
        return "|".join(sorted(set(groups))), "explicit_color_word"
    return "", "needs_image_review"


def main() -> None:
    counts = defaultdict(int)
    products = defaultdict(set)
    with SOURCE.open(newline="") as source:
        for row in csv.DictReader(source):
            if not row["Variant SKU"]:
                continue
            for index in (1, 2, 3):
                if row[f"Option{index} Name"].strip().casefold() not in {"color", "colour"}:
                    continue
                value = row[f"Option{index} Value"].strip()
                if value:
                    counts[value] += 1
                    products[value].add(row["Handle"])
    with OUTPUT.open("w", newline="") as output:
        writer = csv.writer(output)
        writer.writerow(["source_value", "canonical_key", "name_hues", "filter_group", "mapping_basis", "variants", "products"])
        for value in sorted(counts, key=str.casefold):
            groups, state = classify(value)
            filter_group = groups if groups and "|" not in groups else "Pattern / Natural"
            basis = state if filter_group != "Pattern / Natural" else "named_or_mixed_pattern"
            writer.writerow([value, re.sub(r"[^a-z0-9]", "", value.casefold()), groups, filter_group, basis, counts[value], len(products[value])])
    assert classify("Silver Blue Yellow Head")[0] == "Blue|Silver|Yellow"
    assert classify("Fusilier")[1] == "needs_image_review"
    print(f"{len(counts)} values, {sum(counts.values())} color variants -> {OUTPUT}")


if __name__ == "__main__":
    main()
