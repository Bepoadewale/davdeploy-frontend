# ticket100 — make the approved-plan page understandable

PR: #100 (draft)
Branch: `feat/post-approval-deployment-status`
Base: `main`

## Goal

After a workspace administrator approves a plan, show the customer one clear status view with the next real step and a dependable way back to the same record. Hide fixture controls and operator-pilot actions from the normal customer page. Never infer that planning, applying, health checks, or deletion succeeded when the API has not reported that evidence.

## Current state

- The plan page currently exposes local dry-run, desired-state, plan-contract, readiness, pilot-cloud-plan, apply, and destroy controls together after approval.
- The frontend receives a plan revision and its existing plan-review and cloud-run evidence. It does not yet have the durable Nova generated-plan run listing or the generic hosted apply, health, and destroy evidence needed to operate the full lifecycle.
- Customers can reopen a plan from the existing History page; this navigation is not made clear in the approval view.

## Work planned

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

## Validation and evidence

Runtime evidence and exact verification results are recorded in `docs/test/test100.md`.

## Boundaries and limitations

This presentation change does not add API capabilities, request or apply Terraform plans, change approvals, contact AWS, or claim deployment/health/teardown readiness. The generic saved-plan, apply, health, recovery, and destroy APIs remain separate backend milestones.

## Follow-up

Connect durable Nova plan-run status and generic lifecycle evidence when the backend exposes tenant-authorized list/status endpoints. Until then the page must remain explicit that approval is not deployment.
