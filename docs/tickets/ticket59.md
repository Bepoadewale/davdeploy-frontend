# Customer evidence, support, and provider-boundary experience

PR: [#59 — Customer evidence, support, and provider-boundary experience](https://github.com/Bepoadewale/davdeploy-frontend/pull/59)
Branch: `feat/customer-evidence-support`

## Problem / goal

Make customer-facing evidence, support, provider status, and execution boundaries clearer while
improving direct coverage of authentication, plan review, errors, and responsive layouts.

## Current repo state

Fixture-backed browser acceptance covers sign-in, Connections, plan setup, errors, and mobile
navigation. Direct tests for the authentication provider and plan review remain comparatively
light, and the browser has no downloadable plan/audit evidence view or structured support-request
experience.

## Research / references used

Current frontend routes, backend API contract, customer-beta boundary, and fixture browser suite.

## Work planned for the PR

Add fixture-only evidence download/grouping and support UX, make provider/execution states clearer,
and extend direct component tests without enabling a provider integration or cloud execution.

## Acceptance criteria

- [x] Users can download browser-rendered plan/audit evidence without exposing secrets.
- [x] Plans and activity can be grouped/filtered by project and environment where the API provides it.
- [x] Support guidance creates no fake ticket or deployment state and exposes the public contact path.
- [x] AWS is the only operational provider; future providers remain clearly unavailable.
- [x] Auth, plan, errors, and responsive layouts receive direct test coverage.

## Acceptance status

Implementation complete locally; full verification and PR CI are pending.

## Tests / validation performed

Will be recorded in `docs/test/test59.md`.

## Evidence files produced

- `docs/test/test59.md`

## Boundaries

No hosted identity, email, customer cloud account, provider credential, public GitHub webhook, or
customer workload is contacted, created, or changed.

## Follow-up work

Record the controlled live browser acceptance journey with a dedicated test inbox.
