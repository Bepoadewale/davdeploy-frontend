# ticket35 — Preserve mobile hero gutters

PR: [#35](https://github.com/Bepoadewale/davdeploy-frontend/pull/35)

## Problem / goal

Restore the intended side gutters in the public homepage hero on narrow mobile screens.

## Current repo state

The public stylesheet correctly sets a 14 px mobile gutter. A later legacy visual stylesheet
overrode the hero to `width: 100%` below 470 px, so only the first hero section reached the screen
edges.

## Research / references used

- Local screenshot: `Screenshot 2026-10-25 at 23.38.57.png`.
- Mobile Chrome reproduction at a 390 px viewport.
- CSS cascade inspection across `public-v3.css` and `visual-story.css`.

## Work planned for the PR

- Remove the conflicting mobile hero width override while retaining full-width sizing for its inner
  product card.

## Acceptance criteria

- [x] The homepage hero retains its 14 px mobile gutter below 470 px.
- [x] The hero product card still fits the available width.
- [x] Full repository verification passes.

## Acceptance status

All acceptance criteria are met.

## Tests / validation performed

See `docs/test/test35.md`.

## Evidence files produced

- `docs/test/test35.md`

## Boundaries

No production, Cloudflare, DNS, authentication, or email configuration is changed by this fix.

## Follow-up work

None expected after deployed mobile visual confirmation.
