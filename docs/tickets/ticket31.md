# ticket31 — Cover unavailable hosted authentication configuration

PR: [#31](https://github.com/Bepoadewale/davdeploy-frontend/pull/31)

## Goal

Add direct regression coverage for customer-visible authentication configuration failures.

## Acceptance criteria

- [x] Hosted OIDC absence produces a clear error without redirecting a customer.
- [x] Missing Cognito email configuration produces a clear error without making an identity call.
- [x] Focused test and formatting checks pass.

## Validation

```text
npx vitest run src/auth/AuthContext.test.tsx --coverage.enabled=false
2 passed

npm run format:check
passed
```

## Boundaries

The tests are local browser-mock validation. They do not call Cognito, send email, or mutate a
customer workspace.
