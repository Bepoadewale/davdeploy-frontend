# test34 — Public positioning and public-path performance

## Execution boundary

Local frontend verification only. No Cognito, Cloudflare, AWS, GitHub App, email, DNS, or customer workspace was changed.

## Commands executed

```text
npm ci
npm run verify
rg -n "oidc|cognitoEmail" dist/index.html
```

## Result

Passed. The test suite covers the new audience section and accessibility remains clean. The production build succeeds, and the generated public `index.html` contains no eager OIDC or Cognito email chunk preload; authentication loads its OIDC client dynamically only when an authentication action needs it.

## Known limitations

The suite does not measure real-user performance or replace a visual review on a deployed mobile device. CSS source files remain separate behind a single entry point pending a dedicated visual regression-backed cleanup.
