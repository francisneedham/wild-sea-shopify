# Destinations import

Source: [legacy expeditions index](https://www.wildseaexpedition.com/en/expeditions), checked 2026-10-25. Each detail is a merchant-owned `destinations` metaobject. Listing route: `/pages/destinations`; detail route: `/pages/destinations/{handle}`. Each entry has a dedicated `templates/metaobject/destinations.{suffix}.json` file.

| Entry | Handle | Template suffix | Status | Legacy source |
| --- | --- | --- | --- | --- |
| Socotra | `socotra-fishing` | `socotra` | available | [Socotra fishing](https://www.wildseaexpedition.com/en/socotra-fishing) |
| Djibouti | `djibouti-popping` | `djibouti` | available | [Djibouti popping](https://www.wildseaexpedition.com/djibuti-popping) |
| Gabon | `gabon-fishing-adventure` | `gabon` | available | [Gabon fishing](https://www.wildseaexpedition.com/gabonfishing) |
| Los Roques | `los-roques` | `los-roques` | available | [Los Roques](https://www.wildseaexpedition.com/the-los-roques-archipelago) |
| Socotra Fly Fishing | `socotra-fly-fishing` | `socotra-fly` | available | [Socotra fly fishing](https://www.wildseaexpedition.com/socotra-fly-fishing) |
| Nubian Reef | `nubian-reef` | `nubian-reef` | closed | [Nubian Reef](https://www.wildseaexpedition.com/en/nubian-reef) |
| Nubian Flat | `nubian-flat` | `nubian-flat` | closed | [Nubian Flat](https://www.wildseaexpedition.com/en/nubian-flat) |

`status` is a validated single-line field with exactly `available`, `last slots`, `closed`. All seven metaobjects remain ACTIVE so closed expeditions stay visible with a “Temporarily closed” badge. `last slots` has no current entry: set it only after confirming inventory. Publication status and operating status are separate.

Source field map, Shopify File IDs, prepared mutations, returned entry IDs, and final seven-entry audit are in [`data/destinations/`](../data/destinations/). Listing photos were sourced from legacy site and verified READY in Shopify Files. Existing Socotra entry was preserved; only `status` was added to it. Dates, prices, travel rules, safety claims, and booking terms from old pages need current merchant review before use.

Theme files remain in Git working tree. Sync or deploy them before treating public detail URLs as complete. User owns storefront and Theme Editor QA.
