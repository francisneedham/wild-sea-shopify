# Color grouping and swatches

Status: Shopify custom data populated and verified 2026-10-25. Search & Discovery filter selection remains an Admin app setting.

## Source and mapping

The [exact mapping](../data/catalog/color-group-map.csv) covers **126 distinct legacy Color values on 297 variants**. It preserves the original option names shown on product pages. Names with one clear hue map to that family. Named patterns and mixed-color names map to **Pattern / Natural**, per merchant choice. The source includes formatting aliases such as `SilverBlue`/`Silver Blue`, `Green Shad`/`Greenshad`, and `Holo Pink`/`Holo pink`; these resolve to one family without renaming variants.

| Family | Source values | Variants | Swatch |
| --- | ---: | ---: | --- |
| Pattern / Natural | 55 | 145 | Multicolor gradient in theme |
| Blue | 13 | 31 | `#3669A3` |
| Black | 13 | 29 | `#1D2425` |
| Pink | 9 | 24 | `#DD81A4` |
| Yellow | 7 | 15 | `#E2BC3F` |
| Green | 7 | 10 | `#528566` |
| Gray | 3 | 9 | `#7D858C` |
| White | 4 | 7 | `#F2F1EA` |
| Silver | 2 | 7 | `#B8C1C7` |
| Purple | 2 | 6 | `#8061A5` |
| Red | 4 | 6 | `#C24845` |
| Orange | 3 | 3 | `#D97A35` |
| Gold | 2 | 3 | `#C09A4E` |
| Brown | 2 | 2 | `#8A5C39` |

Swatches represent **filter families**, not an exact paint match for each lure. Pattern / Natural includes labels such as Fusilier, Mahi, Nemo, YouPop and explicit mixtures such as SilverBlue. It has no fixed Shopify color value; the theme shows a multicolor gradient. A merchant can later attach actual pattern imagery by extending the color-family metaobject with an image field.

## Shopify model

- Merchant-owned `wildsea_color_family` metaobject: required `label`, optional `swatch_color` (`color`), storefront readable. Fourteen entries are [listed here](../data/catalog/color-family/palette.json).
- `specs.color_family` PRODUCTVARIANT metafield: single `metaobject_reference` to that definition, storefront readable. Each of the 297 Color variants references exactly one group. [Assignments](../data/catalog/color-family/assignments.json), definition and write/readback journals live in `data/catalog/color-family/`.
- Original Color option values remain unchanged. The new field supplies a small stable set of filter values and a native swatch source. Shopify readback matched **297/297** assignments.

## Activate in Search & Discovery

In **Apps → Search & Discovery → Filters**, replace the current Color product-option filter with the variant metafield **Color family** (`specs.color_family`). Set the customer-facing filter label to **Color**. Select the metaobject **Label** field for value labels. Enable **Include visual → Swatch**, then select **Swatch color**. Save. The theme's collection filter uses `filter_value.swatch`, and its product picker reads the same variant reference. Native app filter configuration is not exposed by the Admin API used here, so this app selection must be made in Search & Discovery.

The Color product-option filter can still be used if desired, but it will retain 126 raw labels and will not use this normalized metaobject field. Shopify's documented visual filter path is a metaobject-reference filter; the new variant field supplies it.

References: [Search & Discovery filters and visual filters](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-filters), [Liquid filter swatch](https://shopify.dev/docs/api/liquid/objects/filter_value), [Liquid product option swatch](https://shopify.dev/docs/api/liquid/objects/product_option_value).
