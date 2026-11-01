# ticket93 - align workspace guidance with password and authenticator access

PR: [#93](https://github.com/Bepoadewale/davdeploy-frontend/pull/93)

Branch: `docs/password-totp-operating-guidance`

## Problem / goal

Remove stale email-code guidance after the production change to password and
required authenticator-app access.

## Current repo state

The sign-in screen now uses password plus TOTP. The Settings security panel and
Cloudflare Pages handoff still described optional TOTP and passwordless email
sign-in.

## Research / references used

- Deployed Cognito user-pool configuration: password is the sole first factor
  and software-token MFA is required.
- The deployed Pages proxy and current LoginPage workflow.

## Work planned for the PR

- Replace the obsolete Settings enrollment control with accurate guidance.
- Correct the Pages deployment, authentication, and smoke-test documentation.
- Clarify the account-confirmation error wording.

## Acceptance criteria

- [x] Settings no longer claims email-code sign-in is available.
- [x] Pages handoff documents password, authenticator, and one-day persistence.
- [x] Authentication security documentation accurately states the deployed flow.
- [x] TypeScript validation passes.
- [x] Full local verification passes.
- [ ] Required GitHub CI passes.

## Acceptance status

The full local verification passed: formatting, lint, type checking, 85 tests,
contract and static-hosting checks, production build, and production dependency
audit. Hosted checks remain pending.

## Tests / validation performed

See `docs/test/test93.md`.

## Evidence files produced

- `docs/test/test93.md`

## Boundaries

This does not change Cognito, authentication logic, API authorization, or
cloud infrastructure. It removes a misleading second authenticator-enrollment
surface after first-time setup has become mandatory during sign-in.

## Follow-up work

Perform the controlled live customer sign-in journey with a real authenticator
app.
