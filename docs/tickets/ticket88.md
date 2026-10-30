# ticket88 - authenticator-app sign-in path

PR: [#88](https://github.com/Bepoadewale/davdeploy-frontend/pull/88)

Branch: `security/mfa-enrolment-api-proxy`

## Problem / goal

Keep email-code access as the default while adding Cognito password and
authenticator-app sign-in for users who choose TOTP MFA.

## Current repo state

The public client currently supports passwordless email-code and Google OIDC sign-in.

## Research / references used

- AWS Cognito TOTP and choice-based authentication documentation.

## Work planned for the PR

Add password-plus-TOTP sign-in and password setup while retaining email-code sign-in.

## Acceptance criteria

- [x] Support password-first Cognito authentication and TOTP challenges.
- [x] Support password setup/reset through Cognito's email verification flow.
- [x] Keep email-code sign-in as the default route.
- [x] Preserve TypeScript compilation.
- [ ] Deploy only after the paired backend Cognito configuration is applied.

## Acceptance status

The static-client implementation and full local verification are complete.
Production activation depends on the paired backend Terraform deployment.

## Tests / validation performed

`npm run verify` passed: formatting, lint, TypeScript, 84 tests, API contract,
public environment, production build, static-hosting/SPA checks, and dependency audit.

## Evidence files produced

`docs/test/test88.md` contains the verification record.

## Boundaries

Cognito TOTP requires password authentication. The existing email-code flow is
not removed; a user who enables TOTP signs in with their password and then an
authenticator code. No MFA secret is persisted in browser storage.

## Follow-up work

Deploy after the paired backend configuration is live and run a controlled TOTP journey.
