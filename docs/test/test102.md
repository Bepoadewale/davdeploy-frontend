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
- The clean-room current-head verification is recorded below.

## Pagination integration clean-room update

- Clean-room checked revision: `bc81e91aef4e233840f942e10cdf6573d6705867`.
- Focused `npx vitest run src/pages/connectedRoutes.test.tsx --reporter=dot`:
  5 passed, including cursor-based loading of older revisions.
- Current local `npm run verify`: 22 test files and 105 tests passed; format,
  lint, typecheck, API contract, public environment, production build, static
  build, SPA refresh and production dependency audit passed (0 vulnerabilities).
- Current `npm run test:browser`: 11 desktop/mobile cases passed; one
  desktop-only case was skipped by its project guard.
- Fresh worktree `/private/tmp/davdeploy-frontend-pr102-cleanroom-20261111`:
  `npm ci` installed 410 packages. After documentation-only commit `bc81e91`
  (with no package or runtime changes after install), `npm run verify` passed
  in that retained worktree with 22 test files and 105 tests plus formatting,
  lint, contract, build, static, SPA and production dependency checks.

## Execution boundary

This is a frontend presentation and export change. Tests used local fixtures. No customer workload, cloud API call, AWS resource, or infrastructure operation was run or claimed.

## Known limitations

This frontend change does not add Terraform planning, apply, health observation, teardown, pricing, or backend authorization. Existing public product claims are left as they were. GitHub Actions for the PR remains the required merge gate.

## Recorded progress clarity update — 2026-11-11

- The approved-plan timeline now puts an explicit state label on every stage and marks each as complete, in progress, not started, needs attention, or not verified.
- A short note explains that a not-started phase is a future milestone, not a button or action the customer can start from this page. Completed apply and teardown remain distinct from unverified application health and resource absence.
- Focused `npx vitest run src/pages/workflows.test.tsx --reporter=dot`: 22 passed.
- `npm run verify`: 22 test files and 105 tests passed; formatting, lint, typecheck, API contract, public environment, production build, static build, SPA refresh, and production dependency audit passed (0 production vulnerabilities).
- `npm run test:browser`: 11 desktop/mobile tests passed; one desktop-only case skipped by its project guard.
- This is presentation-only. No product claims, Team routes/assets, backend operations, customer resources, or AWS infrastructure were changed. PR #102 remains draft and is not deployed.
- Hosted PR run `43041928942` passed `verify` but its browser setup failed twice before executing tests because Ubuntu package mirror DNS resolution failed during `playwright install --with-deps chromium`. The workflow now downloads the Chromium browser without running an apt package installation; the subsequent final-head hosted retry passed as recorded below. The browser test command itself remains unchanged and unsuppressed.
- Final-head hosted run `43046086566` passed all four jobs (verify, browser acceptance, PR evidence, and secrets) at head `c6a774a`. Browser acceptance passed after removing the apt package dependency. Current-head Codex review of `c6a774a` found no major issues. PR #102 remains draft and is not deployed.

## Plan-history run status update — 2026-11-11

- `HistoryPage` now requests the latest 100 tenant-visible Nova plan-run
  summaries for each project alongside paginated plan revisions. It displays
  the newest available run state separately from the revision's approval
  badge, including a clear “ready · not applied” label.
- If the run-status request fails, revision history remains available and the
  page explains that Terraform status could not be loaded. The row links to
  the exact plan revision for apply, health, and teardown records.
- Focused `npx vitest run src/pages/connectedRoutes.test.tsx --reporter=dot`:
  5 passed. `npm run verify`: 22 test files, 105 tests passed, including
  formatting, lint, typecheck, API contract, public environment, production
  build, static build, SPA refresh, and dependency audit (0 production
  vulnerabilities).
- No customer API call or cloud operation was made. PR #102 remains a draft
  and is not deployed.
