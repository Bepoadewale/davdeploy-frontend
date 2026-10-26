# ticket39 — Simplify and improve sign-in readability

PR: [#39](https://github.com/Bepoadewale/davdeploy-frontend/pull/39)

## Problem / goal

The hosted sign-in page used a large decorative decision record and some low-contrast helper text.
The one-time-code recipient, status text, and alternate-email control were difficult to read against
the light card background.

## Current repo state

The page supports Cognito email sign-in, account creation, and an email verification-code challenge.
It already has client accessibility coverage and a focused public visual system.

## Research / references used

- Controlled desktop screenshots of the deployed sign-in and verification-code states.
- Existing LoginPage accessibility tests and the current DavDeploy public visual system.
- WCAG 2.2 AA foreground-contrast intent for normal-sized text and controls.

## Work planned for the PR

- Reduce the contextual pane to a short product statement and three quiet safeguards.
- Remove the decorative decision-record visual from the access flow.
- Use explicit, darker foreground colours for helper text, OTP status, and the alternate-email action.
- Retain every authentication route and its existing labels and behavior.

## Acceptance criteria

- [x] The sign-in page has one compact context pane and one focused access card.
- [x] OTP recipient text, helper copy, and the alternate-email action are readable on the light card.
- [x] Email OTP, account creation, Google sign-in, local fixture, and configuration-state behavior remain intact.
- [x] Automated accessibility and full frontend verification pass.

## Acceptance status

Implementation and local verification are complete; hosted CI and deployment verification are pending.

## Tests / validation performed

See `docs/test/test39.md`.

## Evidence files produced

- `docs/test/test39.md`

## Boundaries

This is a frontend presentation and accessibility correction only. It does not change Cognito,
authorization, email delivery, AWS, Cloudflare, or sign-in request behavior.

## Follow-up work

Review the live one-time-code state on a narrow mobile device after deployment as part of the next
real browser acceptance journey.
