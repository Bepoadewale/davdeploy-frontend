## Problem / goal

Long plan-detail sections could only be closed through their summary at the top, forcing a reviewer to scroll back after reading the contents.

## Current repo state

Plan evidence uses native disclosure panels. The summary exposes a Read details/Close label, but the only native toggle is at the beginning of a section.

## Research / references used

- The supplied plan-review feedback.
- Existing native `<details>` disclosure implementation in `PlanPage`.

## Work planned for the PR

- Add a visible Close details control after each expanded detail's content.
- Add a workflow assertion that it closes the corresponding disclosure.
- Keep the project-name input within the API's persisted-name limit.

## Acceptance criteria

- Reviewers can close an expanded detail from its end.
- Closing does not alter plan data or navigation.
- The browser does not submit a project name longer than 64 characters.

## Acceptance status

Implemented and locally verified; pending CI and review.

## Tests / validation performed

`npm run verify` passed: formatting, linting, TypeScript, 44 tests, API contract, public-environment checks, production build, static-hosting checks, SPA refresh check, and dependency audit.

## Evidence files produced

- `docs/test/test48.md`

## Boundaries

This is a local browser presentation and input-bound improvement. It does not change evidence, plan state, API requests, or customer data.

## Follow-up work

Confirm the control remains comfortable to use with a long production plan.
