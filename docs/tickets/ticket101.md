# PR #101: Render Markdown in blog articles

## Problem / goal

The blog author form treats the article body as plain text, and the public article page also displays Markdown markers literally. Authors cannot use `#`, `##`, lists, links, or code formatting to structure a post. Add an in-editor preview and render the same Markdown on the public article page.

## Current repo state

The authenticated blog manager saves `BlogPost.body` as a string to the existing API. `BlogPostPage` previously split that string into paragraphs. The public article title is the page's level-one heading. This PR adds `react-markdown` 10.1.0 and `remark-gfm` 4.0.1 for consistent live preview and public rendering.

## Research / references used

- `react-markdown` official documentation: https://github.com/remarkjs/react-markdown
- `remark-gfm` official documentation: https://github.com/remarkjs/remark-gfm
- Verified current compatible package metadata with `npm view`: `react-markdown` 10.1.0 accepts React 18 or newer; `remark-gfm` 4.0.1.

## Work planned for the PR

- Add a safe React Markdown renderer with GitHub Flavored Markdown support.
- Add accessible author guidance and a live preview next to the article editor, responsive to narrow screens.
- Render article body headings, paragraphs, emphasis, links, lists, tables, quotes, and code on the public post page.
- Keep raw HTML disabled and use the renderer's default URL handling.
- Add tests for preview/public rendering and unsafe raw HTML handling; update styling and runtime evidence.

## Acceptance criteria

- [x] Authors can see Markdown rendered while editing, including `#` and `##` headings.
- [x] Published public articles render Markdown rather than showing syntax markers.
- [x] The public post title remains the page's single level-one heading; body headings keep a valid subordinate heading structure.
- [x] Raw HTML cannot execute or inject markup through article Markdown.
- [x] Keyboard/screen-reader users can identify the editor and preview, and the layout works on small screens.
- [x] Fresh `npm ci` and `npm run verify` pass.
- [ ] Current-head CI and review are clear before merge.

## Acceptance status

The editor preview and public article rendering are implemented and locally verified with a clean `npm ci` and full `npm run verify` (22 test files, 101 tests). Hosted checks and current-head review remain pending.

## Tests / validation performed

Package compatibility was checked with `npm view`. Focused tests passed, and a clean verification worktree passed `npm ci` and full `npm run verify`. The installation reports nine moderate advisories in existing development dependencies also present on `main`; the production dependency audit passes with zero vulnerabilities.

## Evidence files produced

Runtime evidence will be recorded in `docs/test/test101.md` after implementation and validation.

## Boundaries

This is a frontend Markdown presentation change. It does not change API authorization, blog roles, publication state, or the stored body format. It does not allow raw HTML in Markdown.

## Follow-up work

None identified. The existing blog API continues to store the article body as plain Markdown text.
