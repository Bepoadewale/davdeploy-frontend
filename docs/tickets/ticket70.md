# ticket70 — Persistent secure browser sessions

PR: [#70](https://github.com/Bepoadewale/davdeploy-frontend/pull/70)
Branch: `feat/persistent-browser-session`

## Problem / goal

Keep a signed-in DavDeploy user signed in after closing and reopening browser tabs, without placing a seven-day Cognito refresh token in persistent browser JavaScript storage.

## Current repo state

The Cognito ID token lasts 15 minutes and the public client issues a seven-day refresh token. The prior silent-renewal implementation held both in `sessionStorage`, so it correctly restored reloads in an open browser session but not a fully closed session.

## Research / references used

Cloudflare Pages Functions routing, Cognito public-client refresh-token exchange, existing API Gateway bearer authorization, and the repository authentication/security policy.

## Work planned for the PR

Add a same-origin `/api/v1/*` Pages Function that validates the login result, keeps ID and refresh tokens in host-only HttpOnly Secure SameSite cookies, refreshes the ID token server-side, and forwards the existing bearer request to the hosted API. Update deployment/security guidance and direct function fixtures.

## Acceptance criteria

- [x] Production browser calls can use a same-origin API proxy when explicitly enabled.
- [x] Refresh tokens are host-only HttpOnly Secure SameSite cookies, never localStorage or persistent browser JavaScript storage.
- [x] The function validates the initial identity, silently refreshes an expiring ID token, and forwards the resulting bearer request to the existing API.
- [x] Cookie-authenticated mutations reject cross-site Origins.
- [x] Sign-out clears both cookies.
- [x] Docs specify the required Pages build/runtime configuration and live smoke test.

## Acceptance status

Implemented and locally verified; CI and the Pages production deployment remain to be confirmed.

## Tests / validation performed

Focused Pages Function fixtures, TypeScript, ESLint, and the full frontend verification command are recorded in `docs/test/test70.md`.

## Evidence files produced

`docs/test/test70.md` records the commands and explicit live-test boundary.

## Boundaries

This uses the existing API Gateway and Cognito public client; it does not change backend authorization, Cognito token lifetimes, customer execution permissions, or enable a new paid Cloudflare product. The seven-day session ends on sign-out, refresh rejection, or Cognito refresh-token expiry.

## Follow-up work

After deployment, run one controlled production journey: email OTP sign-in, close all DavDeploy tabs, reopen the canonical domain, confirm restoration, sign out, and confirm restoration no longer occurs.
