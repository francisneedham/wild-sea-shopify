# Decision log

Record consequential decisions with date, status, context, rationale, and related tasks. Preserve replaced decisions and link their replacements.

## DEC-ROD-CAST-CLEANUP — Remove redundant casting endpoints

- Date: 2026-10-25
- Status: implemented; amends DEC-ROD-FILTER.
- Decision: delete variant `specs.rod_cast_min_g` and `specs.rod_cast_max_g` definitions and values. Keep `specs.rod_casting_weight` as the exact filter and PDP label. Retain PE numeric endpoints because the PDP uses them for the range display.
- Rationale: all 54 numeric casting values belonged to rods; all 29 rods with numeric casting data had matching text labels. No theme code reads numeric casting fields. Pre-delete values remain in [`data/catalog/pe-filter/`](../data/catalog/pe-filter/).
- Related: CAST-FILTER-001; [PRODUCT-CONTENT-MODEL.md](PRODUCT-CONTENT-MODEL.md).

## DEC-ROD-FILTER — Variant-only rod filter ownership

- Date: 2026-10-25
- Status: implemented in store; casting endpoint retention superseded by DEC-ROD-CAST-CLEANUP; Search & Discovery selection pending.
- Decision: maximum drag, supported PE ratings, and exact casting-weight text are the three shopper-facing variant metafields. PE and casting numeric endpoints also live on variants for source fidelity and PDP display. Remove the five corresponding product-level definitions and values. Keep recommended drag, length and origin at their existing level.
- Rationale: Orquestra models differ by variant; a product filter value would conflate them. Merchant requested text casting intervals despite their high cardinality.
- Related: SPEC-FILTER-001, CAST-FILTER-001, DRAG-FILTER-001; [PRODUCT-CONTENT-MODEL.md](PRODUCT-CONTENT-MODEL.md).

## DEC-001 — Keep project tracking in repository Markdown

- Date: 2026-10-25
- Status: accepted for DOC-001
- Context: the user requested a docs folder for progress, handoff, TODO, and scope tracking.
- Decision: use six linked Markdown files. BRIEF owns scope, TODO owns task status, PROGRESS owns history, HANDOFF owns the latest resume snapshot, DECISIONS owns rationale, and README explains the workflow.
- Rationale: records remain alongside code and readable without additional tooling.
- Consequence: contributors must update relevant records as work evolves; contributor rules remain centralized in [AGENTS.md](../AGENTS.md).
- Related: DOC-001; [BRIEF.md](BRIEF.md).

## DEC-002 — English-first Shopify migration

- Date: 2026-10-25
- Status: accepted; user explicitly confirmed “English first”.
- Decision: migrate the frontend in `../` into the existing native Shopify theme. Source inspection identifies Vite/vanilla JS rather than Nuxt.
- Rationale: preserve the visual reference while using Shopify's content and commerce workflows.
- Related: SCOPE-001, ARCH-001; [BRIEF.md](BRIEF.md).

## DEC-003 — Native resources and destination metaobject direction

- Date: 2026-10-25
- Status: implemented for Socotra; user Theme Editor QA pending.
- Decision: native products/collections for Shop, blog/articles for News, Page for About and destination index, native policies; merchant-owned `destinations` metaobject pages, with a dedicated template assigned to each destination.
- Rationale: destinations are repeated structured content; native commerce/editorial resources cover the other surfaces. Alternate templates preserve per-destination layout choice without duplicating content definitions.
- Consequences: native metaobject URLs include `/pages/`; destination search needs explicit treatment; store content definitions/entries require setup outside theme Git. Template edits affect all assigned entries.
- Related: ARCH-001, DEST-001; [MIGRATION-PLAN.md](MIGRATION-PLAN.md). Booking/payment and external service decisions remain open.

## DEC-004 — User owns frontend QA

- Date: 2026-10-25
- Status: accepted; explicit user instruction.
- Decision: user performs frontend checks. Agent runs appropriate static validation/build checks and records user QA findings; browser/visual/Theme Editor checks require a new user request.
- Related: FND-001, QA-001; [HANDOFF.md](HANDOFF.md).

## DEC-005 — Type scale floor and global gutter

- Date: 2026-10-25
- Status: accepted; user asked to avoid too-small text and align header/footer with legacy.
- Decision: legacy 6–11px text is not carried over. All running text uses `--text-label` (12px) minimum, `--text-sm` 14px, `--text-base` 16px. Legacy gutters (64/35/22px) become `--site-gutter`, shared by header, footer and content wraps.
- Consequence: layouts are slightly larger than the legacy reference by design; new sections must use the tokens.
- Related: TYPE-001, HEADER-001, FOOTER-001.

## DEC-006 — Newsletter and values live in the footer group

- Date: 2026-10-25
- Status: accepted.
- Decision: newsletter is a site-wide pre-footer section in `footer-group.json` (hidden on 404/policy); the four values are footer assurance blocks. Home template no longer carries either.
- Rationale: matches legacy placement and avoids duplicate merchant content.
- Related: FOOTER-001, HOME-001.

## DEC-007 — Destination operating status

- Date: 2026-10-25
- Status: implemented; explicit user values.
- Decision: merchant-owned `destinations.status` is a validated choice among `available`, `last slots`, `closed`. Keep closed expeditions published with a visible “Temporarily closed” badge, matching the legacy listing. Shopify publication state remains independent.
- Consequences: set `last slots` only from confirmed capacity; no imported source currently uses it. See [DESTINATIONS.md](DESTINATIONS.md).

## DEC-008 — Rod specification ownership

- Date: 2026-10-25
- Status: implemented.
- Decision: store rod numeric specs as typed PRODUCT metafields when a product represents one rod model. Store model-specific specs as PRODUCTVARIANT metafields for Orquestra 759/7106, which is one product with two `Size` variants. Keep shared origin on PRODUCT.
- Rationale: one product-level numeric value cannot truthfully represent both Orquestra models. Keep conflicting or approximate source values blank rather than inventing an exact filter value.
- Related: SPEC-001; [PRODUCT-CONTENT-MODEL.md](PRODUCT-CONTENT-MODEL.md).

## DEC-009 — Color filter families

- Date: 2026-10-25
- Status: implemented; Search & Discovery app selection pending.
- Decision: preserve legacy Color option labels; assign each Color variant one merchant-owned color-family metaobject through `specs.color_family`. A single explicit hue maps to its color family. Named and mixed-color patterns map to one `Pattern / Natural` family, per merchant choice.
- Rationale: 126 raw option labels are too many for a useful filter; a variant metaobject-reference filter supplies stable labels and native swatch colors. Theme uses a gradient for the pattern group, which has no literal hue.
- Related: COLOR-001; [COLOR-GROUPING.md](COLOR-GROUPING.md).
