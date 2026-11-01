# test96 - repository discovery request-method validation

## Commands executed

```text
npm run test -- src/pages/workflows.test.tsx
npm run verify
```

## Result

The focused workflow contains 18 passing tests and asserts that browser repository discovery calls `GET /api/v1/projects/project-1/repository-discovery`. Its standalone command exits non-zero only because global coverage thresholds apply to the whole repository.

The clean full verification cycle passed on 2026-11-01: formatting, linting, type checking, 89 tests with global coverage thresholds, API contract, public-environment validation, production build, static-hosting checks, SPA refresh checks, and production dependency audit with zero moderate-or-higher vulnerabilities.

## Execution boundary

This is static-browser validation with mocked API responses. It creates no AWS resource and does not authenticate to the hosted API.

## Known limitations

The browser test verifies the API request contract, not a live customer session. The separate AWS control-plane test provides that production evidence.
