# ticket38 — Simplify the empty workspace dashboard

PR: [#38](https://github.com/Bepoadewale/davdeploy-frontend/pull/38)

## Problem / goal

The empty dashboard repeated the same first-run guidance through zero-value metrics, an empty
review queue, readiness panel, empty projects and activity cards, a three-step onboarding strip,
and duplicate plan actions.

## Current repo state

The backend returns governed dashboard data. The frontend can reliably identify an empty workspace
without inferring authorization or product state locally.

## Research / references used

- Controlled production screenshots of the empty administrator dashboard.
- Existing dashboard data contract and route tests.
- Current accessibility and static-hosting boundaries.

## Work planned for the PR

- Replace the empty-dashboard collection of panels with one focused first-plan surface.
- Preserve the richer dashboard once workspace data exists.
- Remove the redundant overview top-bar plan action and raw subject display.

## Acceptance criteria

- [x] An empty workspace has one primary action and one concise setup sequence.
- [x] No empty zero-metric, review, project, activity, or duplicate onboarding panels are shown.
- [x] Existing populated workspace and role-aware review behavior remains available.

## Acceptance status

Implementation is complete pending local and CI verification.

## Tests / validation performed

See `docs/test/test38.md`.

## Evidence files produced

- `docs/test/test38.md`

## Boundaries

This is a presentation and client request-sequencing change only. It does not change backend
authorization, product data, Cognito, Cloudflare, AWS, or deployment execution.

## Follow-up work

Review the first populated workspace dashboard after a real plan is created and simplify that state
separately if it still carries redundant status panels.
