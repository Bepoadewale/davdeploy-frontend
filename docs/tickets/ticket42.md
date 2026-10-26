# ticket42 — Reduce the overview to direct navigation

PR: [#42](https://github.com/Bepoadewale/davdeploy-frontend/pull/42)

## Problem / goal

The overview duplicated plan and audit information already available through navigation, creating
unnecessary panels and helper text. The compact Workspace panel is the better home for direct links.

## Current repo state

Plan History, Connections, and Activity already provide their respective detailed views. The
overview also displayed recent-project and recent-audit panels plus descriptive text under every
quick-link item.

## Research / references used

- Controlled screenshot of the populated administrator overview.
- Existing Overview, Plan History, Connections, and Activity navigation routes.
- Current dashboard accessibility and route tests.

## Work planned for the PR

- Remove duplicated recent-project and audit-trail panels.
- Reduce the dark side panel to Connections, Recent projects, and Audit trail links.
- Remove redundant quick-link descriptions, readiness note, and dashboard helper copy that repeats
  an adjacent label or action.

## Acceptance criteria

- [x] Connections, Recent projects, and Audit trail have direct, accessible navigation links.
- [x] The overview does not duplicate plan history or audit content.
- [x] Redundant dashboard subtext is removed while required empty-state guidance remains.
- [x] Automated route coverage verifies the compact navigation surface.

## Acceptance status

Implementation is complete pending local and hosted verification.

## Tests / validation performed

See `docs/test/test42.md`.

## Evidence files produced

- `docs/test/test42.md`

## Boundaries

This is a frontend simplification only. It does not alter projects, plans, audit records,
authorization, API behavior, or cloud resources.

## Follow-up work

Review the populated overview on a phone after deployment to confirm the shorter quick-links panel
remains easy to scan.
