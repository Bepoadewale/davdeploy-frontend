# AWS administrator-pilot acknowledgement

PR: [#57](https://github.com/Bepoadewale/davdeploy-frontend/pull/57)

## Problem / goal

Make the high-privilege AWS pilot choice deliberate and match the server-side acknowledgement requirement.

## Current repo state

The Connections screen offered the administrator-pilot path but did not require a user acknowledgement before creating the CloudFormation setup link.

## Research / references used

DavDeploy AWS quick-create API contract and the customer CloudFormation role boundary.

## Work planned for the PR

Add a clear warning and acknowledgement checkbox, prevent submission until it is selected, and send the acknowledgement to the API.

## Acceptance criteria

- [x] Administrator-pilot access describes its ability to modify AWS resources.
- [x] The pilot action remains unavailable until acknowledged.
- [x] The API receives the acknowledgement with the selected access mode.
- [x] Existing read-only and customer-managed-role choices are unchanged.

## Acceptance status

Local tests, build, formatting, and lint passed; pending CI, review, merge, and Cloudflare deployment.

## Tests / validation performed

Recorded in `docs/test/test57.md`.

## Evidence files produced

- `docs/test/test57.md`

## Boundaries

The browser only opens AWS's CloudFormation review page. It does not create a stack, role, or workload.

## Follow-up work

Run a separately authorised customer-cloud pilot only after product-side execution is enabled and reviewed.
