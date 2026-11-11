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
- Clarify the approved-plan next step and avoid an unsupported future-looking lifecycle display.
- Read the exact revision's tenant-scoped Nova plan-run status so the approved
  plan page can report queued, running, ready-for-review, failed, or uncertain
  planning outcomes without implying that apply, health, or teardown happened.
- Load project-scoped customer plan revisions from the paginated backend API;
  allow customers to retrieve older revisions without relying on the
  dashboard's latest-20 snapshot.
- Match the next-step explanation to the current plan-generation state.
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
- [x] Planning-in-progress, plan-ready, failed, and uncertain statuses show
      next steps that match those outcomes.
- [x] Customer connection setup offers only read-only discovery or an existing read-only role; broad administrator access and deployment-role fields are removed.
- [x] Personal publishing allowlist, raw subject IDs, internal beta entitlement details, opaque audit-event payloads, and unnecessary plan-history comparisons are no longer shown or exported.
- [x] The Team page, route, sitemap entry, navigation link, and public assets remain available.
- [x] Settings, help, and project creation use customer-facing language and a realistic project-name example.
- [x] Production build, route/static checks, accessibility checks, and full verification pass locally.

## Acceptance status

- [x] Existing public product and availability claims are preserved.
- [x] Personal/internal customer surface, broad access setup and unsubstantiated plan details are removed or summarized safely.
- [x] Earlier clean-room verification passed; this latest pagination addition
      passed local verification, with a fresh clean-room cycle and hosted
      checks still pending.
- [x] History-page pagination consumes deployed backend PR #346; this draft
      frontend branch is not deployed.

## Tests / validation performed

- Read-only audit completed on main commit `b6cb14b`; no files or external systems changed by the audit.
- `npm run verify` passed after the implementation and export sanitization: 22 test files and 101 tests passed; formatting, lint, typecheck, API contract, public environment, production build, static build, SPA refresh, and production dependency audit passed (0 vulnerabilities).
- Focused UI run passed after export sanitization: `npx vitest run src/pages/workflows.test.tsx --reporter=dot` (1 file, 20 tests), including customer-summary export redaction.
- Codex review feedback on the approved-plan error path was addressed: failure, unknown operation, and unknown plan-review messages now point to customer support, and a regression test verifies the support link and absence of internal-record instructions.
- The approved-plan status view requests its exact revision from the backend
  history API, and the History page now requests all visible revisions using
  backend PR #346's deployed paginated API. This frontend branch remains a
  draft and is not live. No authenticated production history request was made
  during backend PR #346's release.
- Current focused test `npx vitest run src/pages/connectedRoutes.test.tsx
  --reporter=dot` passed (5 tests); `npm run verify` passed with 22 files and
  105 tests; `npm run test:browser` passed 11 desktop/mobile cases with one
  desktop-only skip. A fresh `npm ci && npm run verify` for this pagination
  integration remains to be recorded.
- A clean `npm ci` + `npm run verify` cycle passed in `/private/tmp/davdeploy-frontend-102-cleanroom` at code commit `9f04785`; exact results are in `docs/test/test102.md`.
- Required GitHub checks are pending.

## Evidence files produced

- `docs/test/test102.md` records the clean-room verification and confirms that no customer or AWS execution evidence is applicable to this presentation-only change.

## Boundaries

- This frontend PR cannot add backend plan/apply/health/teardown capability or change authorization. It must describe those boundaries honestly.
- Do not add or expose customer or developer credentials, local infrastructure, internal allowlists, or administrator-only controls.
- No public product claim, Team page, or public image is removed by this PR.

## Follow-up work

- Backend plan/apply/state/pricing/health/lifecycle work remains tracked in the private Nova goal ledger. Revisit the progress page only when those API capabilities exist.
