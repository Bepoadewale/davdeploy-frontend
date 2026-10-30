# test87 - Official brand and website media integration

## Commands executed

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run verify
```

## Result

All commands passed locally on 30 October 2026. The focused suite passed 9 tests. The complete suite passed 84 tests in 17 files. The production build, static-hosting and SPA-refresh checks passed; the API contract validated 35 operations; public browser configuration validation passed; and `npm audit --audit-level=moderate` found 0 vulnerabilities.

The browser acceptance suite also checks the public homepage on its desktop and mobile projects, including the local hero poster and video source, visible media control, and cost section.

The supplied media bundle is 2.2 MB. The official public branding assets add approximately 678 KB, including a 99 KB Open Graph JPEG and the responsive browser icons.

## Execution boundary

Local static frontend build and test environment only. No live deployment, cloud resource, external media host, customer data, or authentication configuration was changed.

## Known limitations

Social platforms cache Open Graph previews independently. Static metadata is included in the built HTML, but a deployed URL is required before those platforms can fetch the updated preview.
