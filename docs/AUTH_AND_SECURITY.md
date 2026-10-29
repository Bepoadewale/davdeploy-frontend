# Authentication and browser security

## Hosted identity

Hosted mode uses Amazon Cognito as the central identity broker. Google sign-in uses authorization
code and PKCE through `oidc-client-ts`. Email sign-in uses Cognito's passwordless `EMAIL_OTP`
challenge through the public user-pool client. Configure the exact Cognito issuer, region, public
client ID, callback URL, and logout URL. No client secret belongs in a browser application.

Google is shown only when `VITE_GOOGLE_SIGN_IN_ENABLED=true` and the OIDC values are complete.
Keep it false until the Google provider is configured in Cognito. Email OTP remains independent.

On the production site, a same-origin Cloudflare Pages Function exchanges the successful Cognito
result for two host-only, `HttpOnly`, `Secure`, `SameSite=Lax` cookies. The short-lived ID-token
cookie lasts 15 minutes and the refresh-token cookie lasts seven days. They are never readable by
browser JavaScript, so closing and reopening DavDeploy can restore a session until the user signs
out or the seven-day Cognito refresh period ends. The Function refreshes the ID token before expiry
and forwards the existing bearer request to the API; the API authorization model does not change.

The direct development fallback retains tokens only in `sessionStorage`, never `localStorage`.
Sign-out, rejected refresh, and an expired refresh period clear the browser session. The session
endpoint validates a Cognito ID token with `/api/v1/me`; state-changing cookie requests require the
same-site Origin. This is deliberately a first-party `davdeploy.tech` session, not a shared cookie
for `pages.dev` or another domain.

On October 29, 2026, the founder completed the production visual check: email-OTP sign-in,
closing/reopening DavDeploy, successful session restoration, then sign-out and confirmation that
restoration no longer occurred. This complements the recorded HTTP-level cookie check.

After sign-in, `/api/v1/me` resolves the server-owned workspace membership and role. A verified new
identity can call `/api/v1/onboarding`; the backend creates a personal workspace or accepts a
matching invitation. Identity-token
organization, email, or role claims are not treated as authorization. The backend must verify issuer,
audience, signature, expiry, server membership, tenant scope, and operation-specific policy.

Google is federated through Cognito, so both sign-in methods produce the same trusted issuer and
backend membership lookup. The production client is configured for the hosted Cognito provider at
`https://davdeploy.tech`; a full live invitation, sign-in, workspace, plan, approval, and sign-out
journey still needs recorded browser acceptance evidence.

## Local fixture

`VITE_AUTH_MODE=local-fixture` and `VITE_ENABLE_LOCAL_LOGIN=true` work only in Vite development mode.
The backend also disables `/auth/local-login` when hosted mode is enabled. Static production builds
cannot turn this development control into an authorization bypass.

## Browser threat model

- The browser can be malicious; every tenant/role/digest/policy check is server-side.
- React escapes API-rendered text, replacing the old `innerHTML` pattern.
- `_headers` denies framing, objects, sensitive device APIs, mixed content, and third-party scripts.
- The bundle contains public configuration only; secrets and provider credentials remain backend
  secret-manager values.
- Cloud and GitHub connection screens exchange metadata and reviewed URLs, never provider credentials.
- Mutations are not automatically retried. Destructive lifecycle requests require confirmation and
  remain backend-controlled workflows.
- The browser-session proxy uses host-only `HttpOnly`, `Secure`, `SameSite=Lax` cookies and checks
  the exact same-site Origin for cookie-authenticated mutations. The backend still receives its
  normal short-lived bearer token and remains the authorization authority.

The CSP permits the deployed HTTPS API/identity connections. Keep `connect-src` limited to the
exact production hosts and validate sign-in at `https://davdeploy.tech`; the `pages.dev` hostname is
not an authenticated application origin.

See `docs/CONFIGURATION_SECURITY.md` for the enforced boundary between public `VITE_*` values,
GitHub Actions configuration, and confidential backend/provider credentials.
