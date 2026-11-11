# PR #102 frontend verification

## Source

- Repository: `Bepoadewale/davdeploy-frontend`
- Clean-room source commit: `9f04785` (`Make customer-facing pages clear and truthful`)
- Latest local verification source: `03f994e` (`Explain Nova plan review next steps`)
- Branch: `fix/customer-facing-surface-audit-102`

## Commands executed

- Worktree: `/private/tmp/davdeploy-frontend-102-cleanroom`, detached at `9f04785`.
- `npm ci` (410 packages installed; no dependency or lockfile changes).
- `npm run verify` from the clean worktree.
- Focused UI test: `npx vitest run src/pages/workflows.test.tsx --reporter=dot` (21 tests passed).
- Latest full local verification at `e14df47`: `npm run verify` passed with 22 test files and 102 tests, lint, typecheck, API contract, public environment, production build, static build, SPA refresh, and production-only dependency audit (0 vulnerabilities).
- Latest browser acceptance at `e14df47`: `npm run test:browser` passed 11 desktop/mobile tests; one desktop-only/mobile-only counterpart was skipped by its project guard.
- Nova plan-status integration: `npx vitest run src/pages/workflows.test.tsx`
  passed 22 tests; `npm run verify` passed 22 test files and 104 tests,
  formatting, lint, typecheck, API contract, public environment, production
  build, static build, SPA refresh, and production-only dependency audit
  (0 vulnerabilities).
- Latest copy/state clarification verification at `03f994e`: `npm run verify`
  passed 22 test files and 104 tests with all static, contract, build, and
  production dependency checks passing.
- Clean-room current-source check at `3646237`: `npm ci && npm run verify`
  passed with 22 test files and 104 tests and all verification stages above.
- Browser acceptance at `3646237`: `npm run test:browser` passed 11 desktop
  and mobile cases; one desktop-only case was skipped by its project guard.

## Result

- Clean-room `npm run verify` passed: Prettier, ESLint, and TypeScript checks; 22 test files and 101 tests; API contract and public-environment checks; production build; static-hosting and single-page-app refresh checks.
- Existing public product claims, the Team page, route, sitemap entry, navigation link, and assets remain preserved.
- Production-only dependency audit: 0 vulnerabilities. `npm ci` reported 9 moderate development-dependency advisories.
- GitHub Actions for the latest pushed commit remain the required merge gate.
- The customer page requests Nova status for the exact revision and labels
  `PLAN_READY_REVIEW_ONLY` as ready for review and not applied. The backend
  status API and paginated revision-history API are deployed in backend PR
  #346. No authenticated production customer history request was made during
  that release, and this frontend draft is not deployed.

## Current draft update — paginated plan history

- `HistoryPage` loads the first page of each project through
  `/api/v1/projects/{project_id}/customer-plan-revisions` and offers a
  per-project “Load older revisions” action using the returned cursor.
- Search and status filters apply to loaded revisions; the page explains when
  older revisions remain unloaded. Permission and session errors have plain
  customer-facing messages.
- Focused `npx vitest run src/pages/connectedRoutes.test.tsx --reporter=dot`:
  5 passed.
- `npm run verify`: 22 test files and 105 tests passed; formatting, lint,
  typecheck, API contract, public environment, production build, static build,
  SPA refresh, and production dependency audit passed (0 vulnerabilities).
- `npm run test:browser`: 11 desktop/mobile cases passed; one desktop-only
  case was skipped by its project guard.
- A fresh `npm ci && npm run verify` is required before treating this new API
  contract use as clean-room verified.

## Pagination integration clean-room update

- Current branch commit: pending implementation commit.
- Focused `npx vitest run src/pages/connectedRoutes.test.tsx --reporter=dot`:
  5 passed, including cursor-based loading of older revisions.
- Current local `npm run verify`: 22 test files and 105 tests passed; format,
  lint, typecheck, API contract, public environment, production build, static
  build, SPA refresh and production dependency audit passed (0 vulnerabilities).
- Current `npm run test:browser`: 11 desktop/mobile cases passed; one
  desktop-only case was skipped by its project guard.
- Fresh isolated `npm ci && npm run verify`: pending after the implementation
  commit.

## Execution boundary

This is a frontend presentation and export change. Tests used local fixtures. No customer workload, cloud API call, AWS resource, or infrastructure operation was run or claimed.

## Known limitations

This frontend change does not add Terraform planning, apply, health observation, teardown, pricing, or backend authorization. Existing public product claims are left as they were. GitHub Actions for the PR remains the required merge gate.
