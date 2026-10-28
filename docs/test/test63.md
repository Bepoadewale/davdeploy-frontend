# test63 — Authentication and guarded-plan fixture coverage

PR: [#63](https://github.com/Bepoadewale/davdeploy-frontend/pull/63)

## Execution boundary

Local Vitest fixture tests only. No hosted identity provider, backend, customer account, cloud
provider, or deployment endpoint is contacted.

## Commands and result

```sh
npx vitest run src/auth/AuthContext.local.test.tsx src/pages/workflows.test.tsx --coverage
npm run verify
```

The focused suite passed 22 tests. Full verification passed 59 tests, including formatting, lint,
typecheck, contract/public-environment/static-hosting/SPA checks, production build and dependency
audit.

## Limitations

The tests validate browser request boundaries and messages; server-side authorisation remains the
backend's responsibility.
