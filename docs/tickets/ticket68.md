# ticket68 — Renew Cognito browser sessions silently

PR: [#68](https://github.com/Bepoadewale/davdeploy-frontend/pull/68)
Branch: `feat/silent-cognito-refresh`

## Problem / goal

The passwordless Cognito flow kept only an ID token, so the browser could not
renew the 15-minute token and required another email code after expiry.

## Current repo state

Cognito already issues refresh tokens with a seven-day validity. The frontend
restored a token after a reload but discarded the refresh token returned by
Cognito.

## Research / references used

The Cognito public-client `REFRESH_TOKEN_AUTH` contract, current user-pool
token settings, `AuthContext`, and the browser-security policy.

## Work planned for the PR

Retain a refresh token only in browser session storage, renew one minute before
ID-token expiry and on an expired reload, clear rejected sessions, and extend
the direct auth fixtures.

## Acceptance criteria

- [x] Email OTP and OIDC callback results retain Cognito refresh-token data.
- [x] The browser renews without an email challenge before token expiry.
- [x] Rejected renewal clears access with plain-English guidance.
- [x] No refresh token is stored in persistent local storage.

## Acceptance status

Implemented and locally verified; awaiting CI and deployment.

## Tests / validation performed

`npm run verify` passed 70 tests, static-hosting checks, contract validation,
and dependency audit.

## Evidence files produced

`docs/test/test68.md` records the verification boundary.

## Boundaries

The seven-day Cognito refresh-token lifetime is unchanged. Closing a browser
session may require sign-in again; persistent cross-restart login needs a later
server-side HttpOnly-cookie session design.

## Follow-up work

Run a controlled live email-token expiry/renewal browser test after deployment.
