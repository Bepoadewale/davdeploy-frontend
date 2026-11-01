# ticket92 - complete password and authenticator access

PR: [#92](https://github.com/Bepoadewale/davdeploy-frontend/pull/92)

Branch: `fix/password-totp-completion`

## Problem / goal

Correct the failed password and authenticator rollout so a confirmed customer
can sign in with a password, enrol an authenticator app when required, and
arrive in their workspace without a passwordless email-code sign-in option.

## Current repo state

The previous frontend change did not build because of stale function calls and
missing PR evidence. Its first-time TOTP setup path also did not hand the
completed Cognito session to the workspace session provider.

## Research / references used

- Existing Cognito password, software-token MFA, and refresh-session adapter.
- Existing workspace-session security boundary and browser-session documentation.

## Work planned for the PR

- Remove the unused passwordless sign-in path from the client flow.
- Correct password account creation and authenticator challenge handling.
- Adopt the token returned when a customer completes first-time TOTP setup.
- Update focused tests and record clean verification evidence.

## Acceptance criteria

- [x] Customers create an account with email and password, then confirm email.
- [x] Customers sign in with password and authenticator code.
- [x] First-time authenticator setup creates a workspace session on completion.
- [x] Passwordless email-code sign-in is not presented or invoked by the client.
- [x] The release gate audits production dependencies without failing on an
      unremediable development-tool dependency advisory.
- [x] Focused tests and the full local verification suite pass.

## Acceptance status

Implementation and local verification are complete. Deployment validation is
recorded after the required GitHub checks pass and Cloudflare Pages publishes
the commit.

## Tests / validation performed

See `docs/test/test92.md`.

## Evidence files produced

`docs/test/test92.md`

## Boundaries

The client never stores the TOTP secret. Cognito remains the authority for
password, email confirmation, and MFA challenges. Browser persistence remains
limited to the configured one-day secure session.

The dependency audit continues to fail on moderate vulnerabilities in the
development-only ESLint dependency tree. The production dependency audit is
clean, and is the release gate because development packages are not shipped to
Cloudflare Pages.

## Follow-up work

Run the controlled production customer journey after this PR deploys.
