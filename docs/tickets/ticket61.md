# Activity grouping, support lifecycle, and boundary coverage

PR: [#61 — Support history and Activity grouping](https://github.com/Bepoadewale/davdeploy-frontend/pull/61)
Branch: `feat/support-activity-boundaries`

## Problem / goal

Complete project/environment Activity grouping, expose workspace-scoped support request history and
status, and deepen direct authentication/plan boundary coverage without changing the future-facing
marketing direction.

## Current repo state

Activity filtered by project/environment but grouped only by date. Support creation was visible but
not its history/status. The public homepage intentionally presents the multi-cloud destination;
authenticated product surfaces already state that AWS is the only active provider.

## Research / references used

Current API contract, tenant support model, Activity screen, authentication test boundary and
provider-status copy in Create Plan/Help.

## Work planned for the PR

Group audit evidence by project, environment and date; display support history/status with
workspace-manager controls; add direct email-auth and gated-plan coverage; retain truthful
authenticated AWS-only messaging.

## Acceptance criteria

- [x] Activity has project, environment and date grouping in addition to filters/export.
- [x] A member can view only their own support history; workspace managers can update state.
- [x] Auth email success/failure and pilot gating have direct fixture coverage.
- [x] Authenticated screens keep non-AWS providers explicitly unavailable while public marketing remains future-facing.
- [ ] Full validation and CI pass.

## Acceptance status

Implementation complete locally; validation and CI are pending.

## Tests / validation performed

Recorded in `docs/test/test61.md`.

## Evidence files produced

- `docs/test/test61.md`

## Boundaries

No browser receives cloud credentials. No public webhook, cloud apply/destroy, customer email or
provider integration is enabled.

## Follow-up work

Live customer support operations, customer-cloud execution and non-AWS providers remain separately
authorised work.
