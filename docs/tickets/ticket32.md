# ticket32 — Cover hosted authentication callback states

PR: [#32](https://github.com/Bepoadewale/davdeploy-frontend/pull/32)

## Problem / goal

Directly test the customer-visible hosted OIDC callback page, which was previously untested despite
being the boundary between Cognito sign-in and workspace resolution.

## Current repo state

`AuthCallbackPage` starts callback completion once, displays an in-progress or actionable failure
state, and redirects an already resolved workspace profile. These behaviors were not directly
protected by regression tests.

## References

- `src/pages/AuthCallbackPage.tsx`
- `src/auth/AuthContext.tsx`
- Hosted Cognito/OIDC callback configuration.

## Acceptance criteria

- [x] Callback completion starts exactly once on page entry.
- [x] In-progress and failure states are clear and actionable.
- [x] An already resolved profile redirects to the authenticated overview route.
- [x] Focused test and complete verification pass.

## Validation

See `docs/test/test32.md`.

## Boundaries and follow-up

This is local browser-mock coverage. It does not call Cognito, create an account, send email, or
mutate a customer workspace. A controlled live-browser journey remains required before broad beta.
