# test98 - blog author access states

## Commands executed

```text
npx vitest run src/pages/BlogManagePage.test.tsx --coverage.enabled=false
npm run verify
```

## Result

Pending local validation and GitHub Actions.

## Execution boundary

Tests use mocked responses from the backend author-access endpoint. They neither change author permissions nor publish content.

## Known limitations

Tests do not verify a live Cognito identity or hosted session. The backend remains authoritative for the actual permission decision.
