"""Prepare the legacy product export for review; never writes to Shopify."""

import argparse
import csv
import hashlib
import json
import re
from collections import Counter
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
from urllib.parse import urlparse


HEADERS = [
    "Handle", "Title", "Body (HTML)", "Type", "Tags", "Published", "Status",
    "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value",
    "Option3 Name", "Option3 Value", "Variant SKU", "Variant Inventory Tracker",
    "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price",
    "Variant Compare At Price", "Variant Requires Shipping", "Image Src",
    "Image Position", "Image Alt Text",
]
OPTION_NAMES = {"Colore": "Color", "Taglia": "Size"}
TYPES = {"lures": "Lures", "rods": "Rods", "clothing": "Clothing"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def number(value, context):
    try:
        result = Decimal(value)
    except InvalidOperation as error:
        raise ValueError(f"Invalid number for {context}: {value!r}") from error
    require(result.is_finite() and result >= 0, f"Invalid {context}: {value!r}")
    return result


def load_products(source):
    products, skus, handles, variant_ids = [], set(), set(), set()
    with source.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        required = {
            "Product ID [Non Editable]", "Variant ID [Non Editable]", "Title",
            "Product URL", "Description", "SKU", "Price", "Sale Price",
            "On Sale", "Stock", "Weight", "Categories", "Tags", "Hosted Image URLs",
            "Product Type [Non Editable]", "Visible",
        } | {f"Option {field} {i}" for i in range(1, 7) for field in ("Name", "Value")}
        require(required <= set(reader.fieldnames or []), "Required legacy columns missing")
        for line, row in enumerate(reader, 2):
            if not any(row.values()):
                continue
            require(None not in row and all(v is not None for v in row.values()), f"Malformed row {line}")
            if row["Product ID [Non Editable]"]:
                handle = row["Product URL"]
                require(row["Title"] and re.fullmatch(r"[a-z0-9-]+", handle), f"Invalid product at row {line}")
                require(handle not in handles, f"Duplicate handle: {handle}")
                require(row["Product Type [Non Editable]"] == "PHYSICAL", f"Unsupported product type: {handle}")
                handles.add(handle)
                products.append({"source": row, "variants": [], "line": line})
            else:
                require(products and not row["Title"] and not row["Product URL"], f"Invalid continuation row {line}")
            sku, variant_id = row["SKU"], row["Variant ID [Non Editable]"]
            require(sku and sku not in skus, f"Missing/duplicate SKU at row {line}: {sku}")
            require(variant_id and variant_id not in variant_ids, f"Missing/duplicate variant ID at row {line}")
            skus.add(sku)
            variant_ids.add(variant_id)
            options = []
            for i in range(1, 7):
                name, value = row[f"Option Name {i}"].strip(), row[f"Option Value {i}"]
                require(bool(name) == bool(value), f"Incomplete option at row {line}")
                require(i <= 3 or not name, f"More than three options at row {line}")
                if name:
                    require(i == len(options) + 1, f"Non-contiguous options at row {line}")
                    options.append((OPTION_NAMES.get(name, name), value))
            if not options:
                options = [("Title", "Default Title")]
            require(len({name for name, _ in options}) == len(options), f"Duplicate option names: {sku}")
            price = number(row["Price"], f"price {sku}")
            require(price == price.quantize(Decimal("0.01")), f"Fractional currency cent: {sku}")
            require(row["On Sale"] in ("Yes", "No"), f"Invalid sale flag: {sku}")
            compare = ""
            if row["On Sale"] == "Yes":
                sale = number(row["Sale Price"], f"sale price {sku}")
                require(sale < price and sale == sale.quantize(Decimal("0.01")), f"Invalid sale price: {sku}")
                compare, price = f"{price:.2f}", sale
            stock = number(row["Stock"], f"stock {sku}")
            require(stock == stock.to_integral_value(), f"Fractional stock: {sku}")
            number(row["Weight"], f"weight {sku}")
            products[-1]["variants"].append({
                "source": row, "options": options, "price": f"{price:.2f}",
                "compare": compare, "stock": int(stock),
            })
    require(products, "No products found")
    for product in products:
        variants = product["variants"]
        names = [name for name, _ in variants[0]["options"]]
        require(all([name for name, _ in v["options"]] == names for v in variants), f"Inconsistent option names: {product['source']['Title']}")
        combinations = [tuple(value for _, value in v["options"]) for v in variants]
        require(len(set(combinations)) == len(variants), f"Duplicate option combination: {product['source']['Title']}")
    return products


def prepare(source, output, currency, weight_unit):
    products = load_products(source)
    headers = HEADERS + ["Variant Grams", "Variant Weight Unit"]
    product_rows, snapshots, mappings, categories = [], [], [], Counter()
    for product in products:
        original = product["source"]
        handle, title = original["Product URL"], original["Title"]
        paths = [path.strip() for path in original["Categories"].split(",") if path.strip()]
        categories.update(paths)
        roots = {path.strip("/").split("/")[0] for path in paths}
        tags = [tag.strip() for tag in original["Tags"].split(",") if tag.strip()]
        tags.append("legacy-catalog-import")
        for path in paths:
            parts = path.strip("/").split("/")
            for i in range(1, len(parts) + 1):
                tags.append("legacy-category-" + "-".join(parts[:i]))
        tags = list(dict.fromkeys(tags))
        require(len(tags) <= 250, f"Too many tags: {handle}")
        images = original["Hosted Image URLs"].split()
        require(all(urlparse(url).scheme == "https" and urlparse(url).netloc for url in images), f"Invalid image URL: {handle}")
        variants = product["variants"]
        for index in range(max(len(variants), len(images))):
            row = {key: "" for key in headers}
            row["Handle"] = handle
            if index == 0:
                row.update({
                    "Title": title, "Body (HTML)": original["Description"],
                    "Type": TYPES.get(next(iter(roots)), "") if len(roots) == 1 else "",
                    "Tags": ", ".join(tags), "Published": "FALSE", "Status": "draft",
                })
            if index < len(variants):
                variant = variants[index]
                for i, (name, value) in enumerate(variant["options"], 1):
                    row[f"Option{i} Name"], row[f"Option{i} Value"] = name, value
                row.update({
                    "Variant SKU": variant["source"]["SKU"], "Variant Price": variant["price"],
                    "Variant Compare At Price": variant["compare"], "Variant Requires Shipping": "TRUE",
                    "Variant Inventory Tracker": "shopify", "Variant Inventory Policy": "deny",
                    "Variant Fulfillment Service": "manual",
                    "Variant Grams": str((number(variant["source"]["Weight"], "weight") * 1000).quantize(Decimal("1"), rounding=ROUND_HALF_UP)),
                    "Variant Weight Unit": weight_unit,
                })
                snapshots.append({
                    "Handle": handle, "Title": title, "SKU": variant["source"]["SKU"],
                    "Legacy Product ID": original["Product ID [Non Editable]"],
                    "Legacy Variant ID": variant["source"]["Variant ID [Non Editable]"],
                    "Legacy Stock": variant["stock"], "Legacy Weight": variant["source"]["Weight"],
                    "Weight Unit": weight_unit, "Currency": currency, "Shopify Location": "",
                    "Legacy Categories": original["Categories"], "Legacy Visible": original["Visible"],
                    **{f"Option{i} {field}": (variant["options"][i-1][0 if field == "Name" else 1] if i <= len(variant["options"]) else "") for i in range(1, 4) for field in ("Name", "Value")},
                })
            if index < len(images):
                row.update({"Image Src": images[index], "Image Position": index + 1, "Image Alt Text": title})
            product_rows.append(row)
        mappings.append({
            "legacy_product_id": original["Product ID [Non Editable]"], "handle": handle,
            "title": title, "categories": paths, "variant_count": len(variants), "image_count": len(images),
            "legacy_path": f"/shop/catalog/p/{handle}", "shopify_path": f"/products/{handle}",
        })
    output.mkdir(parents=True, exist_ok=True)
    for filename, headers, rows in [
        ("products.shopify.csv", headers, product_rows),
        ("legacy-variant-data.csv", list(snapshots[0]), snapshots),
    ]:
        with (output / filename).open("w", encoding="utf-8", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=headers, lineterminator="\n")
            writer.writeheader()
            writer.writerows(rows)
    report = {
        "source": str(source), "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "status": "prepared_not_imported", "product_status": "draft", "published": False,
        "source_currency": currency, "source_weight_unit": weight_unit,
        "counts": {"products": len(products), "variants": len(snapshots), "image_references": sum(p["image_count"] for p in mappings), "source_stock_units": sum(v["Legacy Stock"] for v in snapshots), "csv_rows": len(product_rows)},
        "pending": ["Verify target store currency is EUR", "Verify target inventory location and import legacy quantities", "Read/back up existing Shopify products and resolve handle/SKU collisions", "Confirm source snapshot is current", "Review vendor, tax, category and collection mappings", "Verify image fetch results after import"],
        "omitted_from_product_csv": ["Inventory quantity", "Vendor", "Product taxonomy category", "Tax override", "Variant image mapping"],
        "notes": ["Source EUR and kg confirmed by user; prices unchanged and kilograms converted to whole grams", "New Shopify tracked variants default to zero quantity until stock is imported", "No products published; no store requests made", "Option names Colore/Taglia normalized to Color/Size; values unchanged", "Image URLs are product gallery images; no inferred variant-specific image assignments"],
        "uncategorized": [p["title"] for p in mappings if not p["categories"]],
        "zero_weight_skus": [v["SKU"] for v in snapshots if Decimal(v["Legacy Weight"]) == 0],
        "category_counts": dict(sorted(categories.items())), "products": mappings,
    }
    (output / "import-report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(report["counts"]))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=Path("legacy_data/shop.csv"))
    parser.add_argument("--output", type=Path, default=Path("data/catalog"))
    parser.add_argument("--currency", choices=["EUR"], required=True)
    parser.add_argument("--weight-unit", choices=["kg"], required=True)
    args = parser.parse_args()
    prepare(args.source, args.output, args.currency, args.weight_unit)
