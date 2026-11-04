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

## Planned work

- Add a required Author's Name input and include it in create/edit requests.
- Render the stored author name as a byline on public articles.
- Linkify plain `http`, `https`, and `www.` URLs in article paragraphs without using raw HTML or allowing unsafe URL schemes.
- Coordinate the matching backend persistence/API change before enabling the editor field in production.

## Acceptance criteria

- [ ] Authors can enter and edit a display name for each post.
- [ ] Public posts show the persisted author name.
- [ ] Links typed in article text render as accessible clickable links; surrounding punctuation and text remain intact.
- [ ] Link rendering accepts only `http` and `https` destinations and escapes all other article content.
- [ ] Existing post creation, editing, visibility, and route behavior remain intact.
- [ ] Required verification and GitHub checks pass.

## Validation

Pending implementation and the matching backend API change.

## Boundaries

This change does not alter blog author authorization, workspace sign-in, or publishing eligibility. It must not render article text as HTML.

## Follow-up

Persist `author_name` in the backend and include it in public and management responses before deploying the editor change.
