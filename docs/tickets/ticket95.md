# ticket95 - add public blog and discussion experience

PR: [#95](https://github.com/Bepoadewale/davdeploy-frontend/pull/95)

## Goal

Add a simple public DavDeploy journal, article discussion, and authenticated team publishing UI.

## Work

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

## Boundaries

The browser never decides who can publish or edit another person's content. The
backend is the authority for public post state, author allowlisting, and comment ownership.
