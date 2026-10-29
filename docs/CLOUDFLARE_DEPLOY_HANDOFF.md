# Cloudflare Pages deployment handoff

## Verified deployment

The Git-integrated Cloudflare Pages project was created and its first production deployment
completed successfully on October 17, 2026.

- Project: `davdeploy-frontend`
- Repository: private `Bepoadewale/davdeploy-frontend`
- Production branch: `main`
- Canonical production URL: <https://davdeploy.tech>
- Technical Pages URL: <https://davdeploy-frontend.pages.dev> (not an authenticated API origin)
- Build command: `npm run build`
- Output directory: `dist`
- Runtime: static assets plus one same-origin Pages Function route (`/api/v1/*`) for the persistent
  browser-session proxy. It has no database, KV, Durable Object, R2, or external worker binding.
- Automatic production and preview deployments: enabled

The public shell and hosted API/OIDC configuration are live at `https://davdeploy.tech`. The
backend has exact-origin CORS and Cognito callback/logout URLs for that canonical domain only.
The `pages.dev` hostname remains useful for static-hosting diagnostics but cannot call the API by
design.

## Current production configuration

The Cloudflare Pages production environment contains the public API and Cognito/OIDC values. They
are browser-visible identifiers, never credentials. Do not add preview URLs or the `pages.dev`
hostname to production API CORS or Cognito allowlists without a separately reviewed reason.

## Recreate the project if needed

1. Sign in to Cloudflare and open **Workers & Pages**.
2. Choose **Create application** → **Pages** → **Connect to Git**.
3. Authorize the Cloudflare GitHub App for **only** the private
   `Bepoadewale/davdeploy-frontend` repository.
4. Select `davdeploy-frontend` and production branch `main`.
5. Use framework preset **Vite** (or no preset with the same explicit values).
6. Set build command to `npm run build`.
7. Set build output directory to `dist`.
8. Keep the root directory at the repository root.
9. Add production environment variables:
   - `VITE_API_BASE_URL=https://<deployed-api-host>`
   - `VITE_AUTH_MODE=oidc`
   - `VITE_GOOGLE_SIGN_IN_ENABLED=false` until Google federation is configured and verified
   - `VITE_OIDC_AUTHORITY=https://<trusted-issuer>`
   - `VITE_OIDC_CLIENT_ID=<public-client-id>`
   - `VITE_OIDC_REDIRECT_URI=https://<assigned-pages-host>/auth/callback`
   - `VITE_OIDC_POST_LOGOUT_REDIRECT_URI=https://<assigned-pages-host>/`
   - `VITE_COGNITO_REGION=<aws-region>`
   - `VITE_COGNITO_USER_POOL_CLIENT_ID=<same-public-client-id>`
10. Add `VITE_BROWSER_SESSION_PROXY_ENABLED=true` to production. This compiles the browser to call
    the same-origin `/api/v1/*` proxy instead of the API Gateway hostname directly.
11. Add these **Pages Function runtime** values (without the `VITE_` prefix):
    - `DAVDEPLOY_API_ORIGIN=https://<deployed-api-host>`
    - `DAVDEPLOY_COGNITO_TOKEN_ENDPOINT=https://<cognito-hosted-domain>/oauth2/token`
    - `DAVDEPLOY_COGNITO_CLIENT_ID=<public-client-id>`
      These are routing/public-client values, not credentials. The Function uses them only to forward
      requests and perform Cognito's public-client refresh exchange.
12. Do not add cloud credentials, GitHub secrets, a Cloudflare API token, Cognito client secret,
    database binding, KV, R2, D1, or Durable Object.
13. Deploy and wait for the dashboard to report a successful build. Use the hostname Cloudflare
    actually allocates; do not guess it in advance.

## Smoke test

Static hosting checks already verified the public overview, production assets, security headers,
and direct refreshes for every core route. Repeat the authenticated checks after the API and OIDC
configuration is available.

1. Open the assigned HTTPS `*.pages.dev` URL and confirm the public overview renders.
2. Open `/login` and complete email OTP sign-in. If Google federation is enabled, repeat with
   Google sign-in.
3. Confirm `/overview` loads the signed-in workspace from the cloud API.
4. Refresh `/history` directly and confirm the SPA remains loaded.
5. Confirm an unauthorized role cannot approve a plan and a backend 403 is shown safely.
6. Open browser developer tools: confirm API calls use the same-origin `/api/v1/*` proxy, no token
   or secret appears in local/session storage or the bundle, and security headers are present.
7. Close the DavDeploy tab, reopen `https://davdeploy.tech`, and confirm the workspace restores
   without another email code. Sign out, reopen the site, and confirm a new sign-in is required.
8. Exercise a read-only dashboard and a local/plan-only workflow before enabling any live execution.

If authentication or API calls fail, verify the exact Pages origin in API CORS and OIDC callback
allowlists. Preview URLs should not be broadly wildcarded into production tenant access.

## Custom-domain changes

`davdeploy.tech` is the active custom domain. If a further production origin is ever added, add the
exact new origin to backend CORS and exact callback/logout URLs to the identity provider, update the
three URL environment values, redeploy, and run an authenticated acceptance check. No wildcard
origin should be added.
