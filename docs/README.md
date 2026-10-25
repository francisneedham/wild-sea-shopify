# Project tracking

Start here when resuming work. Contributor rules live in [AGENTS.md](../AGENTS.md); setup commands live in the root [README.md](../README.md).

## Files

- [BRIEF.md](BRIEF.md): approved scope, deliverables, exclusions, acceptance criteria, and open scope questions.
- [TODO.md](TODO.md): current task status, priority, and completion criteria.
- [PROGRESS.md](PROGRESS.md): dated history of work and validation results.
- [HANDOFF.md](HANDOFF.md): latest state, blockers, and next action for the next session.
- [DECISIONS.md](DECISIONS.md): durable decisions and their rationale.
- [MIGRATION-PLAN.md](MIGRATION-PLAN.md): migration architecture, content model proposal, milestones, and supporting sources.
- [HOME-CONTENT.md](HOME-CONTENT.md): home section controls, content/media sources, interim links, and resource migration notes.
- [DESTINATIONS.md](DESTINATIONS.md): imported entries, source links, status choices, and template assignments.
- [PRODUCT-CONTENT-MODEL.md](PRODUCT-CONTENT-MODEL.md): rod and lure spec audit, normalized field model, and filter setup sequence.
- [COLOR-GROUPING.md](COLOR-GROUPING.md): exact Color-option mapping, merchant swatches, and Search & Discovery activation.

## Session workflow

1. Read `AGENTS.md`, then `BRIEF.md`, `HANDOFF.md`, and `TODO.md`. Consult progress and decisions for context.
2. Check the working tree before editing. Distinguish existing changes from session work.
3. Update the brief when the user changes scope. Label proposals and unknowns; do not treat them as approved work.
4. Track actionable work in TODO using stable IDs (`DOC-001`, then domain-specific IDs as needed). Use `todo`, `in_progress`, `blocked`, or `done`; include a reason and unblock condition for blocked work.
5. Record consequential decisions with date, rationale, and affected scope/task IDs. Mark replaced decisions as superseded and link their replacements.
6. Before ending a work session, append a progress entry and replace the handoff snapshot. Include changed paths, actual checks/results, unresolved issues, and the next concrete action.

Use `YYYY-MM-DD` dates. Preserve progress history; correct mistakes explicitly. Keep TODO as the task-status source, BRIEF as the scope source, and HANDOFF as a concise resume summary. Never store credentials, tokens, or private local configuration here.
