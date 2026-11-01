# test96 — Repository discovery request-method validation

## Clean test cycle

From `davdeploy-frontend`:

```sh
npm run test -- src/pages/workflows.test.tsx
```

## Expected result

The supported repository-to-review workflow passes and asserts that browser repository discovery calls `GET /api/v1/projects/project-1/repository-discovery`.

## Execution boundary

This is a browser fixture test. It creates no AWS resource and does not authenticate to the hosted API.
