# ticket34 — Refine public positioning and dashboard language

PR: [#34](https://github.com/Bepoadewale/davdeploy-frontend/pull/34)

## Problem / goal

Make the public site easier to understand for a non-specialist buyer while retaining its intended product vision. Make the signed-in dashboard sound like a clear decision workspace, use one brand mark everywhere, and defer OIDC code until it is needed.

## Current repo state

The public page already described the intended end-state product, but did not clearly say who it served. Dashboard language exposed more implementation detail than necessary. OIDC was loaded by the public page and the CSS entry point was spread across four imports.

## Research / references used

- Existing Home, Overview, AppShell, authentication, and visual-component patterns.
- The product direction supplied for DavDeploy: present the completed product vision, not the present beta limitations.

## Work planned for the PR

- Add a visual "Who it is for" section and plain-language customer copy.
- Simplify dashboard prompts and use the existing brand mark in the signed-in shell.
- Dynamically import the OIDC client only for authentication actions.
- Consolidate stylesheet loading through one application entry point.

## Acceptance criteria

- [x] The public page names three customer groups and explains the benefit in plain English.
- [x] Existing product visuals support the audience cards without introducing external image dependencies.
- [x] Dashboard copy is shorter and decision-focused.
- [x] Public builds no longer preload the OIDC client from `index.html`.
- [x] Stylesheets have one deliberate application import point and responsive audience layouts.

## Acceptance status

All acceptance criteria are met locally.

## Tests / validation performed

See `docs/test/test34.md`.

## Evidence files produced

- `docs/test/test34.md`

## Boundaries

This work changes marketing and product-interface copy only. It does not claim the present hosted beta has customer execution enabled, change live identity configuration, send email, or change DNS.

## Follow-up work

Run a real-device visual review after Pages deploys. A deeper removal/deduplication of legacy CSS files is deliberately separate because it requires visual regression review before deleting files.
