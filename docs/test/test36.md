# test36 — Canonical hosted frontend documentation

## Execution boundary

Documentation review only. No browser application, Cloudflare, Cognito, backend, or email system
was changed.

## Commands executed

```text
git diff --check
node scripts/check-pr-evidence.mjs
```

## Result

The public frontend documentation consistently identifies `https://davdeploy.tech` as the
canonical authenticated origin and preserves the deliberate `pages.dev` CORS exclusion.

## Known limitations

No live browser invitation or Cognito journey is executed by this documentation-only change.
