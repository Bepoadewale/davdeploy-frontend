# ticket99 - add author names and clickable article links

PR: [#99](https://github.com/Bepoadewale/davdeploy-frontend/pull/99)

## Goal

Add an Author's Name field to the blog editor and automatically render URLs typed in article text as safe, clickable links.

## Current state

The editor saves title, slug, summary, article body, and draft/published visibility. Public blog responses already contain `author_name`, but the backend currently returns the fixed value `DavDeploy team`; the public article page does not show a byline. Article text is rendered as escaped React text, so raw URLs are not clickable.

## References

- `src/pages/BlogManagePage.tsx` and `src/pages/BlogPostPage.tsx`.
- `src/api/contracts.ts` (`BlogPost.author_name`).
- Private backend blog request/model/response contract in `Bepoadewale/davdeploy`.

## Work in this PR

- Add a required Author's Name input and include it in create/edit requests.
- Render the stored author name as a byline on public articles.
- Linkify plain `http`, `https`, and `www.` URLs in article paragraphs without using raw HTML or allowing unsafe URL schemes.
- Keep the PR in draft until backend persistence and API responses support the submitted author name.

## Acceptance criteria

- [x] Authors can enter and edit a display name for each post in the editor, and it is sent on create/edit requests.
- [ ] Backend persists the display name and returns it in public and management responses.
- [x] Public article page displays the returned author name as a byline.
- [x] Links typed in article text render as clickable links with surrounding punctuation and text preserved.
- [x] Link rendering accepts only `http` and `https` destinations and keeps all other article content escaped.
- [x] Existing post creation, editing, visibility, and route behavior are unchanged in the frontend code.
- [ ] Required GitHub checks pass on the implementation commit.

## Validation

Frontend implementation is present. No local tests were run. Backend persistence/API support and required GitHub checks remain pending; this PR stays draft until the backend change is merged and deployed.

## Boundaries

This change does not alter blog author authorization, workspace sign-in, or publishing eligibility. It must not render article text as HTML. The backend currently ignores the new field, so this frontend PR must not be merged until its API dependency is available.

## Follow-up

Persist `author_name` in the backend and include it in public and management responses before merging this frontend PR.
