## Problem / goal

Prevent a valid email sign-in from being discarded when the first hosted workspace request wakes a cold control plane.

## Current repo state

The generic browser API timeout is 15 seconds. A controlled sign-in showed Cognito accepting the one-time code while the immediately following workspace lookup took about 21 seconds, producing a misleading timeout message.

## Research / references used

- Controlled browser sign-in screenshot and timestamp.
- CloudWatch API Lambda timings for the matching request.
- Existing workspace-session and API timeout boundaries.

## Work planned for the PR

- Apply a 45-second timeout only to the first authenticated workspace lookup and onboarding request.
- Keep the standard 15-second timeout for ordinary product requests.
- Test both the existing-workspace and onboarding paths.

## Acceptance criteria

- A cold hosted workspace lookup has enough time to complete after Cognito accepts a code.
- Normal API timeout behaviour remains unchanged elsewhere.
- Workspace-session tests cover the dedicated timeout.

## Acceptance status

Implemented and locally verified; pending CI, review, and deployment.

## Tests / validation performed

`npm test -- --run` and `npm run build` are recorded in `docs/test/test54.md`.

## Evidence files produced

- `docs/test/test54.md`

## Boundaries

This changes only browser waiting behaviour after successful authentication. It does not weaken Cognito code expiry, alter authorization, or add retries for onboarding writes.

## Follow-up work

Re-test the browser sign-in from a cold control plane after deployment.
