# ticket98 - explain blog author access and connect workspace navigation

PR: [#98](https://github.com/Bepoadewale/davdeploy-frontend/pull/98)

## Problem / goal

Workspace authentication is shared across the website, but blog publishing has a separate author permission check. When a signed-in user was not a blog author, or when the author-access request failed, `/blog/manage` silently redirected to the workspace overview. The workspace also had no visible route back to the public site. Explain the publishing result and provide a clear way home.

## Current repo state

The backend permits publishing only for verified `@davdeploy.tech` email addresses and `bepoadewale1@gmail.com`. The editor page hid the permission result behind a redirect, so a user could not tell whether they needed a different account or the access check failed. The workspace shell also had no direct link to `/`, which made users edit the address bar to leave the authenticated area.

## Research / references used

- `src/pages/BlogManagePage.tsx` and protected route configuration in `src/App.tsx`.
- Backend `/api/v1/blog/author-access` and `ProductService.can_author_blog` in the private `davdeploy` repository.
- Existing backend policy tests for blog authorship.

## Work planned for the PR

- Keep the backend as the sole author permission authority.
- Replace silent redirects with a clear permission-denied page or a retryable access-check error.
- Make clear that workspace sign-in is shared with public pages; publishing still depends on backend-confirmed author access.
- Add a visible workspace navigation link to the public homepage without signing the user out.
- Add focused tests for authorized, denied, and failed access checks.

## Acceptance criteria

- [ ] A user with confirmed author access sees the existing editor.
- [ ] A workspace user without author access sees the exact eligibility rule and links back to the public blog/workspace.
- [ ] A failed permission check shows a retry action instead of implying the user is unauthorized.
- [ ] The workspace sidebar has a keyboard-accessible “Visit public site” link to `/` and keeps the current session.
- [ ] No browser-side email allowlist or authorization change is introduced.
- [ ] Focused tests and full local verification pass; required GitHub checks pass.

## Acceptance status

Draft implementation is pending.

## Tests / validation performed

See `docs/test/test98.md`.

## Evidence files produced

`docs/test/test98.md`

## Boundaries

Frontend-only error and navigation clarity. The backend author rule remains authoritative and unchanged. No authentication or workspace membership logic changes.

## Follow-up work

Sign in with a verified allowed address to publish: any `@davdeploy.tech` address, or `bepoadewale1@gmail.com`.
