# Authentication and browser security

## Hosted identity

Hosted mode uses Amazon Cognito as the central identity broker. Google sign-in uses authorization
code and PKCE through `oidc-client-ts`. Email sign-in uses Cognito's passwordless `EMAIL_OTP`
challenge through the public user-pool client. Configure the exact Cognito issuer, region, public
client ID, callback URL, and logout URL. No client secret belongs in a browser application.

Google is shown only when `VITE_GOOGLE_SIGN_IN_ENABLED=true` and the OIDC values are complete.
Keep it false until the Google provider is configured in Cognito. Email OTP remains independent.

Only transient authorization state is stored in `sessionStorage`; the returned Cognito ID token is held
in memory. A refresh signs the browser out unless the identity provider can establish a new session.
This reduces token persistence and XSS impact at the cost of session convenience. Never move a
long-lived token to localStorage.

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
- Bearer authentication avoids cookie-based CSRF. If a future deployment moves to cookies, it must
  add SameSite/secure cookie and CSRF defenses before release.

The CSP permits the deployed HTTPS API/identity connections. Keep `connect-src` limited to the
exact production hosts and validate sign-in at `https://davdeploy.tech`; the `pages.dev` hostname is
not an authenticated application origin.

See `docs/CONFIGURATION_SECURITY.md` for the enforced boundary between public `VITE_*` values,
GitHub Actions configuration, and confidential backend/provider credentials.
