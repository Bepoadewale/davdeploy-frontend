# ticket74 — Public Team and About pages

PR: [#74](https://github.com/Bepoadewale/davdeploy-frontend/pull/74)
Branch: `feat/public-team-about`

## Problem / goal

Visitors need a concise way to understand who builds DavDeploy, why the product exists, its current cloud boundary, and its multicloud direction without changing the product experience.

## Current repo state

The homepage is the sole public editorial route. The hosted control plane supports AWS planning, review, and account discovery; customer workload deployment remains a controlled pilot rather than a generally available claim. No verified founder portrait exists in tracked project assets.

## Research / references used

`AGENTS.md`, the existing homepage, public design tokens, route structure, responsive rules, current backend `PROJECT_STATUS.md`, and the user-supplied founder/contact details.

## Work planned for the PR

Add public `/team` and `/about` routes, a shared minimalist footer with Team/About/Workspace sign-in links, per-route metadata, responsive editorial styling, accessibility/browser checks, and public-route refresh coverage. Use a truthful neutral portrait placeholder until an approved authentic portrait is supplied.

## Acceptance criteria

- [x] Homepage footer links to Team and About Us without changing other homepage sections.
- [x] `/team` is public and includes the supplied founder name, role, contact, LinkedIn, founding date, and Nigeria location.
- [x] `/about` describes AWS as current and other providers as planned integrations only.
- [x] Both pages include semantic structure, return-home navigation, shared footer, focused metadata, accessible focus states, and responsive layouts.
- [x] The placeholder does not represent an invented or stock portrait.
- [x] Existing authenticated routing and public SPA refresh behavior remain covered.

## Acceptance status

Implemented and locally verified; awaiting PR CI and deployment.

## Tests / validation performed

Recorded in `docs/test/test74.md`.

## Evidence files produced

`docs/test/test74.md` and focused desktop/mobile local screenshots (not committed).

## Boundaries

Frontend-only content, routing, metadata, tests, and styling. No backend API, AWS, Terraform, authentication, product capability, analytics, or paid dependency changes.

## Follow-up work

Replace the neutral founder portrait placeholder only when an approved authentic web-optimised portrait is supplied.
