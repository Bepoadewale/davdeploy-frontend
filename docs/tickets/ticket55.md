## Problem / goal

Make AWS connection authority choices clear and deliberate.

## Current repo state

The connection page exposed one setup action.

## Research / references used

Product authorization boundary and AWS role design.

## Work planned for the PR

Add three distinct AWS access choices.

## Acceptance criteria

- Read-only is the default.
- Administrator pilot is separately selected and warned.

## Acceptance status

Locally verified; pending CI and deployment.

## Tests / validation performed

Recorded in `docs/test/test55.md`.

## Evidence files produced

- `docs/test/test55.md`

## Boundaries

The UI does not create a workload.

## Follow-up work

Connect existing custom role ARNs directly.
