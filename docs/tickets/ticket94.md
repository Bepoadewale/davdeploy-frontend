# ticket94 - improve authenticator setup and integrate company media

PR: [#94](https://github.com/Bepoadewale/davdeploy-frontend/pull/94)

Branch: `fix/auth-qr-and-company-media`

## Problem / goal

Make password access easier to use, make first-time authenticator enrollment
reliable and scannable, and add the approved media to the existing Team and
About pages without changing product behavior.

## Current repo state

Password plus authenticator-app access is the configured production model. The
first-time setup UI exposed a manual key only, and it retained the temporary
Cognito session from the password challenge instead of the replacement session
returned by `AssociateSoftwareToken`. Cognito rejects that old session during
verification.

## Research / references used

- Cognito `AssociateSoftwareToken`, `VerifySoftwareToken`, and `MFA_SETUP`
  session flow.
- The approved `DavDeploy-Team-About-Website-Assets.zip` integration prompt.
- Existing `WebsiteMedia` reduced-motion, poster, and viewport behavior.

## Work planned for the PR

- Add a show or hide control to password fields.
- Generate a local QR code for the temporary authenticator secret and retain a
  manual-key fallback.
- Carry Cognito's returned enrollment session into verification.
- Add the approved Team and About illustration and silent animation.
- Cover the new access and media paths with focused tests.

## Acceptance criteria

- [x] Password fields have an accessible show or hide control.
- [x] First-time authenticator enrollment presents a scannable QR code and a
      manual fallback.
- [x] TOTP verification uses the enrollment session returned by Cognito.
- [x] Team preserves the real founder portrait and adds the approved supporting
      illustration.
- [x] About uses the approved complexity animation, poster fallback, and future
      multicloud illustration.
- [x] Animation observes reduced-motion, explicit play or pause, and
      offscreen-pause behavior through `WebsiteMedia`.
- [ ] Required GitHub CI passes.

## Acceptance status

Implementation and the clean local verification are complete. This PR
deliberately does not deploy to production. Deployment requires explicit owner
authorization.

## Tests / validation performed

See `docs/test/test94.md`.

## Evidence files produced

`docs/test/test94.md`

## Boundaries

The QR value is generated only in the browser from Cognito's short-lived setup
secret. It is not stored, logged, or sent to the backend. The frontend does not
change Cognito configuration, authentication authority, or any cloud resource.
The supplied media remains local static content, with no third-party embed or
tracking service.

## Follow-up work

After review and required CI, authorize a Pages deployment and complete one
controlled first-time authenticator enrollment with a real app.
