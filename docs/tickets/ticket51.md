## Problem / goal

Make Create Plan target the customer's chosen cloud account instead of offering a local planning target, while making the future multi-cloud path clear without implying unsupported providers work today.

## Current repo state

The backend already has tenant-scoped AWS connection, role-review, and verification endpoints. Create Plan previously selected from saved connections and exposed a local planning fallback.

## Research / references used

- Existing frontend cloud-connection contract and AWS Quick Create flow.
- Backend planning requirement that a selected connection be verified before customer inventory is used.
- Founder requirements for direct account-ID entry and visible AWS, Azure, Google Cloud, and other provider choices.

## Work planned for the PR

- Add a provider selector to Create Plan, with AWS enabled and future providers visibly marked coming soon.
- Replace the local/saved-cloud selector with direct AWS account-ID entry.
- Start the existing AWS role-review flow from that account ID and bind plans only to a verified matching connection.
- Add focused workflow coverage and plain-English errors.

## Acceptance criteria

- Create Plan has no local planning target.
- A customer can enter a 12-digit AWS account ID and begin the existing safe AWS setup from the page.
- A plan only uses a verified connection for that AWS account.
- Azure, Google Cloud, and other providers are visible but cannot be mistaken for available integrations.

## Acceptance status

Implemented and locally verified; pending CI, review, and deployment.

## Tests / validation performed

`npm run verify` is recorded in `docs/test/test51.md`.

## Evidence files produced

- `docs/test/test51.md`

## Boundaries

This does not add Azure, Google Cloud, or other backend provider integrations. It does not collect cloud credentials in the browser. Existing backend verification remains required before an AWS account can be used for a plan.

## Follow-up work

Add provider-specific identity, discovery, inventory, pricing, policy, and execution adapters before enabling each future provider.
