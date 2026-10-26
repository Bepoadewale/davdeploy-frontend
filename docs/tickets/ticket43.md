# ticket43 — Simplify the public homepage

PR: [#43](https://github.com/Bepoadewale/davdeploy-frontend/pull/43)

## Problem / goal

The public homepage repeated DavDeploy’s message through multiple card groups, navigation links,
trust statements, a feature matrix, a workflow, and a second call to action. It made the product
feel busier than the intended focused workspace.

## Current repo state

The public homepage has a real sign-in route and an illustrative product brief. It also includes
multiple non-interactive marketing sections that duplicate the same core promise.

## Research / references used

- Current public homepage implementation and responsive visual system.
- Existing public-page accessibility tests.
- The established concise product positioning and who-it-is-for direction.

## Work planned for the PR

- Keep one hero, one product brief, a concise principles strip, a short audience statement, and a
  three-step workflow.
- Remove secondary navigation, repeated feature cards, evidence matrix, repeated CTA, and footer
  filler.
- Preserve clear access to the workspace and truthful illustrative-product labelling.

## Acceptance criteria

- [x] The homepage communicates the core promise and has one clear primary action.
- [x] The page retains a concise who-it-is-for section and workflow.
- [x] The illustrative decision brief remains clearly labelled.
- [x] Automated accessibility and full frontend verification pass.

## Acceptance status

Implementation is complete pending local and hosted verification.

## Tests / validation performed

See `docs/test/test43.md`.

## Evidence files produced

- `docs/test/test43.md`

## Boundaries

This is a public frontend presentation change only. It does not change authentication, API
behavior, customer data, cloud infrastructure, or deployment permissions.

## Follow-up work

Review the deployed home page on desktop and mobile for final visual balance after Cloudflare
publishes it.
