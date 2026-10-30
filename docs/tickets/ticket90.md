# ticket90 - one-day persistent browser session

PR: [#90](https://github.com/Bepoadewale/davdeploy-frontend/pull/90)

Branch: `security/password-totp-authentication`

## Problem / goal

Limit persistent first-party browser sessions to one day.

## Current repo state

The secure Pages session proxy stores its refresh token only in an HttpOnly,
Secure, SameSite cookie, but its duration was seven days.

## Research / references used

- Existing browser-session threat model and Cognito refresh-token configuration.

## Work planned for the PR

Set the cookie session lifetime to one day and update security documentation.

## Acceptance criteria

- [x] Refresh cookie has a one-day maximum age.
- [x] Documentation states the one-day limit.
- [ ] Backend Cognito refresh token is deployed with the matching one-day limit.

## Acceptance status

Frontend cookie implementation is complete; backend deployment is pending its paired PR.

## Tests / validation performed

Pending full frontend verification.

## Evidence files produced

`docs/test/test90.md` records validation.

## Boundaries

Tokens remain inaccessible to JavaScript. The session is host-only and ends on
sign-out or after one day.

## Follow-up work

Run a real browser close/reopen and expiry test after deployment.
