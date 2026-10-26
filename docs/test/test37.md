# test37 — Invited-user session resolution

## Execution boundary

Local frontend unit and verification checks only. No production browser, Cognito, API, email, DNS,
or cloud configuration is changed by this test evidence.

## Commands executed

```text
npm test -- --run src/auth/workspaceSession.test.ts
npm ci
npm run verify
```

## Result

Passed. The invited-user path makes one direct onboarding request, and the no-invitation fallback
still requests `/me` before onboarding only after a genuine 403. A clean `npm ci` and complete
`npm run verify` cycle passed: 40 tests, format, lint, typecheck, API contract, public-environment,
production build, static-hosting, SPA-refresh, and dependency-audit checks.

## Known limitations

The improvement removes one browser-to-API round trip but does not eliminate AWS Lambda or Aurora
cold-start latency after idle periods.
