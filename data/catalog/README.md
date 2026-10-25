# Legacy catalog import bundle

Prepared from `legacy_data/shop.csv`. Live API import completed after explicit user authorization; product IDs, channel publication, stock, and media verification are checkpointed in `live-run/journal.json`. The CSV remains the earlier draft staging artifact described below.

- [products.shopify.csv](products.shopify.csv): 87 draft/unpublished products, 336 variants, 388 ordered product-image references across 434 CSV rows.
- [legacy-variant-data.csv](legacy-variant-data.csv): source identifiers, SKUs, options, stock, weights, categories, and visibility for reconciliation. This is an audit snapshot, not an inventory-import CSV.
- [import-report.json](import-report.json): source SHA-256, counts, unresolved items, legacy-to-native URL mapping, and zero-weight SKUs.

User confirmed source prices are EUR and weights are kilograms on 2026-10-25. Product prices are unchanged; the single sale maps EUR 500 to current price and EUR 600 to compare-at price. Weights are converted to whole grams for import, with kilograms as the display unit.

Regenerate using Python's standard library:

```sh
python3 scripts/prepare_catalog.py --currency EUR --weight-unit kg
```

The converter never contacts Shopify. It preserves original handles, HTML descriptions, SKUs, option values, and image order. Option labels `Colore`/`Taglia` become `Color`/`Size`. Single/default variants retain their SKU with `Title` / `Default Title` options. Image-only rows do not create extra variants. No per-variant image association is invented by this converter. A later store operation recovered explicit links from legacy product JSON; see [variant media](../../docs/VARIANT-MEDIA.md).

Source categories become product types where a single top-level category is present, plus tags such as `legacy-category-lures` and `legacy-category-lures-diving-poppers`. Original tags are retained. Every product receives `legacy-catalog-import`. Category tags do not create Shopify collections automatically.

## Live import result

Import complete. Shopify audit confirms 87 ACTIVE products, all published on both discovered channels (Online Store and POS), 336 variants, and 407 stock units at Shop location. 387 of 388 gallery references are READY. One legacy image URL for `floating-22cm-120g` returns HTTP 404; its 13 other images are ready. See [live-import-report.json](live-import-report.json). The CSV above remains an older draft staging artifact; it does not describe live product status.

## Follow-up content work

- Structured specification work is tracked in [PRODUCT-CONTENT-MODEL.md](../../docs/PRODUCT-CONTENT-MODEL.md). Sixteen storefront-readable rod/lure `specs` metafield definitions now exist, plus one color-family definition; 257 lure variants have verified length and weight, another 24 have one dimension, and all 30 rod products have sourced values. Readback matched 206 rod values. See `rod-spec-reviewed.json`, `spec-definitions/`, `spec-write/`, `lure-spec-audit.json`, and `rod-spec-audit.json`. These writes did not change product descriptions or shipping weights.
- Color grouping is tracked in [COLOR-GROUPING.md](../../docs/COLOR-GROUPING.md). `color-group-map.csv` maps every legacy Color label to one filter family; `color-family/` contains the 14 merchant-owned swatch entries, 297 variant assignments, API writes and readback. Original option names were not changed.

- Admin CLI access is authorized; current CLI is run from a temporary package cache. Preflight confirms target currency EUR and an empty initial catalog. No existing products are overwritten.
- The only active fulfillment location is Shop location (ID 80787898481). Live API payloads restore source stock directly there; the original staging CSV still intentionally omits inventory quantities. Source total: 407 units across 132 variants with positive stock.
- Review 122 zero-weight variants from the source; no replacement weights were guessed. Those SKUs are listed in the report.
- Assign categories for Lazarat Griffon Diving 170 and MC Works Slow Hand All That Tuna 768TSX; source category cells are empty.
- Vendor, standardized product taxonomy, and tax overrides are not provided by this export. No vendor/taxonomy inference was applied; Shopify defaults require review before publication.
- Replace the missing source image for `floating-22cm-120g` when a valid file or URL is available.
- User explicitly requested ACTIVE products published to all available channels. Current channels are Online Store (Negozio online) and POS. Creation responses are verified before publication; final audit checks every product's channel publication and image readiness.

Live execution uses validated operations under `operations/` and `scripts/import_catalog.py --execute`. Requests/results and an atomic journal are saved under `live-run/`. Never blindly rerun a creation with an unknown outcome; reconcile the saved product ID or exact handle first. The importer does not upsert existing products or replace their variant lists.

Shopify's supported CSV fields, older-header compatibility, product-image rows, and inventory-location restrictions: [official product CSV reference](https://help.shopify.com/en/manual/products/import-export/using-csv), checked 2026-10-25.
