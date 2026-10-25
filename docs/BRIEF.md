# Brief / scope of work

Last updated: 2026-10-25

## Context

Repository: Wild Sea Shopify theme, based on the Shopify theme starter described in the root [README.md](../README.md). This brief records confirmed work; the starter's existing features are not evidence of agreed project deliverables.

## Confirmed objective

Set up this Shopify theme for Wild Sea Expeditions, migrating the existing frontend in the parent directory into a maintainable storefront with a carefully modeled Theme Editor experience. Launch language: English first.

Sources: user requests on 2026-10-25 to maintain project tracking, define the Shopify migration and content architecture, and launch in English. User also asked whether each destination can have its own template; this capability must be preserved if metaobjects are selected.

## In scope

- Migrate visual design and applicable content/behaviors from the frontend in `../` into this theme.
- Establish global theme settings, color schemes, branding, favicon, typography, and section settings suitable for merchant editing.
- Model the site around Home, Destinations, Shop, News, About, policies, and supporting storefront flows.
- Use merchant-owned `destinations` metaobject web pages, each with its own Theme Editor template; one native Page lists published entries.
- Use native Shopify commerce resources for Shop; native blog functionality is the user's preferred direction for News.
- Model lure variant images from explicit legacy links; separate lure type and buoyancy into native product metafields for Search & Discovery filters. Normalize product vendors from repeated title brands after merchant review of ambiguous cases.
- Support an editable static About page and native store policies.
- Keep scope, tasks, progress, decisions, and handoffs current in this repository.

## Source inventory

- The parent frontend is Vite + vanilla JavaScript, as confirmed by `../package.json` and `../src/main.js`; no Nuxt project was found at the supplied location.
- `../BRIEF.md` records the original design brief. It is a reference, not automatic approval of every production feature or integration.
- `../src/data.js`: seven destination/expedition entries, news, category references, and product mapping.
- `../src/socotra.js`: richer Socotra layout, editorial content, categorized gallery, FAQs, and enquiry CTAs.
- `../src/legacy-products.json`: legacy catalog snapshot. Prices, stock, and variants need reconciliation against the actual Shopify catalog before import.
- `../src/style.css`, `../public/images/`, `../src/assets.json`: visual tokens and media references.
- `../README.md`: documents example departure dates, Netlify enquiry forms, local cart, manually curated social images, and production limitations.

## Not yet approved / unresolved

- Destination metaobject direction approved to begin setup; final field contract and redirects still require implementation and verification.
- Expedition booking: enquiry with team confirmation versus transactional booking/payment.
- Brochure delivery, newsletter provider, live Instagram feed, account behavior, and external integrations.
- Catalog import volume, content sign-off, confirmed departures/availability, and legal copy ownership.
- Further languages, launch date, operational store setup, and production release authorization.
- Reconstructing undocumented historical work or assuming existing changes are complete.

## Acceptance criteria

- Merchant can change brand assets, fonts, color schemes, menus, and section composition through the appropriate Shopify editing interface.
- Destination content has structured, reusable fields; editors can maintain entries and assign appropriate templates without code changes.
- Representative destination, product, collection, blog/article, About, Home, and policy views match the agreed reference and work on mobile.
- Shop uses Shopify products, variants, inventory, cart, and checkout; production content is reconciled with authoritative store data.
- Agreed forms have a verified delivery path, accessible validation, and useful success/error states.
- Native URLs, redirects, metadata, canonical links, and indexing are checked before release.
- Typecheck, build, Theme Check, touched-template smoke tests, and Theme Editor manual QA are recorded before implementation is considered complete.
- Project tracking distinguishes approved scope, proposals, actual checks, and unresolved decisions.

Implementation sequence and content model recommendations: [MIGRATION-PLAN.md](MIGRATION-PLAN.md).

## Scope changes

- 2026-10-25: Initial confirmed scope is project tracking only. Future scope changes must cite the user request or other approval evidence and link affected TODO items.
- 2026-10-25: User expanded scope to the Wild Sea Expeditions Shopify migration and requested an architecture proposal before setup. English-first launch confirmed; destination templates and content modeling are under discussion. See SCOPE-001 and ARCH-001.
- 2026-10-25: User replied “ok” to proceed with setup, then explicitly took ownership of frontend checks. Agent validation covers static checks/build; visual and Theme Editor QA belong to the user.
- 2026-10-25: User requested Home implementation with legacy-site content next. HOME-001 precedes the remaining destination work; home resource selectors and temporary legacy links are documented in HOME-CONTENT.
- 2026-10-25: User requested import of the full legacy product CSV, located at `legacy_data/shop.csv`, and confirmed EUR currency / kilogram weights. The prepared CSV is a draft staging artifact; the separate live API import is complete.
- 2026-10-25: User explicitly requested live products and then publication on all sales channels. Admin CLI authorization completed; live import uses ACTIVE status and all discovered publications, with verified source stock at the store's sole active fulfillment location. Earlier draft staging does not describe the authorized live import.
- 2026-10-25: User requested the legacy product detail, collection listing, and header layouts after import, plus Lucide for icon management. Theme Editor navigation stays menu-driven; legacy destination/news/about links serve only as fallback until native resources exist. User owns frontend checks.
- 2026-10-25: User created the `destinations` metaobject and requested the listing and Socotra detail. Store definition extended for listing image, region, technique; Socotra entry and Destinations Page created. Each new destination requires a dedicated template assignment.
- 2026-10-25: User requested entries from the legacy expeditions index and specified destination status choices: `available`, `last slots`, `closed`. All seven entries are created; closed Sudan expeditions remain visible as published entries. See [DESTINATIONS.md](DESTINATIONS.md).
- 2026-10-25: User requested structured product specs to support storefront filtering: rod length, PE, casting range, drag and origin; lure length and actual lure weight. Variant size semantics vary by product. Use typed product/variant metafields for independently filterable values; review incomplete legacy descriptions before rewriting them. See [PRODUCT-CONTENT-MODEL.md](PRODUCT-CONTENT-MODEL.md).
- 2026-10-25: User requested Color grouping and swatches for Search & Discovery. Merchant chose one `Pattern / Natural` family for named or mixed lure patterns. Preserve original option labels and use a variant-level color-family reference for filter values. See [COLOR-GROUPING.md](COLOR-GROUPING.md).
