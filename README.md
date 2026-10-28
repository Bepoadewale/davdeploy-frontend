# davdeploy frontend

Public static React client for [davdeploy](https://github.com/Bepoadewale/davdeploy),
the governed control plane for planning, approving, deploying, and observing customer-cloud
infrastructure.

The canonical production application is [davdeploy.tech](https://davdeploy.tech). It is a
Cloudflare Pages deployment configured with the hosted API and Cognito/OIDC public values.
`davdeploy-frontend.pages.dev` remains reachable as a technical Pages hostname, but is not an
authenticated application origin: backend CORS intentionally permits only `https://davdeploy.tech`.
The hosted configuration is live; a recorded end-to-end browser invitation journey remains a
separate acceptance task.

This repository owns presentation, browser-safe input validation, route state, API consumption,
and accessibility. The backend owns identity verification, memberships, tenant isolation, planning,
pricing, policy, approvals, audit integrity, integrations, secrets, execution, and observed state.

## Local development

Requirements: Node.js 22+, npm 10+, and a davdeploy API on `http://127.0.0.1:8080`.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The example enables the backend's explicit local fixture login for development only. Hosted builds
should use `VITE_AUTH_MODE=oidc` and the Cognito/OIDC values documented in
[Auth and security](docs/AUTH_AND_SECURITY.md).

## Verification

```bash
npm run verify
```

The production command is `npm run build`; output is `dist`. It is static and requires no
Cloudflare Worker, Function, storage, database, or paid plan.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API integration](docs/API_INTEGRATION.md)
- [Routes](docs/FRONTEND_ROUTES.md)
- [Authentication and security](docs/AUTH_AND_SECURITY.md)
- [Local development](docs/LOCAL_DEVELOPMENT.md)
- [Testing](docs/TESTING.md)
- [Cloudflare deployment handoff](docs/CLOUDFLARE_DEPLOY_HANDOFF.md)
- [GitHub App onboarding boundary](docs/GITHUB_ONBOARDING.md)
- [Cloudflare Free guardrails](docs/CLOUDFLARE_FREE_COST_GUARDRAILS.md)
- [Migration audit](docs/MIGRATION_AUDIT.md)
