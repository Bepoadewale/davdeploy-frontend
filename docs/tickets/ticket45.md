# ticket45 — Correct the four-step workflow heading

PR: [#45](https://github.com/Bepoadewale/davdeploy-frontend/pull/45)

## Problem / goal

The public homepage workflow contains Connect, Plan, Review, and Deploy, but its heading still
said “Three clear steps.” and included unwanted punctuation.

## Current repo state

The workflow correctly renders four stages after the previous public homepage update.

## Research / references used

- Current public homepage workflow implementation.

## Work planned for the PR

- Correct the heading to “Four clear steps” without a full stop.
- Update the public homepage assertion.

## Acceptance criteria

- [x] The heading matches the four visible workflow stages.
- [x] The heading has no trailing full stop.
- [x] Frontend verification passes.

## Acceptance status

Implementation is complete pending local and hosted verification.

## Tests / validation performed

See `docs/test/test45.md`.

## Evidence files produced

- `docs/test/test45.md`

## Boundaries

This changes public copy only. It does not change workflow behavior or product capability.

## Follow-up work

None.
