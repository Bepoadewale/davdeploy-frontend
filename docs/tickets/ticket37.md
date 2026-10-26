# ticket37 — Avoid redundant invited-user profile lookup

PR: [#37](https://github.com/Bepoadewale/davdeploy-frontend/pull/37)

## Problem / goal

After an invited user completes email verification, the browser requested `/me`, received the
expected membership denial, and only then submitted the invitation token to onboarding. That added
one serial network round trip before the dashboard could render.

## Current repo state

Invitation tokens are retained only in browser session storage while the user completes sign-in.
The backend remains the authority that validates the token, verified identity, membership, and role.

## Research / references used

- `resolveWorkspaceProfile` request sequence.
- Controlled hosted Cognito invitation and email-OTP acceptance journey.
- Existing frontend session-resolution tests.

## Work planned for the PR

- Send an invited user directly to `/api/v1/onboarding` when a session-scoped invitation token is
  present.
- Preserve the existing `/me`-then-onboarding fallback for a user with no invitation token.

## Acceptance criteria

- [x] Invited users make one onboarding request after authentication.
- [x] Invitation tokens remain session-scoped and are sent only to the documented backend endpoint.
- [x] Non-invited membership recovery retains its existing fallback behavior.

## Acceptance status

Implementation is complete pending local and CI verification.

## Tests / validation performed

See `docs/test/test37.md`.

## Evidence files produced

- `docs/test/test37.md`

## Boundaries

This browser optimization does not authorize access locally or alter Cognito, AWS, Cloudflare,
Resend, invitation semantics, backend role checks, or infrastructure.

## Follow-up work

Run the refreshed production invitation acceptance journey after merge and measure time from OTP
submission to dashboard availability.
