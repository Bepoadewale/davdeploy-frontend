# ticket95 - add public blog and discussion experience

PR: [#95](https://github.com/Bepoadewale/davdeploy-frontend/pull/95)

## Problem / goal

Add a simple public DavDeploy journal, article discussion, and authenticated team publishing UI.

## Current repo state

The public website has Team and About pages but no public editorial route or
authenticated discussion UI.

## Research / references used

- Existing public route, footer, API-client, and authenticated route patterns.
- Backend PR #216 public blog and discussion contract.

## Work planned for the PR

- Add Blog navigation and public list and article routes.
- Let signed-in readers post and edit only their own comments.
- Provide a protected author workspace for team identities authorized by the API.
- Remove the two requested marketing boundary sentences.

## Acceptance criteria

- [x] Blog is public and supports empty, loading, and retry states.
- [x] Readers can comment after signing in and edit only their own comments.
- [x] Publishing controls are visible only when the API confirms team author access.
- [x] The requested two sentences are absent.
- [x] Full local validation passes; required CI is pending.

## Acceptance status

Implementation and clean local verification are complete. Required GitHub CI
and production Pages publication remain pending.

## Tests / validation performed

See `docs/test/test95.md`.

## Evidence files produced

`docs/test/test95.md`

## Boundaries

The browser never decides who can publish or edit another person's content. The
backend is the authority for public post state, author allowlisting, and comment ownership.

## Follow-up work

Perform a controlled live author publication and reader-comment journey after
the backend team-subject allowlist is configured.
