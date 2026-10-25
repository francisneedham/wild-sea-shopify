# TODO

Last updated: 2026-10-25

Task status lives here. Workflow and status definitions: [README.md](README.md).

## Open

- **MEDIA-001** — `in_progress`, priority: content. Attached and read back lure images on 273/289 variants. Remaining 16 need corrected source links/photos; see [VARIANT-MEDIA.md](VARIANT-MEDIA.md). User frontend QA pending.
- **LURE-FILTER-001** — `in_progress`, priority: current. Created and verified `specs.lure_types` (40/53 products) and `specs.lure_buoyancy` (24/53), sourced from explicit legacy categories. Enable both in Search & Discovery; review missing classifications and storefront result. See [LURE-FILTERS.md](LURE-FILTERS.md).
- **CATALOG-MEDIA-001** — `todo`, priority: content. Replace missing original image for `floating-22cm-120g`; source URL returns HTTP 404. Product has 13 other ready images. See [live import report](../data/catalog/live-import-report.json).
- **SPEC-001** — `in_progress`, priority: current. Created 16 filterable rod/lure metafield definitions; readback verified 206 rod values across all 30 products and two Orquestra variants, both lure values on 257 variants, and one on another 24. PDP now renders populated product/selected-variant specs in a table below description. Pending: source review for missing values, Search & Discovery filter selection, duplicate legacy spec prose cleanup, and user frontend QA. See [PRODUCT-CONTENT-MODEL.md](PRODUCT-CONTENT-MODEL.md).
- **SPEC-FILTER-001** — `in_progress`, priority: content. Verified variant `rod_pe_supported` on 30/31 rod models; Kusanagi conflict stays blank. Enable this variant filter in Search & Discovery and inspect the storefront result. Source PE endpoints now live on variants. See [PRODUCT-CONTENT-MODEL.md](PRODUCT-CONTENT-MODEL.md).
- **CAST-FILTER-001** — `in_progress`, priority: content. Verified variant text `rod_casting_weight` on 29/31 rod models using exact ranges; Kusanagi and Rodcom remain blank. Enable this variant filter in Search & Discovery and inspect the storefront result. See [PRODUCT-CONTENT-MODEL.md](PRODUCT-CONTENT-MODEL.md).
- **DRAG-FILTER-001** — `in_progress`, priority: content. Maximum drag is now variant-only and verified on 18/31 rod models. Enable the `rod_drag_max_kg` variant filter in Search & Discovery; recommended drag remains product-only and separate.
- **COLOR-001** — `in_progress`, priority: current. Grouped 126 raw Color values into 14 families, created native metaobject swatches and verified 297 variant references. Collection and PDP swatch markup implemented. Pending: select the new Color family visual filter in Search & Discovery and user frontend/Theme Editor QA. See [COLOR-GROUPING.md](COLOR-GROUPING.md).
- **PDP-001** — `in_progress`, priority: current. Legacy layout code implemented; user frontend/Theme Editor QA pending for variant media, price, add-to-cart, and recommendations.
- **PLP-001** — `in_progress`, priority: current. Legacy listing/filter layout code implemented; user frontend/Theme Editor QA pending for filter drawer, sort, quick buy, and pagination.
- **HEADER-001** — `in_progress`, priority: current. Aligned to legacy (gutters, breakpoints, icons, cart badge, hero glass on home/destinations, right mobile drawer), compacted to 72/60px with always-on glass. Desktop checked in Chrome; user mobile/Theme Editor QA pending. Store `main-menu` currently shows Home/Catalog/Contact: configure Destinations/Shop/News/About menu.
- **FOOTER-001** — `in_progress`, priority: current. Legacy footer (assurance blocks, brand/social, menu columns, contact, legal bar) and site-wide newsletter pre-footer in `footer-group`. Pending: assign footer menus, social links in theme settings, user QA.
- **MOTION-001** — `in_progress`, priority: current. Lenis + `[data-reveal]` base in `ts/utils/motion.ts`. Pending: user QA, extend `data-reveal` to further sections as they are migrated.
- **TYPE-001** — `in_progress`, priority: current. Type scale tokens in `css/typography.css` (12px floor) applied to all theme sections. Pending: user visual review of sizes.
- **HOME-001** — `in_progress`, priority: current. Home implementation complete with eight editable sections and sourced legacy content/media. Static checks and isolated build pass; user frontend/Theme Editor QA pending. Completion: user QA outcome recorded; native destination/catalog/blog connection remains linked to DEST-001/MIG-001. Editing and source notes: [HOME-CONTENT.md](HOME-CONTENT.md).
- **FND-001** — `in_progress`, priority: current. Implementation complete: schemes, fonts, branding/favicon controls, layout variables, representative section selectors. Typecheck, CLI Theme Check, and isolated production build pass. User owns pending frontend/Theme Editor QA: select assets, save/reload settings, switch schemes/fonts, and check mobile output. Completion: user QA outcome recorded; see [PROGRESS.md](PROGRESS.md).
- **DEST-001** — `in_progress`, priority: current. All seven legacy expeditions imported as ACTIVE metaobjects with READY listing photos, individual templates, and validated `status` choices. Sudan entries are `closed` and stay visible. Store audit, typecheck, isolated build, and Theme Check pass. Pending: theme sync/deploy, merchant review of current operating status, user frontend/Theme Editor QA. See [DESTINATIONS.md](DESTINATIONS.md).
- **SITE-001** — `todo`, priority: later. Migrate destination index, Shop, News, About, and policy presentation to native resources; connect Home to those resources as they become available. Home implementation tracked separately as HOME-001. Completion: responsive templates and merchant editing verified against the reference.
- **MIG-001** — `todo`, priority: later. Reconcile/import approved content, implement agreed integrations/search, map old URLs. Completion: authoritative data, submissions, and redirects verified. Booking/payment model and service choices remain open.
- **QA-001** — `todo`, priority: release. Verify editor workflows, mobile/a11y, commerce, forms, search, SEO, and production assets. Completion: quality gates and manual QA recorded; production release separately authorized.

## Completed

- **VENDOR-001** — `done`, 2026-10-25. Merchant resolved brand labels; updated 85 vendor fields and independently verified all 87 products. Titles and handles matched the pre-write audit. See [VENDOR-REVIEW.md](VENDOR-REVIEW.md).
- **CATALOG-001** — `done`, 2026-10-25. Imported and verified 87 ACTIVE products, 336 variants, and 407 stock units; all 87 published on Online Store and POS. 387 of 388 source image references are ready; the final source image is unavailable (CATALOG-MEDIA-001). [Report](../data/catalog/live-import-report.json).

- **SCOPE-001** — `done`, 2026-10-25. Captured the supplied migration scope and English-first launch; unresolved integrations and business requirements explicitly listed in BRIEF.
- **ARCH-001** — `done`, 2026-10-25. Inspected source/theme and official Shopify docs, completed senior review, and recorded migration direction. User replied “ok” to proceed; detailed schemas and integration choices remain open.
- **DOC-001** — `done`, 2026-10-25. Create the project tracking structure. Completion: brief, TODO, progress, handoff, decisions, and index exist; root README and AGENTS link the workflow; documentation links and required local checks are recorded in [PROGRESS.md](PROGRESS.md).
