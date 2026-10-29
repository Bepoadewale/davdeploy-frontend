# test78 - Public support contact link

## Commands executed

```sh
npx vitest run src/pages/PublicInformationPages.test.tsx --coverage=false
npm run verify
```

## Result

The public footer fixture asserts the exact support mail link, and the full verification suite passed locally.

## Execution boundary

Local frontend validation only. No email is sent and no external service is changed.

## Known limitations

The mail link opens the visitor's configured email application. It does not add an on-site contact form.
