# test96 — Repository discovery request-method validation

## Clean test cycle

From `davdeploy-frontend`:

```sh
npm run test -- src/pages/workflows.test.tsx
npm run verify
```

## Expected result

The focused workflow contains 18 passing tests and asserts that browser repository discovery calls `GET /api/v1/projects/project-1/repository-discovery`. Its standalone command exits non-zero only because the repository enforces global coverage thresholds across the complete suite.

The clean full verification cycle passed on 2026-11-01: formatting, linting, type checking, 89 tests with global coverage thresholds, API contract, public-environment validation, production build, static-hosting checks, SPA refresh checks, and production dependency audit (zero moderate-or-higher vulnerabilities).

## Execution boundary

This is a browser fixture test. It creates no AWS resource and does not authenticate to the hosted API.
