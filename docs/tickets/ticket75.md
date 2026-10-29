# ticket75 - Refine founder portrait and public page layout

PR: [#75](https://github.com/Bepoadewale/davdeploy-frontend/pull/75)
Branch: `feat/refine-public-pages`

## Problem / goal

Replace the temporary founder portrait placeholder with the approved authentic photo, make the About page typography more consistent, use its wide desktop space intentionally, and remove em dashes from browser-visible copy.

## Current repo state

The Team and About pages are deployed. The founder portrait was a labelled placeholder, and the About page uses a deliberately narrow editorial column that leaves unused space on wide displays.

## Research / references used

The user-supplied approved portrait at `Documents/Pictures/WhatsApp Image 2026-10-16 at 07.24.10.jpeg`, the latest production About screenshot, current public-page components, and existing responsive styles.

## Work planned for the PR

Add the supplied 89 KB authentic JPEG as a responsive founder image, change the role to Founder, use cloud architecture wording, remove the About email link, apply a consistent About section-heading and body-text scale, add one restrained desktop-side visual, and remove em dashes from browser copy.

## Acceptance criteria

- [x] Team uses the authentic approved founder portrait with descriptive alternative text.
- [x] Founder wording is accurate and does not include CEO.
- [x] About uses one consistent section-heading size and one regular-body size.
- [x] Wide-screen About space is filled by a restrained decorative visual without widening the reading measure.
- [x] About no longer repeats the founder email.
- [x] Browser-visible source copy contains no em dashes.

## Acceptance status

Implemented and locally verified; awaiting PR CI and deployment.

## Tests / validation performed

Recorded in `docs/test/test75.md`.

## Evidence files produced

`docs/test/test75.md` and local desktop/mobile screenshots, which are not committed.

## Boundaries

Frontend presentation and copy only. No API, cloud, authentication, infrastructure, analytics, or paid dependency change.

## Follow-up work

None for this focused refinement.
