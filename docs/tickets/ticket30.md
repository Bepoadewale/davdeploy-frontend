# ticket30 — Refresh frontend development dependencies

PR: [#30](https://github.com/Bepoadewale/davdeploy-frontend/pull/30)

## Problem / goal

Replace the five pending Dependabot updates with one compatible, verified development-tooling refresh.

## Current repo state

The pending ESLint 10, Vite 8, React Hooks, React Refresh, and Node type updates were either stale
or failed verification individually. Vite 8 requires function-form manual chunk configuration, and
React Hooks 7 exposes compiler diagnostics that do not apply to the deliberately stable auth token
reference boundary.

## Research / references used

- The five open Dependabot pull requests and their failed verification output.
- Vite 8 and React Hooks 7 compatibility diagnostics from local verification.

## Work planned for the PR

- Refresh the development-tooling dependencies together.
- Preserve existing auth/session behaviour and static build splitting.

## Acceptance criteria

- [x] Update the five pending development dependencies together.
- [x] Preserve static Cloudflare Pages output and API contract compatibility.
- [x] Run the full frontend verification suite with no dependency audit findings.

## Acceptance status

All acceptance criteria are met.

## Tests / validation performed

`npm run verify` passed: formatting, lint, TypeScript, 32 tests, API contract, public environment,
Vite 8 production build, static hosting check, SPA refresh check, and moderate audit.

## Evidence files produced

- `docs/test/test30.md`

## Boundaries

No production configuration, customer data, API contract, or Cloudflare runtime behavior changes.

## Follow-up work

Review and merge this replacement for the five stale Dependabot PRs, then close those superseded PRs
through the normal reviewed workflow.
