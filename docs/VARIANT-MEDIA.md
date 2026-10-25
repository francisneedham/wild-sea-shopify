# Lure variant images

Source: live legacy Squarespace product JSON (`item.variants[].mainImageId` and `mainImage.assetUrl`), cached in `data/catalog/variant-media/legacy/`. The Squarespace CSV contains gallery URLs but **no variant-image link**. Product image order alone is unsafe for multi-variant products.

On 2026-10-25, attached existing Shopify product media to **273 of 289 lure variants** across 53 products via `productVariantAppendMedia`; every assignment was read back. 267 used explicit legacy variant links. Six one-variant products used their first ready gallery image where legacy had no variant image. Source plan, variables, mutation responses, and readbacks: `data/catalog/variant-media/`. No images were duplicated or product descriptions changed.

## Unresolved: 16 variants

| Product | Variants / SKUs | Reason |
| --- | --- | --- |
| Atoll Bonger | `SQ0216913` GoldGreen, `SQ2404280` GoldGreen, `SQ3088240` SilverBlue, `SQ7193431` SilverOrange, `SQ7496866` Fusilier, `SQ0400514` SilverGoldBlack | Legacy links six color variants to one photo. Two GoldGreen may be valid; confirm actual photos. |
| FishTrippers Village Liber Tango | `SQ3470066` Blue, `SQ9920592` Rainbow Trout, `SQ5225677` Silver Black Yellow Head, `SQ1847202` Silver Blue Yellow Head | Legacy links four distinct colors to one photo. |
| Glide Floating 22cm 120g | `SQ7461328` Nemo | Legacy source image URL returns HTTP 404; upload replacement. |
| Native Works Napalm 220 | `SQ4138495` Sapphire Abalone Yellow | Legacy image filename says Yellow Titanium; check actual color. |
| Native Works Tank Popper 190 | `SQ3954638` White Blooded | Legacy image filename says Blooded White Glow; check actual color. |
| Woodream Akiya Popper | `SQ9590418` Blueback Silver, `SQ1096296` Natural Bait, `SQ7060695` GreenBack Yellow | Legacy variants have no image ID; multi-variant product needs confirmed matching. |

To finish, supply correct image per unresolved SKU or correct the legacy product media links. Then attach existing Shopify `MediaImage` IDs; upload replacement only for Nemo. Merchant frontend/Theme Editor QA remains pending.
