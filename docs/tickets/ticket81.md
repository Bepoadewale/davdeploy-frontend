# ticket81 - Restore future-facing public metadata

PR: [#81](https://github.com/Bepoadewale/davdeploy-frontend/pull/81)
Branch: `chore/restore-future-facing-home-metadata`

## Problem / goal

Use the intended future-facing multicloud positioning in public search metadata without presenting the current provider implementation as a limitation in search results or social previews.

## Current repo state

The previous metadata refinement made the Home and About descriptions conservative by naming a current provider. This does not match the requested public marketing position.

## Research / references used

The public product positioning supplied by the founder and the existing homepage workflow: Plan, approve, deploy, and operate.

## Work planned for the PR

Restore the future-facing Home title and description, align social metadata and client-side route metadata, and make the About description provider-neutral.

## Acceptance criteria

- [x] Home search and social metadata describes the intended Plan, approve, deploy, and operate capability.
- [x] Public metadata does not name a current cloud provider.
- [x] Team and About search metadata remains clear and provider-neutral.

## Acceptance status

Implemented and locally verified; awaiting PR CI and production deployment.

## Tests / validation performed

Recorded in `docs/test/test81.md`.

## Evidence files produced

`docs/test/test81.md`.

## Boundaries

Public frontend metadata and metadata tests only. No product functionality, backend, cloud connection, or provider availability UI changes.

## Follow-up work

Review search performance after the next Google crawl.
