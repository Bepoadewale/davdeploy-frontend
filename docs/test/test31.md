# test31 — Hosted authentication configuration failures

## Execution boundary

Clean local frontend verification. No Cognito, Cloudflare, API, or customer-workspace mutation occurred.

## Commands executed

```text
npm ci
npm run verify
```

## Result

Passed formatting, linting, TypeScript, 34 tests, API-contract validation, public-environment
validation, production build, static-hosting inspection, SPA refresh validation, and the moderate
dependency audit with zero vulnerabilities.

The focused `AuthContext` regression tests verify that unavailable hosted OIDC and unavailable
Cognito email configuration fail clearly before an external identity request is attempted.

## Known limitations

The tests use local browser mocks and do not prove a live Cognito email or invitation journey.
