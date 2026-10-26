# ticket40 — Simplify plan review and improve readability

PR: [#40](https://github.com/Bepoadewale/davdeploy-frontend/pull/40)

## Problem / goal

The post-plan review was a long wall of detailed fields. Its automatic dark-mode theme also put
pale text on light panels in dark-system browsers, making plan evidence hard to read.

## Current repo state

The review record already groups application evidence, cost, security, observability, deployment,
risk, and audit data. It renders the full values immediately, even when a reviewer only needs an
overview.

## Research / references used

- Seven controlled screenshots of the live post-plan review flow.
- Existing PlanPage workflow tests and shared application colour tokens.
- WCAG 2.2 AA foreground-contrast intent for normal-sized text.

## Work planned for the PR

- Keep the selected architecture and next action visible.
- Turn long review and audit records into short, collapsed sections with an explicit “Read details” control.
- Put the immutable digest behind an opt-in disclosure.
- Lock the application to its established light scheme so a dark browser preference cannot produce
  pale text over light surfaces.

## Acceptance criteria

- [x] Core plan decisions remain visible without a long evidence wall.
- [x] A reviewer can reveal any detailed section without losing its data or raw inspection control.
- [x] Review text remains dark and legible when the browser prefers a dark colour scheme.
- [x] Existing review actions and workflow tests continue to work.

## Acceptance status

Implementation is complete pending local and hosted verification.

## Tests / validation performed

See `docs/test/test40.md`.

## Evidence files produced

- `docs/test/test40.md`

## Boundaries

This is a frontend presentation and accessibility correction only. It does not modify plan data,
customer authorization, AWS execution, Cognito, Cloudflare, or API contracts.

## Follow-up work

After deployment, review the dense plan page on a narrow mobile device with a real plan record.
