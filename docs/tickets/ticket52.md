## Problem / goal

Use a provider-neutral label for the Create Plan cloud-account connection action, without obscuring that AWS is the currently supported setup path.

## Current repo state

Create Plan accepts an AWS account ID, then opens the existing AWS role-review flow through a button labelled `Review AWS setup`.

## Research / references used

- Founder preference for the label `Connect Account`.
- Existing AWS-only provider boundary and workflow tests.

## Work planned for the PR

- Rename the primary account action and its associated customer-facing errors to `Connect Account`.
- Update workflow coverage.

## Acceptance criteria

- The Create Plan action says `Connect Account`.
- AWS-specific setup remains clear in the surrounding status and error copy.
- Workflow tests pass.

## Acceptance status

Implemented and locally verified; pending CI, review, and deployment.

## Tests / validation performed

`npm run verify` is recorded in `docs/test/test52.md`.

## Evidence files produced

- `docs/test/test52.md`

## Boundaries

This is terminology only. It does not enable any additional cloud provider or alter connection permissions.

## Follow-up work

Replace AWS-specific setup guidance with provider-specific guidance when future integrations are enabled.
