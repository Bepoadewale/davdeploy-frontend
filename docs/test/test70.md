# test70 — Persistent secure browser sessions

## Commands executed

```sh
npx vitest run 'functions/api/v1/[[path]].test.ts' --coverage=false
npm run typecheck
npm run lint
npm run verify
```

## Result

The focused Pages Function fixtures passed. They cover initial token validation, host-only HttpOnly Secure SameSite cookie issuance, refresh-token exchange, upstream bearer forwarding, cookie renewal, and cross-site mutation rejection. The full frontend verification result is recorded with the PR checks.

## Execution boundary

The function tests are local fixtures with mocked API and Cognito endpoints. They do not send an email, call the production API, change Cloudflare configuration, or prove a real closed-browser recovery.

## Known limitations

Production requires the documented Pages build flag and three Function runtime values. A real browser journey is still required after the Pages deployment; it needs a Cognito email code from the account holder.
