# test80 - Public search metadata

## Commands executed

```sh
npx vitest run src/metadata.test.ts src/pages/PublicInformationPages.test.tsx src/pages/HomePage.test.tsx --coverage=false
npm run verify
```

## Result

The focused tests verify the initial home metadata, canonical social image URL, route-specific Team and About metadata, canonical Open Graph URLs, sitemap scope, public footer navigation, and accessibility checks. The complete verification suite passed locally.

## Execution boundary

Local frontend fixtures and static files only. No Google Search Console, analytics, customer data, cloud resource, or live page state was changed.

## Known limitations

Search engines choose the displayed result snippet and crawl schedule. Deploying accurate metadata does not force Google to immediately update an existing result.
