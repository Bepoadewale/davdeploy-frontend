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

- [x] A user with confirmed author access sees the existing editor.
- [x] A workspace user without author access sees the exact eligibility rule and links back to the public blog/workspace.
- [x] A failed permission check shows a retry action instead of implying the user is unauthorized.
- [x] The workspace sidebar has a keyboard-accessible “Visit public site” link to `/` and keeps the current session.
- [x] No browser-side email allowlist or authorization change is introduced.
- [x] Full local verification and required GitHub checks pass.

## Acceptance status

Implementation and verification are complete. The PR remains unmerged pending review.

## Tests / validation performed

`npm run verify` passed locally: 96 tests, formatting, lint, type check, API contract,
public environment, production build, static-hosting and SPA route checks, and a clean
dependency audit. All five required GitHub checks passed in run
[41919705574](https://github.com/Bepoadewale/davdeploy-frontend/actions/runs/41919705574).

## Evidence files produced

`docs/test/test98.md`

## Boundaries

Frontend-only error and navigation clarity. The backend author rule remains authoritative and unchanged. No authentication or workspace membership logic changes.

## Follow-up work

Production availability follows the reviewed PR merge and Cloudflare Pages deployment.
