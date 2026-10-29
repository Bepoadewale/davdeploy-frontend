# ticket76 - Simplify founding line

PR: [#76](https://github.com/Bepoadewale/davdeploy-frontend/pull/76)
Branch: `fix/founding-line`

## Problem / goal

The phrase “Independently built” adds an unnecessary interpretation to the public About page.

## Current repo state

The public About page contains a longer founding line than the founder wants.

## Research / references used

The founder's explicit copy correction.

## Work planned for the PR

Replace the line with “Founded in October 2026.” and update the focused content fixture.

## Acceptance criteria

- [x] The About page uses only the requested founding statement.
- [x] The focused public-page test asserts the exact statement.

## Acceptance status

Implemented and locally verified; awaiting PR CI and deployment.

## Tests / validation performed

Recorded in `docs/test/test76.md`.

## Evidence files produced

`docs/test/test76.md`.

## Boundaries

Frontend copy and test only. No service, infrastructure, authentication, or product behavior change.

## Follow-up work

None.
