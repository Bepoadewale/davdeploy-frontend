# ticket78 - Add support contact links

PR: [#78](https://github.com/Bepoadewale/davdeploy-frontend/pull/78)
Branch: `feat/add-support-contact-link`

## Problem / goal

Public visitors need a clear Contact Us option beside Team and About Us without a separate contact page or form.

## Current repo state

The public footer links to Team, About Us, and Workspace sign in. Authenticated Help and Settings already provide support email actions.

## Research / references used

Existing public footer component, existing Help/Settings support links, and the supplied support address.

## Work planned for the PR

Add a Contact Us mail link to the public footer that opens `support@davdeploy.tech`. Retain the existing workspace support actions where they already fit naturally.

## Acceptance criteria

- [x] Every public-page footer includes Contact Us.
- [x] Contact Us uses `mailto:support@davdeploy.tech`.
- [x] Workspace Help and Settings continue to provide their existing email support actions.
- [x] Focused footer coverage asserts the address.

## Acceptance status

Implemented and locally verified; awaiting PR CI and deployment.

## Tests / validation performed

Recorded in `docs/test/test78.md`.

## Evidence files produced

`docs/test/test78.md`.

## Boundaries

Frontend navigation only. No new contact page, form, backend API, email integration, infrastructure, or account configuration is added.

## Follow-up work

None.
