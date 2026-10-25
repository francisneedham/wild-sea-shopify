# Shopify migration plan

Updated: 2026-10-25. Direction approved to begin setup following the user's “ok”. Field details and integrations below remain proposals until implemented and verified.

## Goal and boundaries

Migrate the parent frontend's design and applicable content into a native Shopify theme, English first. Editors must control branding, section composition, and structured destination content without code changes. The reference is Vite/vanilla JavaScript (`../package.json`, `../src/main.js`), rather than Nuxt.

Do not import prototype dates, inventory, prices, lead-delivery promises, or legal text as verified production data. Online expedition payments, additional languages, and external service choices remain unresolved.

## Resources and URLs

| Surface | Shopify resource | Proposed native URL |
| --- | --- | --- |
| Home | Index JSON template | `/` |
| Destinations index | One Page with a destination-list template | `/pages/destinations` |
| Destination detail | Merchant-owned `destinations` metaobject web page | `/pages/destinations/{handle}` |
| Shop landing | Curated collection-list template | `/collections` |
| Shop category | Collection | `/collections/{handle}` |
| Product | Product and its variants | `/products/{handle}` |
| News | Blog with handle `news` | `/blogs/news` |
| News detail | Article | `/blogs/news/{handle}` |
| About | Page with editorial sections | `/pages/about` |
| Store policies | Shopify policies | `/policies/{handle}` |

Menu labels can remain Destinations, Shop, News, and About. Internal links use resource URLs; migration includes a redirect inventory for both legacy public URLs and prototype URLs. Prototype routes alone are not an SEO migration inventory.

The destinations index is one landing page. Individual destination entries do not require corresponding Shopify Pages. Metaobject URLs still include Shopify's `/pages/` prefix.

## Content ownership

- Global theme settings: logo variants, favicon, font choices, color schemes, layout dimensions, social links, and social sharing fallback image.
- Section/block settings: presentation, section ordering, scheme selection, and selected resources. Connect compatible content with dynamic sources.
- Shopify content records: destination facts/editorial content, products/collections, blog articles, About content, menus, and policies.
- Shopify store administration: actual inventory, prices, payments, shipping, taxes, policy approval, and integration configuration.

Definitions and entries are store data, outside theme Git. Theme deployment does not create them. The destination milestone must document definition setup, sample entry creation, then Liquid retrieval and template assignment. Use merchant-owned content; no new app solely to own editorial data.

## Destination model proposal

One `destinations` entry represents an expedition offering, not strictly a country or island. Socotra Fishing and Socotra Fly Fishing can remain distinct entries without a new geography entity.

Merchant's existing definition already enables storefront access, publication, web-page rendering, and SEO mapping. Launch content remains English.

| Field group | Initial fields / types |
| --- | --- |
| Identity | `title`, `caption`, handle |
| Media | `listing_image` (image file reference); hero and gallery overrides in Theme Editor |
| Facts | `region`, `season`, `fishing_days`, `on_the_water`, `target_species`, `technique` |
| Operations | `status` (validated choices: `available`, `last slots`, `closed`) |
| Editorial | Dedicated Theme Editor template per destination: story, cards, gallery, FAQ, enquiry |
| SEO | Definition maps SEO title to `title`, description to `caption` |

Socotra's dedicated template seeds legacy content. Further destinations get dedicated template files, then a matching `onlineStore.templateSuffix` on their entries. The shared definition holds listing facts; Theme Editor sections hold page composition.

Optional content sections disappear cleanly when data is absent. A published but temporarily closed expedition can remain visible with an accurate status and enquiry CTA; publication status and operational availability are independent.

Do not create departure records from example dates. If confirmed departures are needed, use separate typed records with start/end dates and reviewed availability, linked to the destination. Booking/payment requirements must settle first.

## Destination templates

- `templates/metaobject/destinations.json` is the required default.
- `templates/metaobject/destinations.socotra.json` is Socotra's dedicated template; each new destination gets its own alternative by user requirement.
- Assign the matching suffix to every entry. Multiple templates reuse the same destination definition and section code.
- Editing an entry changes its content; editing a shared template changes all entries assigned to it. Content differences alone do not require a separate template.
- Verify the actual request/template context before adding destination JS. Preserve centralized routing; register any new entrypoint in both Vite and the layout.

## Theme Editor foundation

- Branding: primary/inverse logos, logo width, favicon, social sharing image.
- Typography: body DM Sans, headings Barlow Condensed, using Shopify font pickers and CDN font output.
- Color schemes: initial Paper, Ocean, Sand combinations based on source colors `#f6f5f0`, `#102c2d`, `#dfc89e`; semantic text, background, button, button-label, and border values.
- Layout: retain existing page-width/margin setting IDs and control radius; connect them to actual CSS variables.
- Section-level scheme controls and reusable sections, instead of a single hardcoded page section.
- Preserve existing saved settings where possible. Map legacy background/foreground values into the first scheme if present; retain the body-font setting ID.
- Verify settings actually affect rendered output, including password layout, empty asset selections, and Theme Editor section reloads.

## Search and external flows

Native storefront search does not list metaobjects as a result type. Proposed destination discovery: curated index/filtering plus a separate destination result group matching name/technique. Full destination body search requires a separate decision; do not promise it through native predictive search.

Replace the prototype's local cart with Shopify commerce. Reconcile catalog snapshot against actual store products before imports; use typed product/category/variant fields for filters, rather than extracting numbers from description strings at runtime.

Booking enquiry versus online payment remains open. Netlify submission endpoints do not carry into this theme. Brochure delivery, newsletter subscriptions, live Instagram content, and account behavior need explicit service/workflow decisions and verified delivery. A curated social gallery remains a viable baseline.

## Milestones and completion checks

1. **ARCH-001: architecture and scope.** Record resources, native URLs, ownership, caveats, and open choices. Done when a concrete proposal is reviewable and approved direction is recorded.
2. **FND-001: theme foundations.** Implement settings, CSS/font output, favicon, branding consumption, and representative section scheme selectors. Done when validation passes and rendered settings are checked; manual editor QA is recorded separately when not available.
3. **DEST-001: Socotra vertical slice.** Define/store the model, create reviewed sample content, build default/alternative templates, and test independent entries, drafts, empty fields, template assignment, and mobile output.
4. **SITE-001: reusable site surfaces.** Build destination listing, home, shop, blog/article, About, and policy presentation from native resources. Verify merchant editing and resource links.
5. **MIG-001: content and integrations.** Reconcile/import agreed content, replace forms, implement agreed destination discovery, and validate redirects from a legacy URL inventory.
6. **QA-001: release verification.** Check editor workflows, mobile/accessibility, forms, search, commerce, SEO, and required local gates; obtain release authorization before production changes.

Keep the current production theme and domain untouched during foundation work. Export store data before migrations. Rollback theme changes through a prior reviewed theme version; store data changes require their own backup and reversal plan.

## Review findings incorporated

The senior review found the resource model suitable but required explicit destination-search treatment, source-of-truth rules for prototype data, template/content ownership, store-side setup, and the missing metaobject JS routing check. Those are included above. No framework rewrite or added CMS is needed for the theme migration.

## Sources

Official Shopify docs checked 2026-10-25; these pages do not expose publication dates.

- [Metaobject templates](https://shopify.dev/docs/storefronts/themes/architecture/templates/metaobject): default and alternative templates.
- [Metaobject capabilities](https://shopify.dev/docs/apps/build/metaobjects/use-metaobject-capabilities): publication, SEO, translations, native URLs.
- [Dynamic sources](https://shopify.dev/docs/storefronts/themes/architecture/settings/dynamic-sources): section/block content connections; unavailable for general theme settings.
- [Input settings](https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings): schemes, fonts, images, and resource pickers.
- [Storefront search](https://help.shopify.com/en/manual/online-store/storefront-search): native searchable resources.
- [Theme performance](https://shopify.dev/docs/storefronts/themes/best-practices/performance): server-rendered content, first-paint assets, sparing font preloads.
