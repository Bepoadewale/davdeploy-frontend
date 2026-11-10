# ticket100 — make the approved-plan page understandable

PR: #100 (draft)
Branch: `feat/post-approval-deployment-status`
Base: `main`

## Problem / goal

After a workspace administrator approves a plan, show the customer one clear status view with the next real step and a dependable way back to the same record. Hide fixture controls and operator-pilot actions from the normal customer page. Never infer that planning, applying, health checks, or deletion succeeded when the API has not reported that evidence.

## Current repo state

- The plan page currently exposes local dry-run, desired-state, plan-contract, readiness, pilot-cloud-plan, apply, and destroy controls together after approval.
- The frontend receives a plan revision and its existing plan-review and cloud-run evidence. It does not yet have the durable Nova generated-plan run listing or the generic hosted apply, health, and destroy evidence needed to operate the full lifecycle.
- Customers can reopen a plan from the existing History page; this navigation is not made clear in the approval view.

## Research / references used

- Repository product requirements in `AGENTS.md`: label states from backend evidence, hide non-operational controls, and keep the browser non-authoritative.
- Existing `HistoryPage` route at `/history` is the supported way to reopen a saved plan.
- Existing revision response includes plan-review and cloud-run evidence, but does not include a generic durable Nova run list or generic health/teardown evidence.

## Work planned for the PR

- Replace the large post-approval action stack with a customer-readable progress view: approval, Terraform plan, deployment, health, and teardown.
- Derive displayed progress only from backend evidence already included in the plan revision. Use plain language for known states; label absent evidence as not started or not confirmed.
- Clearly state that approval does not start deployment and identify the actual next step and current product limitation.
- Tell customers how to return to the plan from History. Keep detailed evidence available behind a disclosure.
- Add accessible UI tests for approved, pending, absent-evidence, and completed-record states.

## Acceptance criteria

- [x] An approved plan page has one clear next-step/status area, without fixture or pilot-operation buttons.
- [x] Planning, apply, health, and deletion status never appear successful without matching backend evidence.
- [x] Customers can tell where to reopen this plan and what is not yet available.
- [x] The page remains keyboard accessible and has responsive layout.
- [x] Focused tests, static checks, and build pass locally.
- [ ] PR CI passes.

## Acceptance status

The approved view has been replaced by a five-stage status view with refresh and Plan History navigation. Absent status is labeled as not started/not confirmed; local/pilot controls are hidden. Local verification passed; the fresh PR CI run is still in progress, with its evidence convention failure being corrected.

## Tests / validation performed

- Full local `npm run verify` passed (20 test files, 95 tests, lint, typecheck, API contract/public environment checks, production build, static/SPA checks, and dependency audit).
- Detailed commands and product boundary are in `docs/test/test100.md`.

## Evidence files produced

- `docs/test/test100.md`
- `docs/tickets/ticket100.md`

## Boundaries

This presentation change does not add API capabilities, request or apply Terraform plans, change approvals, contact AWS, or claim deployment/health/teardown readiness. The generic saved-plan, apply, health, recovery, and destroy APIs remain separate backend milestones.

## Follow-up work

Connect durable Nova plan-run status and generic lifecycle evidence when the backend exposes tenant-authorized list/status endpoints. Until then the page must remain explicit that approval is not deployment.
