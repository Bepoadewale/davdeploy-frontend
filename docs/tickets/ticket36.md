# ticket36 — Document the canonical hosted frontend

PR: [#36](https://github.com/Bepoadewale/davdeploy-frontend/pull/36)

## Problem / goal

Frontend documentation still described the technical `pages.dev` hostname as the production
destination and implied that hosted API/OIDC configuration was absent.

## Current repo state

The canonical production origin is `https://davdeploy.tech`. It has the hosted public API and
Cognito/OIDC browser configuration. Exact backend CORS intentionally excludes the `pages.dev`
technical hostname.

## Research / references used

- Deployed frontend and backend origin configuration.
- Existing frontend security and Cloudflare Pages documentation.

## Work planned for the PR

- Identify the canonical origin and technical Pages hostname accurately.
- Describe the exact-origin CORS boundary and remaining browser acceptance work.

## Acceptance criteria

- [x] The README identifies `https://davdeploy.tech` as canonical.
- [x] The Pages handoff no longer claims hosted configuration is unset.
- [x] Authentication documentation retains the unrecorded live browser-journey boundary.

## Acceptance status

Documentation reconciliation is complete pending review.

## Tests / validation performed

See `docs/test/test36.md`.

## Evidence files produced

- `docs/test/test36.md`

## Boundaries

This documentation-only PR does not alter frontend code, Cloudflare Pages, CORS, Cognito, DNS, or
email routing.

## Follow-up work

Run and record a controlled invitation-to-workspace browser journey at the canonical domain.
