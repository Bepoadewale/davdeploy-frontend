# ticket80 - Refine public search metadata

PR: [#80](https://github.com/Bepoadewale/davdeploy-frontend/pull/80)
Branch: `chore/refine-public-search-metadata`

## Problem / goal

Make the public Home, Team, and About search result metadata accurate, canonical, and discoverable without changing product behavior or overstating unsupported cloud capabilities.

## Current repo state

The public pages have route-specific titles, descriptions, and canonical URLs. The home document still described deployment and operations broadly, its social image used the temporary Pages domain, and the public site had no sitemap declaration.

## Research / references used

The current public routes, `robots.txt`, Home, Team, About, the deployed canonical domain, and verified product boundary: AWS is the implemented provider while additional providers are future integrations.

## Work planned for the PR

Refine initial and client-side metadata, set canonical social URLs on route changes, use the canonical domain for social images, and publish a sitemap containing only public informational pages.

## Acceptance criteria

- [x] Home metadata identifies AWS as available now and avoids an unsupported general availability claim for deployment and operations.
- [x] Team and About metadata identifies their page-specific content accurately.
- [x] Canonical and Open Graph URLs use `https://davdeploy.tech`.
- [x] Search and social image URLs use the canonical domain.
- [x] `robots.txt` declares a sitemap that lists Home, Team, and About only.

## Acceptance status

Implemented and locally verified; awaiting PR CI and production deployment.

## Tests / validation performed

Recorded in `docs/test/test80.md`.

## Evidence files produced

`docs/test/test80.md`.

## Boundaries

Static frontend metadata, sitemap, and metadata tests only. No backend, identity, cloud, analytics, tracking, or product behavior changes.

## Follow-up work

After deployment, request indexing in Google Search Console if it is configured. Google controls when refreshed titles and snippets appear in results.
