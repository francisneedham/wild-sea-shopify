# Product content and filter model

Status: rod and high-confidence lure values implemented 2026-10-25; remaining source conflicts and storefront filter configuration pending. Source: [`data/catalog/products.shopify.csv`](../data/catalog/products.shopify.csv), saved live import, and the maker source linked below.

## Model

Use **merchant-owned metafields on products and variants** as the source of truth for filterable specs. Shopify Search & Discovery filters use product or variant metafields, including metaobject references, but a reference to one per-product `rod_specs` metaobject would filter by that whole entry rather than independently by length, PE, cast and drag. Reserve metaobjects for reusable taxonomies such as technique or target species when those are modelled. The existing collection template renders Shopify's `collection.filters`; it does not need a custom filter engine.

| Owner | Field | Type | Stored unit / rule |
| --- | --- | --- | --- |
| Product, Rods | `specs.rod_length_cm` | decimal | Physical length in cm; `7'6"` = 228.6 cm |
| Product, Rods | `specs.rod_length_label` | single-line text | Original display form, such as `7'6"` |
| Product, Rods | `specs.rod_drag_recommended_kg` | decimal | Only explicitly recommended drag |
| Product, Rods | `specs.rod_made_in` | single-line text | Country stated in source; blank if absent |
| Variant, Rods | `specs.rod_pe_min`, `specs.rod_pe_max` | decimal | Source PE endpoints for PDP display; not shopper filters |
| Variant, Rods | `specs.rod_pe_supported` | list of single-line text | Shopper Line PE filter; standard supported ratings |
| Variant, Rods | `specs.rod_casting_weight` | single-line text | Exact text shopper filter and PDP display, e.g. `60–180 g` |
| Variant, Rods | `specs.rod_drag_max_kg` | decimal | Shopper maximum drag filter; only explicit maxima |
| Variant, Lures | `specs.lure_length_mm` | integer | Body length in mm |
| Variant, Lures | `specs.lure_weight_g` | decimal | Lure weight in grams, separate from shipping weight |
| Product, Lures | `specs.lure_types` | list of single-line text | Legacy lure style categories; may contain Popper and Diving Popper together |
| Product, Lures | `specs.lure_buoyancy` | single-line text | Floating or Sinking from explicit legacy categories |

Orquestra 759/7106 is one product with two distinct rod models as `Size` variants. Its model-specific length, PE, casting and maximum drag stay on variants. Shared origin remains on PRODUCT.

Product description remains editorial prose: action, use, target fish and rigging advice. The PDP now renders populated product and selected-variant specifications from metafields under the description. Legacy spec prose still appears inside some descriptions and needs content cleanup. Numeric Search & Discovery filters select exact stored values; range-overlap behavior for specs such as PE 8–10 needs a separate filter-UX decision. Do not present inferred values as source facts.

The three shopper-facing rod filters are variant metafields: `rod_drag_max_kg`, `rod_pe_supported`, and `rod_casting_weight`. PE choices use ratings 0.8, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15. A confirmed PE 6–10 rod carries PE 6, PE 8 and PE 10 while the PDP says 6–10. Maximum-only PE sources get their known endpoint only; Kusanagi's conflicting PE stays blank. Numeric endpoints are variant source fields, not separate filters. [Storefront filter UX](https://shopify.dev/docs/storefronts/themes/navigation-search/filtering/storefront-filtering/storefront-filtering-ux), [Search & Discovery filter types](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-filters).

## Casting-weight filter audit

The reviewed model has 31 rod models: 29 single-model products and two Orquestra variants. Live write/readback files confirm their casting metafields. **25 models have a complete interval**, **4 have only a maximum**, and **2 have no defensible casting range** (Kusanagi and Rodcom). Complete intervals yield **20 distinct range labels**:

| Complete range (g) | Rod models |
| --- | ---: |
| 14–40, 20–60, 30–130, 30–200, 40–80, 40–100 | 1 each |
| 60–110, 60–180, 70–120, 70–250 | 1 each |
| 60–250 | 3 |
| 80–150 | 2 |
| 80–220, 80–250, 100–180, 100–250, 100–270 | 1 each |
| 100–200 | 3 |
| 150–250, 150–300 | 1 each |

Maximum-only labels: ≤180 g and ≤250 g (Orquestra variants), ≤200 g (Raging Bull 93XX Trident), ≤300 g (Barbaro 788). Merchant chose exact text values despite **24 values across 29 populated rod models**. Search & Discovery treats overlapping intervals as distinct choices. Numeric casting endpoints were removed after verifying every text label against them; the pre-delete store backup remains in [`data/catalog/pe-filter/`](../data/catalog/pe-filter/). [Shopify supported metafield filter types](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-filters).

Rod length display already uses `specs.rod_length_label`; `specs.rod_length_cm` is the numeric internal filter value. Two legacy display labels are still metric (Onikiri `3.00 m`, Rodcom `3.04 m`); merchant asked for feet display, so their source-equivalent feet labels need review before editing live data.

## Lure normalization

53 lure products contain 289 variants. Ten products have multiple `Size` options. Nine use size as **length in mm**; Glide Popper uses `100`, `130`, `150` as **weight in g**, mapped in its description to 160, 180, 200 mm. `Variant Grams` is shipping weight, not lure weight: 120 lure variants have zero there, and known nonzero values disagree with stated lure weight.

| Source pattern | Products | Normalization |
| --- | ---: | --- |
| One size; explicit length/weight in description | 29 | Same pair on each color variant; includes two inline `200mm 100g` style descriptions |
| One size; explicit `cm–g` pair in title | 11 | Convert cm to mm; same pair on each color variant |
| One size; incomplete source | 3 | Keep missing dimension blank; review source |
| Multiple sizes; complete pairing | 7 | Match each variant's `Size` to its length or weight meaning |
| Multiple sizes; incomplete pairing | 3 | Fill only evidenced sizes; leave unmatched variants blank |

The staged [lure audit](../data/catalog/lure-spec-audit.json) contains product-level pairings and 289 variant candidates. Both metafields were written and read back on **257 variants**. Another **21 variants** have an evidenced length from the `Size` option but no evidenced weight; **three Craftbait GT3 variants** have an evidenced 130 g weight from the title but no evidenced length. These 24 partial values were also written and read back with zero mismatches. Eight variants remain entirely blank (Native Works Gazelle 230 and Napalm 220). Missing weights still need confirmation for the unmatched sizes on Liber Tango, Le Grand Tango and Wooodream Akiya Popper; Craftbait GT3 needs a sourced length. Example: Atoll Bonger maps 190 mm→87 g and 230 mm→128 g. Glide Popper maps 100 g→160 mm, 130 g→180 mm, 150 g→200 mm. No weight is taken from shipping grams.

## Rod audit

30 rod products contain 31 variants. The staged [rod audit](../data/catalog/rod-spec-audit.json) records source text and labelled evidence; it is **not** approved normalized values. Simple label detection finds length on 26 rods, PE on 28, cast on 29, drag on 19, and “Made in Japan” on 17. Some lengths appear without a label, so these counts are lower bounds.

Two clear source conflicts require review: Kusanagi P78HH prose says PE 8–10 while its spec line says PE 6–8; Onikiri 100H gives an ideal casting range of 70–120 g plus a separate 150 g shot weight. `Drag max` and `Recommended Drag` must never be merged. No origin should be inferred from brand nationality.

The user's example is **Truth White Insight 7610**: `7'6"` → 228.6 cm; PE 8–10; cast 60–250 g; **recommended** drag 18 kg; made in Japan. Its `rod_drag_max_kg` remains blank unless a separate maximum is sourced.

The [reviewed rod values](../data/catalog/rod-spec-reviewed.json) cover **all 30 rod products**. PE endpoints, casting endpoints and maximum drag were migrated from product to variant for all 31 rod models. The [migration plan](../data/catalog/pe-filter/migration-plan.json) and readbacks verify every value; five corresponding product definitions were removed. Casting endpoints were then removed from variants because the text field holds their complete display value. PE endpoints and maximum drag remain on variants. Shared length, recommended drag and origin remain on products. OceanSprinter 711RS lacked specs in the legacy description; its 7ft11inch length, PE maximum 8 and recommended 100–180 g lure range came from the [TRUTH JAPAN product specification](https://truthjapan.jp/products/307/).

Unresolved fields remain blank: Kusanagi's conflicting PE ratings, Onikiri's unqualified 13 kg drag, Rodcom's mixed jig/plug casting ranges, Raging Bull 98XS2's ambiguous `9.8ft` length, and approximate drag loads on OceanSprinter 8110/838/856. These do not block other sourced fields on those rods.

Variant filter definitions use `PUBLIC_READ` storefront access. `specs.color_family` supports the [visual color filter](COLOR-GROUPING.md); `specs.lure_types` and `specs.lure_buoyancy` support [lure category filters](LURE-FILTERS.md). Rod migration responses are in [`data/catalog/pe-filter/`](../data/catalog/pe-filter/). Existing descriptions and shipping weights were not overwritten.

## Sequence

1. Confirm missing lure values and ambiguous rod fields against maker data or merchant knowledge. Keep conflicts blank until resolved.
2. Enable lure and rod metafield filters in Search & Discovery. Rod filters must account for Orquestra's variant-level fields; the theme already renders `collection.filters`.
3. PDP spec table is implemented. Clean duplicate legacy spec text in descriptions after content review; user owns frontend/Theme Editor checks.

Sources: [Shopify Search & Discovery filter types](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-filters), [metaobject references](https://help.shopify.com/en/manual/custom-data/metaobjects/referencing-metaobjects).
