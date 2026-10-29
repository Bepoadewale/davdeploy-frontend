# test70 — Persistent secure browser sessions

## Commands executed

```sh
npx vitest run 'functions/api/v1/[[path]].test.ts' --coverage=false
npm run typecheck
npm run lint
npm run verify
```

## Result

The focused Pages Function fixtures passed. They cover initial token validation, host-only HttpOnly
Secure SameSite cookie issuance, refresh-token exchange, upstream bearer forwarding, cookie renewal,
and cross-site mutation rejection. `npm run verify` passed 14 test files / 73 tests, browser
acceptance passed (7 tests, 1 intentional skip), and pull-request plus `main` CI passed.

The controlled production check also passed: Cognito email OTP returned a session, the production
Function accepted it at `/api/v1/auth/browser-session` with HTTP 204, and a separate request using
only the resulting secure cookies reached `/api/v1/me` with HTTP 200.

## Execution boundary

The function fixtures are local and mocked. The recorded production check used a controlled founder
account and did not create, change, or delete customer resources. It verifies the HTTP cookie
contract, not visual browser close/reopen behavior on a specific device.

## Known limitations

The Pages build flag and three runtime values are configured. The founder completed the visual
close/reopen/sign-out journey on October 29, 2026. Browser/device-specific variations are not
exhaustively tested, but no implementation blocker remains.
