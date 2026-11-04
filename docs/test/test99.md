# test99 - blog author names, article links, and anonymous reading

## Commands executed

```text
npm exec -- vitest run src/App.test.tsx
npm exec -- prettier --check src/App.test.tsx docs/tickets/ticket99.md docs/test/test99.md
```

## Result

The anonymous-reader regression test exercises the real `/blog/:slug` route through `App` with
no profile. It verifies the article renders without the protected-route sign-in page, both
article and comments GET calls set `authenticated: false`, and the external article URL renders
as a clickable HTTP link. No production behavior changed.

- `npm exec -- vitest run src/App.test.tsx`: passed, 1 file and 11 tests.
- Prettier check for the changed test and evidence files: passed.
- `git diff --check`: passed.

## Execution boundary

This is a frontend-only test. It makes no backend, cloud, or customer-resource calls.

## Known limitations

The private backend currently ignores `author_name` and returns a fixed team name. The frontend
PR remains draft until backend persistence/API support is merged and deployed.
