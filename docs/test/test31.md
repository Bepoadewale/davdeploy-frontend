# test31 — Hosted authentication configuration failures

Execution boundary: clean local frontend verification. No Cognito, Cloudflare, API, or customer-workspace mutation occurred.

## Command and result

```text
npm ci
npm run verify
```

Passed formatting, linting, TypeScript, 34 tests, API-contract validation, public-environment
validation, production build, static-hosting inspection, SPA refresh validation, and the moderate
dependency audit with zero vulnerabilities.

The focused `AuthContext` regression tests verify that unavailable hosted OIDC and unavailable
Cognito email configuration fail clearly before an external identity request is attempted.
