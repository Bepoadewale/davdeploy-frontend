## Problem / goal

Settings and Connections placed unrelated panels side-by-side, which made those workspace screens feel dense. Present each panel as a clear, vertical sequence instead.

## Current repo state

The authenticated workspace already has separate Settings and Connections routes. Their content and controls are unchanged by this work.

## Research / references used

Reviewed the supplied desktop screenshots of both routes and matched the one-panel-after-another scan pattern already used by the Activity screen.

## Work planned for the PR

- Replace the Settings two-column grid with a vertical settings stack.
- Replace the Connections two-column grid with a vertical connection stack.
- Cover the new layout containers in the route tests.

## Acceptance criteria

- Settings panels appear one after another rather than in two columns.
- Connection panels appear one after another rather than in two columns.
- Existing controls and actions remain available.

## Acceptance status

Implemented; local verification passed and the pull request is ready for CI and review.

## Tests / validation performed

`npm ci && npm run verify` passed: formatting, linting, TypeScript, 44 tests, API contract, public-environment checks, production build, static-hosting checks, SPA refresh check, and dependency audit.

## Evidence files produced

- `docs/test/test46.md`

## Boundaries

This changes layout only. It does not change membership, invitation, cloud connection, billing, privacy, or support behavior.

## Follow-up work

Review the deployed routes at desktop and mobile widths after merge.
