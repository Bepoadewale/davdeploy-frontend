# Browser acceptance, onboarding, and support hardening

PR: pending

## Problem / goal

Increase confidence in the authenticated browser boundary while making GitHub onboarding, product
limits, and customer support clearer.

## Current repo state

Component tests covered many workflows, but no real browser runner exercised the local fixture
session and responsive navigation. GitHub connection status and Help copy did not clearly state
the webhook/execution boundary or support route.

## Research / references used

The frontend API contract, hosted beta boundary, GitHub App read-only contract, and existing
Vitest workflow tests.

## Work planned for the PR

Add a Playwright fixture-backed browser suite, run it in CI, show GitHub onboarding/webhook state,
clarify help content, add a support route, and apply safe dependency patch updates.

## Acceptance criteria

- [x] Browser tests cover local sign-in, first-plan state, AWS pilot acknowledgement, and mobile help.
- [x] Browser fixtures make no hosted identity, GitHub, AWS, or Cloudflare call.
- [x] GitHub onboarding says whether signed webhook updates are active.
- [x] Help distinguishes planning/review from customer workload deployment and exposes support.
- [x] Dependency audit remains free of moderate-or-higher findings.

## Acceptance status

Local validation passed. CI, review, merge, and Cloudflare Pages production deployment remain
pending.

## Tests / validation performed

Recorded in `docs/test/test58.md`.

## Evidence files produced

- `docs/test/test58.md`
- `browser-tests/onboarding.spec.ts`

## Boundaries

No public webhook, GitHub permission, customer cloud resource, customer workload, or hosted
identity setting is changed.

## Follow-up work

Record the separate live human invitation-to-approval browser journey with a controlled inbox.
