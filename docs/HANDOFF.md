# Handoff

Last updated: 2026-10-25

## Current state

- Rod filters: maximum drag (`specs.rod_drag_max_kg`), supported PE (`specs.rod_pe_supported`), and exact text casting weight (`specs.rod_casting_weight`) are variant metafields. PE populated 30/31, cast 29/31, max drag 18/31; all 31 variants read back against the migration plan. Five matching product-level definitions and 123 values were deleted after backup and verification. Select the three variant filters in Search & Discovery. See [PRODUCT-CONTENT-MODEL.md](PRODUCT-CONTENT-MODEL.md) and [`data/catalog/pe-filter/`](../data/catalog/pe-filter/).
- Obsolete variant `rod_cast_min_g` and `rod_cast_max_g` definitions/54 values also removed after an all-336-variant audit and exact text-label comparison. Final readback confirms filter values unchanged. PE min/max stay: PDP uses their exact range. See [DECISIONS.md](DECISIONS.md).
- PDP specs: `snippets/product-specifications.liquid` renders populated product and selected-variant metafields below description; `product/sync.ts` swaps variant row groups. Jumprize Monster Absorber shows 8'2", PE 6–10, cast 60–180 g, max drag 18 kg in local HTML. Orquestra's two model groups and PE 0.8–2.5 formatting checked. Typecheck, Theme Check, and isolated build passed. Merchant frontend QA and legacy description cleanup pending.
- Casting-weight audit: 31 rod models, 25 complete intervals, four maximum-only, two missing. Merchant chose exact text ranges. Rod length display already has a label field; two legacy labels still use metres and await source-equivalent feet review.
- Lure variant media: 273/289 attached and independently read back; 16 unresolved legacy conflicts/missing photos. See [VARIANT-MEDIA.md](VARIANT-MEDIA.md). This includes the missing Nemo image tracked by CATALOG-MEDIA-001.
- Lure filtering: `specs.lure_types` and `specs.lure_buoyancy` definitions created; 64 values across 53 products read back exactly. Search & Discovery selection and user frontend QA pending. See [LURE-FILTERS.md](LURE-FILTERS.md).
- Vendor: merchant resolved labels; 85 fields updated and all 87 products independently read back. `Glide Tackle`, `MC Works` collaborations, `SOHO Trippers x Fish Trippers Village` for Concierto, and canonical brand spellings applied. See [VENDOR-REVIEW.md](VENDOR-REVIEW.md).
- CATALOG-001 complete. Final store audit: 87 ACTIVE products on Online Store and POS, 336 variants, 407 stock units. 387 of 388 source gallery references are ready; one original URL returns HTTP 404. Evidence: [live import report](../data/catalog/live-import-report.json) and `data/catalog/live-run/`. Do not rerun creation.
- PDP-001, PLP-001, HEADER-001 code implemented. Typecheck, Theme Check, and isolated build passed; user frontend/Theme Editor QA pending. Header upload syntax error and missing search/cart icons were fixed. Header icons now render from Liquid regardless of JavaScript.
- Scope: migrate the parent frontend into a native Wild Sea Expeditions Shopify theme, English first. Parent source is Vite/vanilla JS rather than Nuxt.
- Destination model uses merchant-owned `destinations` metaobject with one dedicated template per entry. All seven legacy expeditions now imported; two Sudan entries marked `closed`. See [DESTINATIONS.md](DESTINATIONS.md).
- FND-001 code complete; user frontend/Theme Editor QA pending. Branding/favicon/social image controls, Shopify fonts, schemes, layout variables, header/footer/custom-section scheme pickers, and social links are implemented. Real brand assets still need selection in the editor.
- HOME-001 code complete; user QA pending. Eight editable home sections now use sourced legacy content and responsive local WebP imagery. See [HOME-CONTENT.md](HOME-CONTENT.md) for editor controls and provenance.
- User reported upload failures after the initial home work. Four invalid external URL schema defaults were moved into presets in hero/story/news; template re-saved for sync. Block type `story` is correctly defined locally. Static checks/build pass; successful remote upload still needs confirmation.
- Typecheck and CLI Theme Check pass (16 existing dev-asset warnings). Production build passes in an isolated copy at `/private/tmp/wildsea-icon-build-r4_o2snq`; repository build remains constrained by the active dev lock. Production artifacts were not copied back.
- Detailed outcomes and toolkit-validator limitation: latest entry in [PROGRESS.md](PROGRESS.md).

## Working tree context

At session start, branch was `main` with existing changes in `.agents/skills/**`, `skills-lock.json`, `snippets/vite-tag.liquid`, and a deleted `example.shopify.theme.toml`. Preserve these changes; do not infer their intent or readiness. Recheck branch and status when resuming.

## Blockers / unknowns

- Catalog access resolved: current CLI runs through `bunx --bun @shopify/cli@latest`; user authorized Admin scopes. Preflight confirmed the correct EUR store, empty initial catalog, one active fulfillment location (Shop location, ID 80787898481), and Online Store/POS publications. Local Shopify plugin is installed/enabled but its MCP tools are not exposed in this session. Source still has 122 zero-weight variants and two uncategorized products; no weights/categories were invented.
- User explicitly owns frontend checks. Do not run browser/visual/Theme Editor QA unless requested; record user findings and fix reported issues.
- Expedition enquiry versus paid booking, service integrations, catalog reconciliation, confirmed departures, and release criteria remain unresolved.
- Store definition ID `gid://shopify/MetaobjectDefinition/37090918513` (type `destinations`) now includes `listing_image`, `region`, `technique`, and validated `status` (`available`, `last slots`, `closed`). All seven entries ACTIVE; Socotra ID `gid://shopify/Metaobject/650226630769` preserved. Listing Page ID `gid://shopify/Page/162994716785` published. Saved API operations, entry IDs and audit: `data/destinations/`. Theme code is local; sync/deploy and user QA pending.
- Home Destinations, Socotra, Djibouti and Gabon cards now target native pages. Categories and news can select Shopify resources. Newsletter is native Shopify signup; no submission/delivery QA yet.
- No commit, push, or production deployment was performed. Before branch-linked release, run the repository production build during a suitable dev pause and include generated artifacts.

## Latest session (header/footer/motion/type)

- Header + footer + newsletter pre-footer aligned to legacy; Lenis + reveal base; type scale with 12px floor; content gutter aligned. See latest PROGRESS entry and HEADER-001/FOOTER-001/MOTION-001/TYPE-001.
- Store menus still to configure (header shows default Home/Catalog/Contact; footer columns use fallbacks). Social URLs empty → footer social icons hidden until set.

## Latest session (product specs)

- `SPEC-001` in progress. Created nine PRODUCT and seven PRODUCTVARIANT merchant-owned `specs` metafield definitions with `PUBLIC_READ`. Populated both lure dimensions on 257 of 289 variants, one dimension on another 24, and sourced rod specs across all 30 rod products. Readback matched all 538 lure values and 206 rod values (196 product, 10 variant). Orquestra 759/7106 holds numeric specs on its two variants; shared origin sits on product. Review and write journal: `data/catalog/rod-spec-reviewed.json`, `data/catalog/spec-definitions/`, `data/catalog/spec-write/`; model: [PRODUCT-CONTENT-MODEL.md](PRODUCT-CONTENT-MODEL.md).
- Eight lure variants remain blank and 24 have only one sourced dimension. Ambiguous rod fields remain blank (Kusanagi PE, Onikiri drag, Rodcom cast, Raging Bull 98XS2 length, approximate OceanSprinter drag). Existing product descriptions and shipping weights were preserved. Search & Discovery filters have not yet been enabled; PDP specification display/description cleanup is pending.

## Latest session (color grouping)

- `COLOR-001` in progress. Merchant chose one `Pattern / Natural` family for named and mixed lure patterns. Audited 126 exact Color labels across 297 variants. Created 14 merchant-owned `wildsea_color_family` entries and one storefront-readable PRODUCTVARIANT `specs.color_family` metaobject-reference definition. Wrote and read back all 297 variant references with zero mismatches. Exact map: `data/catalog/color-group-map.csv`; API journal: `data/catalog/color-family/`; setup: [COLOR-GROUPING.md](COLOR-GROUPING.md).
- `sections/collection.liquid` now supports image swatches and the Pattern / Natural gradient; `snippets/variant-picker.liquid` uses native or variant family swatches. Original Color option labels remain unchanged. Search & Discovery must be switched from the raw Color option filter to the Color family variant metafield visual filter in its app UI. User owns storefront/Theme Editor QA.

## Next action

Select the Color family variant metafield as a visual filter in Search & Discovery, then user checks collection and PDP swatches. Review unresolved spec fields and enable remaining native metafield filters. Render structured rod/lure specs on PDP and clean duplicated description text. Separately configure menus and sync/deploy destination theme code; replace missing catalog photo when source asset supplied.
