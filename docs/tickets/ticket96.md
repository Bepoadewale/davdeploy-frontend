# ticket96 - fix hosted repository discovery during plan creation

PR: [#96](https://github.com/Bepoadewale/davdeploy-frontend/pull/96)

## Problem / goal

Make the browser call the documented repository-discovery endpoint with its supported HTTP method.

## Current repo state

The hosted API exposes `GET /api/v1/projects/{project_id}/repository-discovery`. The New Plan page used `POST`, producing HTTP 405 before a customer intent could be created.

## Research / references used

- Hosted API route in the private backend: `apps/api/src/davdeploy/main.py`.
- Existing New Plan workflow and request-contract tests.
- The isolated hosted AWS control-plane validation on 2026-11-01, which revealed the 405 response.

## Work planned for the PR

- Change only the browser request method to `GET`.
- Lock the request contract in the focused workflow test.

## Acceptance criteria

- [x] New Plan requests repository discovery with `GET`.
- [x] The supported planning workflow reaches the immutable customer-review route.
- [x] No authentication, execution, API, or infrastructure boundary changes.
- [x] Clean full local verification passes.

## Acceptance status

Implementation and clean local verification are complete. Required GitHub CI and Pages publication are pending.

## Tests / validation performed

See `docs/test/test96.md`.

## Evidence files produced

`docs/test/test96.md`

## Boundaries

This is a browser-only request-method correction. It changes no backend API contract, cloud resource, role, credential, or deployment permission.

## Follow-up work

Continue the separately governed AWS control-plane run through image build, service plan, health evidence, and destroy after the reviewed foundation apply.
