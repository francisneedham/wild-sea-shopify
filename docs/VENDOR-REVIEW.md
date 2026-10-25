# Vendor review

Source: 87 distinct product titles in `data/catalog/products.shopify.csv` (legacy catalog). Merchant resolved labels on 2026-10-25. Updated 85 Shopify vendor fields; two Wild Sea items already had the correct value. All 87 products were read back with expected vendor, title, and handle. Exact plan and API journal: `data/catalog/vendors/`.

## Clear title groups

Repeated prefixes support Atoll (4), Atlantis (2), CB One (3), Fish Trippers Village (4, two title spellings), Glide (12, vendor identity pending), Good Bait (5), Hammerhead (2), Jumprize (2), Lazarat (4), MC Works (14 solo products), Native Works (8), RST Supply (2), Truth Japan (11 title prefix `Truth`), and Woodream (2, one title typo `Wooodream`). Remaining single or double product prefixes are Craftbait, Full Hands, Indigo Blue, Kikuchi Craft, Patriot Design, Rodcom, and Wild Gambler. `Wild Sea Performance Hoodie` clearly maps to Wild Sea Expeditions.

## Merchant decisions applied

1. **Glide** — 12 lure titles → `Glide Tackle`.
2. **MC Works × Fish Trippers Village** — both collaboration rods → `MC Works`; collaboration stays in title/description.
3. **FishTrippers Village Concierto 280** → `SOHO Trippers x Fish Trippers Village`.
4. **Expedition Trucker Cap** → `Wild Sea Expeditions`.
5. **Canonical spellings** — `Fish Trippers Village` for `FishTripper(s) Village`; `Truth Japan` for `Truth`; `Woodream` for `Woodream`/`Wooodream`. Merchant confirmed these vendor labels. Product titles were not edited.

Only vendor fields were sent in each `productUpdate`. Store readback also confirmed titles and handles. Product options, status, publications, and inventory were not part of the mutation.
