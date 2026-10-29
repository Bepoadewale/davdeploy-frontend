# test68 — Silent Cognito browser renewal

## Commands executed

```sh
npm run verify
```

## Result

The full frontend suite passed: 13 test files and 70 tests. It includes direct
fixtures for Cognito refresh-token exchange, expired-session renewal, rejected
renewal cleanup, reload restoration, static hosting and public-env checks.

## Execution boundary

Local browser fixtures only. Cognito’s configured refresh-token lifetime remains
seven days; no user-pool setting is changed by this frontend pull request.

## Known limitations

Session storage intentionally does not promise persistent login after a browser
session is closed. Achieving that safely needs an API-backed HttpOnly-cookie
session rather than persistent browser bearer tokens.
