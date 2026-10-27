## Problem / goal

Align every customer-facing cloud connection entry point with the AWS-first, multi-cloud-ready Create Plan workflow.

## Current repo state

Create Plan shows AWS as available and other providers as coming soon. Connections still used generic account wording for an AWS-only route, offered no provider choice, and said local planning was available. The workspace onboarding also named AWS directly.

## Research / references used

- Existing Create Plan provider selector and AWS connection contract.
- Current backend provider boundary: only AWS can be connected and verified.
- Founder direction to prepare the experience for multiple clouds without implying unsupported functionality.

## Work planned for the PR

- Add the same provider selector and coming-soon boundary to Connections.
- Rename the AWS input and action, show provider identity on saved connections, and remove the local-planning empty state.
- Use provider-neutral onboarding language and label the current plan-region selector as AWS-specific.
- Record future provider requirements in the private backend architecture/roadmap documentation.

## Acceptance criteria

- Connections and Create Plan consistently show AWS as available and Azure, Google Cloud, and other providers as coming soon.
- No customer-facing connection screen claims a local planning target.
- AWS-specific IDs and regions are explicitly labelled.
- The frontend connection type exposes the backend provider field.
- Tests prove that only the AWS setup route is available.

## Acceptance status

Implemented and locally verified; pending CI, review, and deployment.

## Tests / validation performed

`npm run verify` is recorded in `docs/test/test53.md`.

## Evidence files produced

- `docs/test/test53.md`

## Boundaries

This does not enable an additional cloud provider. The browser only presents the AWS connection flow the backend supports and never receives provider credentials.

## Follow-up work

Enable each provider only after its backend onboarding, discovery, pricing, policy, planner, Terraform/OpenTofu rendering, execution, observation, and support paths are implemented and tested.
