# Home content and editing

Updated: 2026-10-25. HOME-001 implementation complete; frontend and Theme Editor QA belong to the user.

## Current composition

The home template is [templates/index.json](../templates/index.json), with eight independently reorderable sections:

1. Wild Sea hero: original home photograph, legacy headline, expedition link, and film link.
2. Featured destinations: Socotra, Djibouti, and Gabon.
3. Expedition story: editorial introduction adapted from the legacy About page.
4. Shop categories: Lures, Rods, Terminal tackle, and Accessories.
5. Latest news: two sourced stories from June 2026.
6. Expedition gallery: five curated photographs linking to the Wild Sea Instagram profile.
Newsletter signup and the four Wild Sea values moved to the footer group on 2026-10-25 (site-wide pre-footer `sections/newsletter.liquid` and footer assurance blocks), matching legacy placement.

The design follows the existing frontend reference: large Barlow Condensed headings, expedition imagery, ocean/paper/sand schemes, circular shop-category artwork, and an editorial image/text feature. Hero copy and destination/news facts were checked against the live legacy site. No booking availability, stock, price, or unverified performance claims are shown.

## Theme Editor controls

- Each section has a color-scheme selector and editable copy.
- External URLs are seeded through preset/template settings. URL-setting schema defaults must not contain external links; Shopify accepts only `/collections` and `/collections/all` in that schema attribute.
- Hero and story have image pickers overriding original photographs, link controls, and image descriptions.
- The Editorial cards section has destination, category, and gallery layouts; reorder/add/remove its blocks.
- Card image pickers override bundled originals. The Original photograph selector exposes named photographs, not file paths. Image alt text from the selected Shopify image takes precedence; original images use the card description/title.
- Category blocks have a Collection selector. A selected collection supplies its native title and URL, plus its image unless the merchant explicitly selected an image. Legacy photo/title/link apply only without a selected collection.
- Latest news has a Blog selector. A selected blog supplies its latest two published articles and native links; an empty selected blog does not show legacy fallback stories.
- Without a selected blog, the two curated story blocks render. A block can select a Shopify article; its native title, publication date, excerpt, and URL replace legacy content. An explicit image override remains available.
- The gallery is curated content; it does not claim to display the latest Instagram posts.

## Interim links and resource migration

Destination metaobjects, Shopify collections, and News articles have not been created by this home task. Seeded CTAs therefore use working legacy destinations until native resources are available. No assumed Shopify handles were inserted.

- Hero/destination index link: `https://www.wildseaexpedition.com/en/expeditions`.
- Destination cards: `/en/socotra-fishing`, `/djibuti-popping`, and `/gabonfishing` on the legacy domain.
- Story: legacy `/en/about`.
- Shop: legacy `/shop`, with verified `/shop/catalog/lures` and `/shop/catalog/rods` category links. Terminal tackle and Accessories currently link to the general legacy catalog; dedicated legacy category paths were not verified.
- News: legacy `/en/news` and the two actual story URLs below.
- Film: `https://www.youtube.com/watch?v=SzJzxkJoyj4`. The hero uses a photograph and film link; autoplay background video and an in-page player are not implemented.

After DEST-001, replace editorial destination block data with metaobject selections and native URLs, avoiding a second source of destination facts. After catalog/news migration, select the relevant collections and News blog in the editor. Replace section-wide legacy links as the native landing pages become available.

## Signup behavior

Uses Shopify's native `{% form 'customer' %}` with `contact[email]` and newsletter tags, a required consent checkbox, unique section-based form IDs, server errors, and a request-received success message. The privacy link appears only when the store has a privacy policy.

No signup was submitted during implementation. Email campaign delivery, provider configuration, and end-to-end signup QA remain unverified. [Shopify email consent documentation](https://shopify.dev/docs/storefronts/themes/customer-engagement/email-consent), checked 2026-10-25.

## Media provenance

Existing local originals were reused from `../../public/images/`, with source URLs recorded in [the parent source inventory](../../SOURCES.md). Sixteen originals were converted using `cwebp` at quality 82 into 33 responsive theme assets: 480/960 widths, plus a 1500 hero. Combined size: approximately 1.8 MB across all variants; browsers select one suitable variant per image.

Keys: `hero`, `socotra`, `djibouti`, `gabon`, `about-1`, `category-0` through `category-3`, `news-0`, `news-1`, `about-4`, `article-1`, `socotra-5`, `about-3`, `socotra-2`. Files live under `assets/wildsea-{key}-{width}.webp`.

The shared home-image snippet emits explicit dimensions and responsive sources; only the hero is eager/high-priority. Other photographs are lazy-loaded. Selected Shopify images use Shopify's responsive image pipeline.

## Content sources

Checked 2026-10-25:

- [Legacy home](https://www.wildseaexpedition.com/): “Endless passion for extreme fishing” headline and newsletter context.
- [Legacy expeditions](https://www.wildseaexpedition.com/en/expeditions): destination offerings and descriptions; only three are featured on home.
- [Legacy About](https://www.wildseaexpedition.com/en/about): operating since 2012, guides, responsible fishing, mission.
- [Legacy Shop](https://www.wildseaexpedition.com/shop): shop positioning and category navigation. Category artwork follows the existing frontend import.
- [Protecting Socotra](https://www.wildseaexpedition.com/en/news/protecting-socotra-through-responsible-tourism-supporting-communities-conserving-nature-and-building-a-sustainable-future): responsible-tourism story, 2026-06-11.
- [Standing on the Edge](https://www.wildseaexpedition.com/en/news/standing-on-the-edge-giant-gts-from-the-rocks-of-socotra): shore-based GT fishing story, 2026-06-04.
- [Parent frontend](../../src/main.js) and [content data](../../src/data.js): section ordering, imported imagery, and visual reference. Editorial summaries were adapted; prototype catalog/date placeholders were not imported.

## Review and QA

Senior review confirmed the section approach and required native newsletter feedback, optional privacy linking, canonical resource links, and no legacy fallback when a selected blog is empty. Those requirements are implemented. No JS/dependencies or new `data-js` hooks were added.

User QA: mobile layouts, section ordering/reload, scheme selection, image override/alt text, link replacement, selected collections, selected/empty blogs, article selection, and actual newsletter errors/success. Browser and frontend checks were not performed by the agent.
