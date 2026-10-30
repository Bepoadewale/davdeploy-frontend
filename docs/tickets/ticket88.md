# Ticket 88: authenticator-app sign-in path

## Goal

Keep email-code access as the default while adding the Cognito password and
authenticator-app journey needed by users who choose TOTP MFA.

## Boundary

Cognito TOTP requires password authentication. The existing email-code flow is
not removed; a user who enables TOTP signs in with their password and then an
authenticator code. No MFA secret is persisted in browser storage.

## Acceptance

- [x] Support password-first Cognito authentication and TOTP challenges.
- [x] Support password setup/reset through Cognito's email verification flow.
- [x] Keep email-code sign-in as the default route.
- [x] Preserve TypeScript compilation.
- [ ] Deploy only after the paired backend Cognito configuration is applied.

## Validation

`npm run verify` passed: formatting, lint, TypeScript, 84 tests, API contract,
public environment, production build, static-hosting/SPA checks, and dependency
audit all completed successfully.
