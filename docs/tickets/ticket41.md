# ticket41 — Link recent projects and clarify the audit trail

PR: [#41](https://github.com/Bepoadewale/davdeploy-frontend/pull/41)

## Problem / goal

The dashboard showed recent projects as static rows even when a matching plan draft existed. The
adjacent activity list used technical event names and the vague label “Latest evidence,” making its
role as the customer-visible audit trail unclear.

## Current repo state

Dashboard responses include projects, plan revisions with project IDs, and recent audit events. A
dedicated Activity route already provides searchable audit evidence and event detail.

## Research / references used

- Controlled screenshot of the populated administrator overview.
- Dashboard response contract and Activity page behavior.
- Existing accessible Link-based plan and audit navigation patterns.

## Work planned for the PR

- Link every recent project to its matching latest plan, or the plan-creation flow when none exists.
- Make linked project rows visibly interactive.
- Rename the activity summary to “Audit trail” and “Latest recorded changes.”
- Humanize dotted and underscored audit action names and link entries to the full audit trail.

## Acceptance criteria

- [x] A project with a matching plan revision opens that review record directly.
- [x] Projects without a plan still lead to the safe plan-creation route.
- [x] The dashboard clearly identifies audit events and links to the detailed audit trail.
- [x] Automated route coverage verifies the new links and labels.

## Acceptance status

Implementation is complete pending local and hosted verification.

## Tests / validation performed

See `docs/test/test41.md`.

## Evidence files produced

- `docs/test/test41.md`

## Boundaries

This is a frontend navigation and wording improvement only. It does not change project ownership,
plan selection, audit-event contents, authorization, or any backend API.

## Follow-up work

If projects can later have many revisions, add an explicit latest-revision marker from the backend
rather than relying on the dashboard plan order.
