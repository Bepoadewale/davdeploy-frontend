# ticket102 — remove internal and misleading customer UI

PR: [#102](https://github.com/Bepoadewale/davdeploy-frontend/pull/102) (draft)
Branch: `fix/customer-facing-surface-audit-102`

## Problem / goal

Review and correct customer-visible pages so they describe available capabilities accurately, avoid exposing personal/internal access details, and present only useful customer actions and evidence.

## Current repo state

A read-only source audit covered the frontend routes and production bundle boundaries at `b6cb14b`. It found public copy promising every cloud while AWS is the only implemented provider; a static Prometheus/Grafana claim on plans; an approved-plan page that shows a future lifecycle but has no execution or teardown actions; a broad AdministratorAccess pilot option available in the customer connection page; a personal Gmail author allowlist; internal execution records/raw JSON and opaque subject IDs; beta billing copy; a random project placeholder; and a founder-specific public team page. Local developer sign-in fixtures are development-gated and are not exposed in production.

## Research / references used

- Full read-only customer-route/source audit on the frontend at `b6cb14b`; audit findings are summarized in this ticket and were then addressed in the implementation.
- Frontend repository `AGENTS.md` requires a PR-numbered ticket and test evidence for runnable changes, with a clean local `npm ci` + `npm run verify` cycle for routing changes.

## Work planned for the PR

- Align public marketing and help copy with AWS-only availability and the current plan-only product boundary.
- Show monitoring only when present in plan evidence.
- Clarify the approved-plan next step and avoid an unsupported future-looking lifecycle display.
- Remove the broad-administrator pilot affordance from customer connection setup.
- Remove personal/internal allowlist details, operator records and opaque identity IDs from normal customer surfaces.
- Replace beta/internal settings language and random placeholder text.
- Remove the founder-specific Team page from public navigation and routes.

## Acceptance criteria

- [x] Public product copy describes AWS planning and approval and states that applying a deployment is not available yet.
- [x] Plan architecture no longer adds Prometheus/Grafana when the proposal does not contain it; raw JSON and internal technical-record panels are removed from plan details and exports are reduced to customer summaries.
- [x] An approved plan with no recorded operation shows approval and next steps only. Recorded plan/apply/teardown activity remains visible with health and absence limits stated.
- [x] Customer connection setup offers only read-only discovery or an existing read-only role; broad administrator access and deployment-role fields are removed.
- [x] Personal publishing allowlist, raw subject IDs, internal beta entitlement details, opaque audit-event payloads, and unnecessary plan-history comparisons are no longer shown or exported.
- [x] Founder-specific Team route and navigation link are removed. Existing personal image asset is untouched pending explicit deletion approval.
- [x] Settings, help, and project creation use customer-facing language and a realistic project-name example.
- [x] Production build, route/static checks, accessibility checks, and full verification pass locally.

## Acceptance status

- [x] Public AWS planning and non-available deployment boundaries are stated truthfully.
- [x] Personal/internal customer surface, broad access setup and unsubstantiated plan details are removed or summarized safely.
- [x] Clean-room local verification passed; hosted checks remain the merge gate.

## Tests / validation performed

- Read-only audit completed on main commit `b6cb14b`; no files or external systems changed by the audit.
- `npm run verify` passed after the implementation and export sanitization: 22 test files and 101 tests passed; formatting, lint, typecheck, API contract, public environment, production build, static build, SPA refresh, and production dependency audit passed (0 vulnerabilities).
- Focused UI run passed after export sanitization: `npx vitest run src/pages/workflows.test.tsx --reporter=dot` (1 file, 20 tests), including customer-summary export redaction.
- A clean `npm ci` + `npm run verify` cycle passed in `/private/tmp/davdeploy-frontend-102-cleanroom` at code commit `9f04785`; exact results are in `docs/test/test102.md`.
- Required GitHub checks are pending.

## Evidence files produced

- `docs/test/test102.md` records the clean-room verification and confirms that no customer or AWS execution evidence is applicable to this presentation-only change.

## Boundaries

- This frontend PR cannot add backend plan/apply/health/teardown capability or change authorization. It must describe those boundaries honestly.
- Do not add or expose customer or developer credentials, local infrastructure, internal allowlists, or administrator-only controls.
- No repository files or personal assets are deleted without explicit approval. The Team route is removed from the application, and its public image asset remains pending user direction.

## Follow-up work

- Backend plan/apply/state/pricing/health/lifecycle work remains tracked in the private Nova goal ledger. Revisit the progress page only when those API capabilities exist.
