# test101 — Markdown blog article editing and rendering

Date: 2026-11-10
Execution type: Frontend unit tests and production build; no customer workload
Repository: `Bepoadewale/davdeploy-frontend`
Customer repository: N/A; no customer repository or workload was used
Branch: `feat/blog-markdown-article-field`
PR: #101 (draft)
AWS account/region: N/A; no AWS calls

## Commands executed

```text
npm view react-markdown version peerDependencies engines --json
npm view remark-gfm version engines --json
npm install react-markdown@^10.1.0 remark-gfm@^4.0.1
npm audit --omit=dev --audit-level=moderate
npx vitest run --coverage.enabled=false src/components/MarkdownArticle.test.tsx src/pages/BlogManagePage.test.tsx src/pages/BlogPostPage.test.tsx
npm ci
npm run verify
```

The focused tests passed (3 files, 7 tests). An initial focused invocation through the repository's `npm test` script ran the same tests but exited nonzero because the global coverage thresholds are intended for the complete suite; the focused command was rerun with coverage disabled. In a clean verification worktree, `npm ci` succeeded and `npm run verify` passed: 22 test files, 101 tests, format, lint, typecheck, API contract, public environment, production build, static build, SPA route checks, and the production dependency audit (0 vulnerabilities). The install also reported nine moderate advisories in existing development dependencies; the same affected direct dependency versions are present on `main`, and this PR does not change them.

## Result

- The author editor includes a live article preview and guidance for Markdown headings, bold text, and lists.
- Published article bodies render Markdown headings, paragraphs, emphasis, lists, and GitHub Flavored Markdown tables.
- Markdown level-one headings render as level-two headings within the post body, below the post title.
- Article links have a persistent underline in both editor preview and public content.
- Raw HTML is skipped and unsafe link protocols are not rendered.
- Focused rendering and editor tests passed; the fresh clean install and full verification passed.

After the review follow-up added visible link styling and an external-link rendering assertion, focused tests passed again (3 files, 7 tests) and full `npm run verify` passed again (22 files, 101 tests).

## Execution boundary

No API changes, AWS calls, infrastructure changes, or customer data access. Blog bodies remain strings in the existing API.

## Known limitations

Raw HTML is intentionally unsupported. Hosted PR checks and current-head review remain pending.
