# ticket63 — Extend authentication and guarded-plan coverage

PR: [#63 — Extend authentication and guarded-plan coverage](https://github.com/Bepoadewale/davdeploy-frontend/pull/63)
Branch: `test/auth-plan-coverage`

## Problem / goal

Cover remaining customer-visible authentication failure and guarded execution-confirmation paths
without changing authorisation or cloud behaviour.

## Current repo state

Direct fixture tests cover email sign-in, verified signup, plan review, and basic guarded-plan
presentation. AuthContext and PlanPage retain untested error and confirmation branches.

## Research / references used

`AuthContext.tsx`, `PlanPage.tsx`, current fixture suite and product execution boundary.

## Work planned for the PR

Add fixture-only direct tests for local sign-in failure, failed code verification, declined guarded
execution confirmation, and the exact reviewed-request payload.

## Acceptance criteria

- [x] Authentication errors remain plain English and clear the token.
- [x] Guarded execution cannot make an API request without exact confirmation.
- [x] Confirmed guarded execution sends only the existing reviewed request contract.
- [x] Full frontend test and verification suites pass.

## Acceptance status

Completed: fixture coverage improved without changing runtime behaviour or provider capability.

## Tests / validation performed

`npx vitest run src/auth/AuthContext.local.test.tsx src/pages/workflows.test.tsx --coverage`
passed: 22 tests. `npm run verify` passed: 59 tests, formatting, lint, typecheck, API-contract,
public-environment, production static build, SPA refresh and dependency audit checks.

## Evidence files produced

`docs/test/test63.md` will record the fixture-only test command and result.

## Boundaries

No production identity provider, customer account, cloud resource, credential, webhook, or live
execution is contacted or changed.

## Follow-up work

Add browser-level OIDC redirect/callback coverage only with a controlled hosted identity fixture.
