# ticket97 - make blog publishing discoverable

PR: [#97](https://github.com/Bepoadewale/davdeploy-frontend/pull/97)

## Problem / goal

Authorized DavDeploy authors could open the existing post editor at `/blog/manage`, but the public blog page did not expose a link to it. This made the publishing workflow difficult to find.

## Current repo state

The frontend already has a protected post editor for creating, editing, and publishing drafts. The backend is the authority for author access and allows `@davdeploy.tech` addresses plus `bepoadewale1@gmail.com`. The blog list is public, but it had no author entry point.

## Research / references used

- `src/pages/BlogPage.tsx` and `src/pages/BlogManagePage.tsx`.
- Frontend route configuration in `src/App.tsx`.
- Backend author allowlist and endpoint in the private `davdeploy` repository.

## Work planned for the PR

- Check author access only for signed-in users and show a “Write a post” link only when the API confirms permission.
- Provide a retry state if the permission check fails.
- Cover public, authorized, and denied states with frontend tests.

## Acceptance criteria

- [x] Public visitors can read the blog without triggering an author permission request.
- [x] Signed-in authors see a link to `/blog/manage`.
- [x] The UI relies on the backend permission response rather than client-side email rules.
- [x] Visitors without author permission do not see the editor link.
- [x] Permission-check failures have a clear retry action.
- [x] Focused tests and complete local verification pass.
- [ ] Required GitHub checks pass.

## Acceptance status

Implementation is complete on a focused branch. Focused tests and full local verification pass; required GitHub checks are pending.

## Tests / validation performed

See `docs/test/test97.md`.

## Evidence files produced

`docs/test/test97.md`

## Boundaries

Frontend-only discoverability change. It does not change backend authorization, blog storage, authentication, or public publishing permissions.

## Follow-up work

Sign in with an authorized DavDeploy email, open `/blog`, choose “Write a post”, then enter a title, URL slug, summary, and article. Choose Draft or Published and select Save post. The backend remains authoritative for permission and persistence.
