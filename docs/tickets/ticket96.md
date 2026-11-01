# ticket96 — Fix hosted repository discovery during plan creation

## Goal

Make the browser request the documented repository-discovery endpoint with its supported HTTP method.

## Current state and references

The hosted API exposes `GET /api/v1/projects/{project_id}/repository-discovery`. The New Plan page used `POST`, producing HTTP 405 before a customer intent could be created. The defect was found during the isolated AWS end-to-end control-plane validation on 2026-11-01.

## Planned work

- Change only the browser request method to `GET`.
- Lock the request contract in the focused workflow test.

## Acceptance criteria

- New Plan requests repository discovery with `GET`.
- The existing planning workflow reaches the immutable customer-review route.
- No authentication, execution, API, or infrastructure boundary changes.

## Status

Implemented; awaiting verification and review.

## Validation and evidence

- Focused workflow test exercises the corrected request contract.
- Full repository verification is required by CI.

## Boundaries and follow-up

This changes no backend API, cloud resource, role, credential, or deployment permission. The separate authenticated AWS control-plane run remains governed by its existing plan, approval, execution, health, and destroy gates.
