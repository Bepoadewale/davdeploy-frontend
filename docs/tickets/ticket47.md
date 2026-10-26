## Problem / goal

The new-plan flow silently generated timestamped project names, leaving customers with titles such as `AWS plan for project-53905575`. Let customers name their work and keep the review header concise.

## Current repo state

The browser creates a project through the documented API before planning. It previously supplied an internally generated slug rather than collecting a name.

## Research / references used

- The supplied plan-review screenshot.
- The backend `ProjectRequest` contract, coordinated in davdeploy PR #178.

## Work planned for the PR

- Add a required customer-facing project-name field to the plan form.
- Send that name in the existing create-project request.
- Remove the verbose generated rationale from the review header; the selected architecture and detailed evidence remain below.

## Acceptance criteria

- A customer can choose the project name before creating a plan.
- The submitted API request carries that exact name.
- The plan header no longer renders the long generated rationale.

## Acceptance status

Implemented and locally verified; pending required CI and the coordinated backend deployment.

## Tests / validation performed

`npm run verify` passed: formatting, linting, TypeScript, 44 tests, API contract, public-environment checks, production build, static-hosting checks, SPA refresh check, and dependency audit.

## Evidence files produced

- `docs/test/test47.md`

## Boundaries

The browser only collects and validates display input. The API remains responsible for validation, project creation, tenant scope, and planning.

## Follow-up work

Verify an end-to-end hosted plan once both coordinated pull requests are deployed.
