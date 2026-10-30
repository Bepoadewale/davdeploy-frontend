# ticket87 - Official brand and website media integration

PR: [#87](https://github.com/Bepoadewale/davdeploy-frontend/pull/87)
Branch: `feat/brand-media-integration`

## Problem / goal

Integrate the supplied official DavDeploy visual identity, browser icons, social sharing image, and approved local website media into the existing static React frontend without changing product behavior or cloud claims.

## Current repo state

The public site used an earlier drawn browser mark, an earlier social image, and a compact homepage with no supplied media sequence. The official local assets are available under the project media package.

## Research / references used

- `website media package/CODEX_INTEGRATION_PROMPT.md` supplied by the founder.
- `website media package/ASSET_MANIFEST.json` for the intended visual and product-boundary context.
- Official `DavDeploy-*` logo, favicon, and Open Graph assets supplied locally.

## Work planned for the PR

- Replace the drawn application mark with the approved official icon in public, authentication, and workspace branding.
- Publish the supplied favicon, Apple touch icon, manifest, and static Open Graph image metadata.
- Add locally hosted responsive illustrations and motion with poster fallbacks, reduced-motion behavior, viewport pausing, and controls.
- Add the supplied homepage and About-page visual content without making unsupported deployment claims.

## Acceptance criteria

- [x] Official DavDeploy icon and capitalization appear in public, authentication, and workspace branding.
- [x] Static crawlers receive canonical Open Graph and Twitter metadata with the supplied 1200 by 630 image.
- [x] Favicon and application icon references resolve from public assets.
- [x] All package media is locally hosted, lazy loaded where appropriate, and has poster or image fallbacks.
- [x] The homepage presents the supplied simplicity, cost, governance, use case, ownership, lifecycle, and closing-brand material.
- [x] Motion respects reduced-motion preferences and supplies an explicit control.
- [x] Existing authenticated routes and provider-boundary copy remain unchanged.

## Acceptance status

Implemented locally. Validation results are recorded in `docs/test/test87.md`; GitHub CI remains the merge gate.

## Tests / validation performed

Recorded in `docs/test/test87.md`.

## Evidence files produced

`docs/test/test87.md`.

## Boundaries

Frontend assets, presentation, metadata, and tests only. No backend API, authentication flow, AWS resource, Cloudflare configuration, provider availability, or deployment permission has changed.

## Follow-up work

Review the deployed public pages at desktop and mobile widths after PR merge, then allow social crawlers to refresh their cached preview.
