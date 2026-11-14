# ticket102 — refine customer-facing workflows and evidence

PR: [#102](https://github.com/Bepoadewale/davdeploy-frontend/pull/102) (draft)
Branch: `fix/customer-facing-surface-audit-102`

## Problem / goal

Review customer-facing routes to reduce internal-only data and controls, make operation status understandable, and keep existing public product claims unchanged.

## Current repo state

A read-only source audit covered the frontend routes and production bundle boundaries at `b6cb14b`. It found public copy promising every cloud while AWS is the only implemented provider; a static Prometheus/Grafana claim on plans; an approved-plan page that shows a future lifecycle but has no execution or teardown actions; a broad AdministratorAccess pilot option available in the customer connection page; a personal Gmail author allowlist; internal execution records/raw JSON and opaque subject IDs; beta billing copy; a random project placeholder; and a founder-specific public team page. Local developer sign-in fixtures are development-gated and are not exposed in production.

## Research / references used

- Full read-only customer-route/source audit on the frontend at `b6cb14b`; audit findings are summarized in this ticket and were then addressed in the implementation.
- Frontend repository `AGENTS.md` requires a PR-numbered ticket and test evidence for runnable changes, with a clean local `npm ci` + `npm run verify` cycle for routing changes.

## Work planned for the PR

- Preserve existing public marketing, availability, and roadmap claims.
- Show monitoring only when present in plan evidence.
- Lead the approved-plan page with the current status and next step; keep the complete lifecycle timeline available in a collapsed details section so future phases do not compete with current activity.
- Read the exact revision's tenant-scoped Nova plan-run status so the approved
  plan page can report queued, running, ready-for-review, failed, or uncertain
  planning outcomes without implying that apply, health, or teardown happened.
- When lifecycle activity exists, label each displayed stage as complete,
  in progress, not started, needs attention, or not verified; explain that a
  not-started stage is a future milestone and not an action available here.
- Load project-scoped customer plan revisions from the paginated backend API;
  allow customers to retrieve older revisions without relying on the
  dashboard's latest-20 snapshot. Show the latest available Nova plan-run
  status beside each revision and keep approval state distinct from planning
  state.
- Show workspace administrators the separate plan-only role setup action only
  when the backend confirms the verified discovery connection and setup gate
  are ready. Let them return to verify the role identity, and state clearly
  that effective AWS permissions are not attested.
- Match the next-step explanation to the current plan-generation state.
- Show out-of-scope Nova responses as a clear customer-facing message instead
  of a generic plan failure or hidden technical detail.
- Remove the broad-administrator pilot affordance from customer connection setup.
- Remove personal/internal allowlist details, operator records and opaque identity IDs from normal customer surfaces.
- Replace beta/internal settings language and random placeholder text.
- Keep the Team page, its public route, navigation link, sitemap entry, and existing public assets.

## Acceptance criteria

- [x] Existing public product and availability claims remain unchanged.
- [x] Plan architecture no longer adds Prometheus/Grafana when the proposal does not contain it; raw JSON and internal technical-record panels are removed from plan details and exports are reduced to customer summaries.
- [x] An approved plan with no recorded operation shows approval and next steps only. Recorded plan/apply/teardown activity remains visible with health and absence limits stated; failed or unclear states direct customers to workspace support rather than hidden technical records.
- [x] The approved-plan page requests status for its exact revision, refreshes
      the status with the rest of the plan, and labels a ready Terraform plan as
      review-only and unapplied.
- [x] Plan history loads revision pages per project and lets customers load
      older revisions, while making clear that search/status filters cover the
      revisions loaded so far.
- [x] Plan history shows each visible revision's latest available Nova run
      status without confusing a ready plan with deployment; a run-history
      lookup failure leaves revision history available and reports that status
      could not be loaded.
- [x] The project revision-history and generated-plan-run operations, including
      pagination and exact-revision filtering, are present in the frontend's
      API snapshot and required by the contract checker.
- [x] Project history also shows the latest exact-plan apply state per
      revision when the backend apply-history endpoint is available. Apply
      completion is explicitly not presented as application health or teardown.
- [x] If apply-history is unavailable, revision and plan history remain
      visible and the customer sees a clear status-only warning.
- [x] Planning-in-progress, plan-ready, failed, and uncertain statuses show
      next steps that match those outcomes.
- [x] Approved-plan detail loads exact-plan apply history for that revision,
      refreshes it with plan status, and distinguishes apply completion from
      independently verified application health. Status lookup failures do
      not claim that apply has not started.
- [x] An out-of-scope response such as stock advice explains that DavDeploy
      plans infrastructure for software workloads and asks for a deployment
      request; the fixed backend detail is not shown as a technical error.
- [x] Recorded lifecycle progress has distinct, accessible stage labels;
      upcoming apply/health/teardown steps are clearly marked and do not look
      like operational controls.
- [x] When lifecycle activity is recorded, show the current status and next-step guidance before the stage history; keep the complete five-stage history available through an accessible disclosure.
- [x] Customer connection setup offers only read-only discovery or an existing read-only role; broad administrator access and deployment-role fields are removed.
- [x] Personal publishing allowlist, raw subject IDs, internal beta entitlement details, opaque audit-event payloads, and unnecessary plan-history comparisons are no longer shown or exported.
- [x] The Team page, route, sitemap entry, navigation link, and public assets remain available.
- [x] Settings, help, and project creation use customer-facing language and a realistic project-name example.
- [x] Production build, route/static checks, accessibility checks, and full verification pass locally.

## Acceptance status

- [x] Existing public product and availability claims are preserved.
- [x] Personal/internal customer surface, broad access setup and unsubstantiated plan details are removed or summarized safely.
- [x] Clean-room `npm ci` + `npm run verify` passed on the latest source head;
      final hosted checks passed in run `43046086566`.
- [x] History-page pagination consumes deployed backend PR #346; this draft
      frontend branch is not deployed.
- [x] History rows show the latest available Nova plan status from the
      tenant-scoped run-history API; approval state remains a separate badge.
- [x] The Connections page lets only workspace administrators start the
      separate plan-only role setup when the backend says it is available, then
      verify the role; it distinguishes account identity verification from
      effective-permission attestation.
- [x] The approved-plan page leads with the current status and what happens
      next. The full lifecycle timeline remains available in an accessible,
      collapsed “View all deployment stages” section.
- [x] Approved-plan detail reads the latest exact-plan apply run for its
      revision and labels successful apply as awaiting independent health
      evidence; unavailable apply history is reported without implying no apply.

## Tests / validation performed

- Exact-plan apply status on the approved-plan detail was added after the
  prior status-first work. Focused workflow tests: 25 passed, including
  successful apply with health still unverified and an unavailable-status
  case that does not claim deployment has not started. `npm run verify` passed
  with 22 test files and 110 tests; format, lint, typecheck, API contract,
  public environment, production build, static hosting, SPA refresh, and
  production dependency audit passed (0 production vulnerabilities).
- Full `npm run test:browser` passed 9 tests and failed 4 mobile onboarding
  cases (Team/About visibility, homepage logo, and two local fixture sign-ins);
  these unrelated mobile failures occur in existing browser tests and do not
  touch the approved-plan route. The approved-plan browser case passed on both
  desktop and mobile through a focused Playwright run (2 passed).

- Read-only audit completed on main commit `b6cb14b`; no files or external systems changed by the audit.
- `npm run verify` passed after the implementation and export sanitization: 22 test files and 101 tests passed; formatting, lint, typecheck, API contract, public environment, production build, static build, SPA refresh, and production dependency audit passed (0 vulnerabilities).
- Out-of-scope feedback: `npx vitest run src/pages/workflows.test.tsx --reporter=dot` — 23 passed; `npm run verify` — 22 test files and 108 tests passed, plus formatting, lint, typecheck, API contract, public environment, production build, static build, SPA refresh, and production dependency audit (0 vulnerabilities).
- Focused UI run passed after export sanitization: `npx vitest run src/pages/workflows.test.tsx --reporter=dot` (1 file, 20 tests), including customer-summary export redaction.
- Codex review feedback on the approved-plan error path was addressed: failure, unknown operation, and unknown plan-review messages now point to customer support, and a regression test verifies the support link and absence of internal-record instructions.
- The approved-plan status view requests its exact revision from the backend
  history API, and the History page now requests all visible revisions using
  backend PR #346's deployed paginated API. This frontend branch remains a
  draft and is not live. No authenticated production history request was made
  during backend PR #346's release.
- The recorded-activity timeline now adds a visible status label to each
  stage, visually distinguishes active/completed/unverified/future steps, and
  explains that “Not started” does not mean a customer can trigger the action.
  The page continues to show lifecycle checkpoints when there is recorded
  activity so customers can revisit plan, deployment, health, and teardown
  status without implying unsupported operations.
- Focused `npx vitest run src/pages/workflows.test.tsx --reporter=dot` passed
  (22 tests). `npm run verify` passed (22 files, 105 tests, all static/build
  checks, production dependency audit with 0 vulnerabilities). `npm run
test:browser` passed 11 desktop/mobile cases with one desktop-only skip.
  This PR remains a draft and is not deployed.
- Hosted run `43041928942` passed verification but the browser job failed
  before tests twice while `playwright install --with-deps` tried to retrieve
  Ubuntu packages from a DNS-failing mirror. The browser setup now downloads
  only the pinned Chromium binary. Final-head CI run `43046086566` passed all
  four frontend jobs, including browser acceptance. Current-head Codex review
  of `c6a774a` found no major issues. The PR remains a draft and is not live.
- Current focused test `npx vitest run src/pages/connectedRoutes.test.tsx
--reporter=dot` passed (5 tests); `npm run verify` passed with 22 files and
  105 tests; `npm run test:browser` passed 11 desktop/mobile cases with one
  desktop-only skip. Fresh worktree `npm ci` installed 410 packages and
  `npm run verify` passed at `bc81e91`.
- A clean `npm ci` + `npm run verify` cycle passed in `/private/tmp/davdeploy-frontend-102-cleanroom` at code commit `9f04785`; exact results are in `docs/test/test102.md`.
- Required GitHub checks passed all four jobs in run `43046086566` on head
  `c6a774a`; current-head Codex review found no major issues. PR #102 remains
  draft per the user's instruction and is not deployed.
- Plan history now loads the latest 100 Nova plan-run summaries per project
  alongside paginated revision history. Each revision can display its newest
  available planning state (preparing, running, ready/not applied, failed, or
  needs confirmation). If the status request fails, revision history still
  loads and explains that the status is unavailable. The detail page remains
  the place to inspect apply, health, and teardown records.
- Focused `npx vitest run src/pages/connectedRoutes.test.tsx --reporter=dot`:
  5 passed. Full `npm run verify`: 22 files and 105 tests passed; formatting,
  lint, typecheck, API contract, public environment, production build,
  static/SPA checks, and production dependency audit passed (0 vulnerabilities).
- `npm run test:browser` passed 11 desktop/mobile cases; one desktop-only case
  was skipped by its project guard. Run status text is styled separately from
  the revision approval badge.
- This change remains on draft PR #102 and has not been deployed.
- Focused `npx vitest run src/pages/connectedRoutes.test.tsx --reporter=dot`
  covers administrator-only setup, backend-gated availability, Quick Create,
  plan-role verification, and honest permission wording.
- Full `npm run verify` passed with 22 files and 107 tests. `npm run
test:browser` passed 11 desktop/mobile tests; one desktop-only case was
  skipped by its project guard. The setup flow remains dependent on the
  backend readiness field in PR #351 being deployed and its
  plan-role flag/configuration being enabled. Until then the action stays
  hidden.

## Evidence files produced

- `docs/test/test102.md` records the clean-room verification and confirms that no customer or AWS execution evidence is applicable to this presentation-only change.

## Boundaries

- This frontend PR cannot add backend plan/apply/health/teardown capability or change authorization. It must describe those boundaries honestly.
- Do not add or expose customer or developer credentials, local infrastructure, internal allowlists, or administrator-only controls.
- No public product claim, Team page, or public image is removed by this PR.

## Follow-up work

- Backend plan/apply/state/pricing/health/lifecycle work remains tracked in the private Nova goal ledger. Revisit the progress page only when those API capabilities exist.

## Exact-plan apply status history update — 2026-11-13

- The project History page now requests the project-scoped exact-plan apply
  history and displays the latest apply state beside the matching plan
  revision. It uses clear queued, running, failed, uncertain, and cancelled
  wording; successful Terraform apply is labelled “health not verified.”
- An apply-history lookup failure does not hide revisions or Nova plan status.
  The page explains that only apply history is unavailable.
- The frontend OpenAPI snapshot and contract checker now include the two
  backend apply-status operations and the project-history pagination filters.
- This UI depends on backend PR #399, which is open as a draft and has not
  been merged or deployed. The feature therefore has no hosted customer
  evidence and may report apply history unavailable until the backend route
  is released.
- Focused `npx vitest run src/pages/connectedRoutes.test.tsx --reporter=dot`:
  7 passed. `npm run verify`: 22 files and 108 tests passed; format, lint,
  typecheck, API contract, public environment, production build, static/SPA
  checks, and production dependency audit passed (0 vulnerabilities).
- `npm run test:browser`: 13 passed, one existing project-guarded desktop
  case skipped. The browser suite verifies the approved-plan status flow;
  apply-history states are covered by the focused page test with local API
  fixtures.
- No authenticated customer API request, AWS call, plan, apply, or
  infrastructure mutation was made. PR #102 remains a draft and is not live.

## Current-status-first plan progress update — 2026-11-11

- When a plan has recorded activity, the page now presents the latest status
  and its next-step guidance first. The complete approval, Terraform plan,
  deployment, health, and teardown timeline is retained under the collapsed
  “View all deployment stages” disclosure.
- The disclosure explains that future “Not started” steps are informational,
  not actions the customer can trigger. Refresh and Plan history links remain
  available outside the disclosure.
- The frontend API snapshot now includes both project-scoped history endpoints
  from the backend OpenAPI contract. The contract checker requires `limit` and
  `cursor` for revision history and also requires `revision_id` for plan-run
  filtering.
- Focused `npx vitest run src/pages/workflows.test.tsx --reporter=dot` passed
  (22 tests). `npm run verify` passed (22 files, 107 tests; formatting, lint,
  typecheck, contract, production build, static/SPA checks, and dependency
  audit with 0 production vulnerabilities). `npm run test:browser` passed 13
  desktop/mobile cases, including the new page-flow check; one project-guarded
  desktop skip remains.
- Backend PR #351 has merged, but its runtime deployment is still pending.
  The plan-role setup action remains hidden while the corresponding feature
  gate and configuration are disabled.
- This is a presentation change only. No claims, Team page/assets/sitemap,
  API operations, customer data, or AWS resources were removed or changed.
  PR #102 remains a draft and is not deployed.
