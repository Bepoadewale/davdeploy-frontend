# test94

## Commands executed

```text
npm test -- --run src/auth/cognitoEmail.test.ts src/pages/LoginPage.test.tsx src/pages/PublicInformationPages.test.tsx
npm run typecheck
npm run lint
npm run build
npm ci
npm run verify
```

## Result

The focused suite passed 22 tests. The focused command enables global coverage
thresholds, so its targeted coverage report intentionally does not meet the
repository-wide threshold. The clean `npm run verify` gate passed with 88 tests,
repository-wide coverage thresholds, contract and public-environment checks,
production build, static-hosting and SPA-refresh checks, and zero production
dependency vulnerabilities.

The new Team and About assets total approximately 1.6 MB: a 1.4 MB MP4, 62 KB
poster, and three WebP illustrations. The video is below the fold, preloads no
video data, uses a local poster, pauses outside the viewport, and remains static
when reduced motion is requested unless the visitor explicitly plays it.

## Execution boundary

Local static-client validation with mocked Cognito. No user account, secret,
Cloudflare configuration, backend API, or production deployment was changed.

## Known limitations

A real Cognito account and authenticator app are still needed to prove the
production service's first-time enrollment journey after an authorized deploy.
