# Lure filters

Legacy source: `legacy_data/shop.csv` `Categories`. On 2026-10-25, created storefront-readable PRODUCT metafields and populated only explicit category values. Exact mapping and API readbacks: `data/catalog/lure-filters/`.

| Facet | Metafield | Type | Legacy categories | Populated products |
| --- | --- | --- | --- | ---: |
| Lure type | `specs.lure_types` | `list.single_line_text_field` | `/lures/poppers` → Popper; `/lures/diving-poppers` → Diving Popper; `/lures/stickbait` → Stickbait | 40/53 |
| Buoyancy | `specs.lure_buoyancy` | `single_line_text_field` | `/lures/floating` → Floating; `/lures/sinking` → Sinking | 24/53 |

Two independent facets let shoppers combine **Floating + Popper**. A product can also hold both Popper and Diving Popper when legacy assigned both. All 64 populated metafields read back exactly. No title-only guesses filled missing values: 13 products lack a type category, 29 lack buoyancy category; five have only `/lures`.

In Shopify Search & Discovery, add two filters using these product metafield definitions and label them **Lure type** and **Buoyancy**. The existing collection template renders native `collection.filters`; merchant frontend QA should confirm filter display and combinations. Shopify supports single-line text and list-of-single-line-text metafield filters: [Search & Discovery filters](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-filters), [storefront filtering](https://shopify.dev/docs/storefronts/themes/navigation-search/filtering/storefront-filtering).

Open content review: verify the five `/lures`-only products and all missing buoyancy/type values against maker information; keep blanks until sourced. Product-level classification is appropriate for this catalog because the source categories are product-level. If future variants differ in buoyancy or style, migrate those products to variant-level metafields before relying on variant-specific results.
