# ticket77 - Remove unnecessary public copy

PR: [#77](https://github.com/Bepoadewale/davdeploy-frontend/pull/77)
Branch: `fix/remove-public-copy`

## Problem / goal

Remove two public lines the founder considers unnecessary while keeping the homepage and Team page structure accessible.

## Current repo state

The Team page ends with founding/location metadata, and the homepage visibly displays a large hero headline.

## Research / references used

The founder's explicit copy instruction and existing public-page accessibility tests.

## Work planned for the PR

Remove the Team metadata line and the visible homepage headline. Preserve a visually hidden semantic DavDeploy H1 for document structure and assistive technology.

## Acceptance criteria

- [x] The Team page does not show the prior founding/location metadata.
- [x] The homepage does not show “Write what you need. We build the path.”
- [x] The homepage retains an accessible H1.

## Acceptance status

Implemented and locally verified; awaiting PR CI and deployment.

## Tests / validation performed

Recorded in `docs/test/test77.md`.

## Evidence files produced

`docs/test/test77.md`.

## Boundaries

Frontend copy, semantics, and tests only. No service, infrastructure, authentication, or product behavior change.

## Follow-up work

None.
