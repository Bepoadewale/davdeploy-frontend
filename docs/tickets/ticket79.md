# ticket79 - Restore saved session before login redirect

PR: [#79](https://github.com/Bepoadewale/davdeploy-frontend/pull/79)
Branch: `fix/restore-session-before-login`

## Problem / goal

A visitor with a valid seven-day browser session could briefly reach the sign-in route because protected-route redirection could run before the initial cookie-session workspace lookup completed.

## Current repo state

Production uses a same-origin HttpOnly browser session proxy. The provider begins its cookie lookup in an effect, while protected routes previously treated the initial empty profile as unauthenticated immediately.

## Research / references used

The production session configuration, `AuthContext`, protected-route guard, public workspace links, and the reported user experience.

## Work planned for the PR

Start browser-proxy authentication in a restoring state, hold protected-route redirection until that lookup completes, and direct public workspace links to `/overview` so a saved session opens the workspace directly or falls back to sign-in only when required.

## Acceptance criteria

- [x] A pending saved-session lookup shows a neutral workspace-loading state rather than the sign-in route.
- [x] Public workspace actions open `/overview`.
- [x] A completed unauthenticated lookup still redirects to sign-in.
- [x] Existing sign-out and authorization boundaries are unchanged.

## Acceptance status

Implemented and locally verified; awaiting PR CI and deployment.

## Tests / validation performed

Recorded in `docs/test/test79.md`.

## Evidence files produced

`docs/test/test79.md`.

## Boundaries

Frontend route timing only. No token lifetime, cookie policy, API authorization, Cognito setting, cloud resource, or server configuration changes.

## Follow-up work

Run a final live browser navigation check after deployment using the existing signed-in founder session.
