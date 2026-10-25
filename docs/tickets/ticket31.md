# ticket31 — Cover unavailable hosted authentication configuration

PR: [#31](https://github.com/Bepoadewale/davdeploy-frontend/pull/31)

## Problem / goal

Add direct regression coverage for customer-visible authentication configuration failures.

## Current repo state

The hosted browser client has clear configuration guards, but its provider-level failure paths were
not directly tested.

## Research / references used

- Existing `AuthProvider`, Cognito email adapter, and workspace-session tests.
- Hosted deployment configuration and API/Cognito boundary review.

## Work planned for the PR

- Add focused provider regression tests for unavailable OIDC and Cognito email configuration.

## Acceptance criteria

- [x] Hosted OIDC absence produces a clear error without redirecting a customer.
- [x] Missing Cognito email configuration produces a clear error without making an identity call.
- [x] Focused test and formatting checks pass.

## Acceptance status

All acceptance criteria are met.

## Tests / validation performed

```text
npx vitest run src/auth/AuthContext.test.tsx --coverage.enabled=false
2 passed

npm run format:check
passed
```

## Evidence files produced

- `docs/test/test31.md`

## Boundaries

The tests are local browser-mock validation. They do not call Cognito, send email, or mutate a
customer workspace.

## Follow-up work

Add a separately controlled real-browser acceptance journey once a test inbox and a designated test
workspace are available.
