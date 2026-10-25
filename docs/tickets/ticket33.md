# ticket33 — Cover connected-route acceptance states

PR: [#33](https://github.com/Bepoadewale/davdeploy-frontend/pull/33)

## Problem / goal

Add local browser-mock coverage for authenticated routes that lead a customer through GitHub/App
review, customer-cloud setup, and plan-history inspection.

## Current repo state

The supported planning workflow had direct coverage, but Connections and History had little direct
coverage for their customer-visible success and validation states.

## Research / references used

- `ConnectionsPage`, `HistoryPage`, and existing authenticated workflow tests.
- The API contract's read-only GitHub installation and customer-cloud setup boundaries.

## Work planned for the PR

- Test safe GitHub installation review and cloud-account validation/setup.
- Test plan-history filtering and immutable revision comparison.
- Record this as a local browser-mock acceptance layer, not a live Cognito test.

## Acceptance criteria

- [x] Invalid cloud account input fails before an API call.
- [x] A valid account opens only the backend-provided provider review URL.
- [x] GitHub installation authorization remains an explicit external review link.
- [x] Customers can filter and compare persisted plan metadata locally.

## Acceptance status

All acceptance criteria are met.

## Tests / validation performed

See `docs/test/test33.md`.

## Evidence files produced

- `docs/test/test33.md`

## Boundaries

Tests use browser/API mocks. They never create a cloud role, install a GitHub App, send email, or
call Cognito.

## Follow-up work

Run the same journey against `davdeploy.tech` after a controlled inbox and invitation delivery are
available.
