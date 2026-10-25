# test32 — Hosted authentication callback coverage

## Execution boundary

Clean local frontend verification. No external identity, API, Cloudflare, email, or customer data
was used or changed.

## Commands executed

```text
npm ci
npm run verify
```

## Result

Passed. The callback-page tests cover exactly-once completion, the customer-visible pending and
failure states, and redirect after workspace resolution. The full suite also validates formatting,
linting, types, API contract, production build, static hosting, SPA refresh, public configuration,
and dependency audit.

## Known limitations

This does not prove a live Cognito sign-in or invitation email delivery journey.
