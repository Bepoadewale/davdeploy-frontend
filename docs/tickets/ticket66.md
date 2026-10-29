# ticket66 — Restore hosted session after browser refresh

PR: [#66](https://github.com/Bepoadewale/davdeploy-frontend/pull/66)
Branch: `fix/session-refresh`

## Problem / goal

Keep a validated Cognito email session across refreshes within the same browser tab.

## Current repo state

Hosted email tokens lived only in React memory, so a refresh returned customers to sign-in.

## Research / references used

`AuthContext.tsx`, hosted Cognito flow and workspace `/api/v1/me` boundary.

## Work planned for the PR

Persist only a hosted identity token in browser session storage, restore it through server-side
workspace validation, and clear it on sign-out or failed validation.

## Acceptance criteria

- [x] Refresh restores only a server-validated session.
- [x] Sign-out and expired sessions clear stored access.
- [x] Full frontend verification passes.

## Acceptance status

Completed: refresh restores through the existing server-side workspace boundary only.

## Tests / validation performed

Focused AuthContext fixtures passed. `npm run verify` passed the complete frontend suite.

## Evidence files produced

`docs/test/test66.md` will record fixture validation.

## Boundaries

No password, cloud credential, long-lived token, or server authority is stored in the browser.

## Follow-up work

Record the refreshed hosted browser journey.
