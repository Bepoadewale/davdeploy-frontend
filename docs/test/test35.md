# test35 — Mobile hero gutters

## Execution boundary

Local browser and frontend verification only. No external service configuration was changed.

## Commands executed

```text
Google Chrome headless at 390 x 844
npm run verify
```

## Result

Passed. The 390 x 844 local Chrome reproduction retains 14 px gutters around the hero, and the
complete frontend verification suite passed: 39 tests, format, lint, typecheck, build, API contract,
static hosting, SPA refresh, and dependency audit.

## Known limitations

The local reproduction uses Chrome desktop headless emulating a narrow viewport; it is not a
physical-device test.
