# ticket30 — Refresh frontend development dependencies

PR: [#30](https://github.com/Bepoadewale/davdeploy-frontend/pull/30)

## Goal

Replace the five pending Dependabot updates with one compatible, verified development-tooling refresh.

## Current state

The pending ESLint 10, Vite 8, React Hooks, React Refresh, and Node type updates were either stale
or failed verification individually. Vite 8 requires function-form manual chunk configuration, and
React Hooks 7 exposes compiler diagnostics that do not apply to the deliberately stable auth token
reference boundary.

## Acceptance criteria

- [x] Update the five pending development dependencies together.
- [x] Preserve static Cloudflare Pages output and API contract compatibility.
- [x] Run the full frontend verification suite with no dependency audit findings.

## Validation

`npm run verify` passed: formatting, lint, TypeScript, 32 tests, API contract, public environment,
Vite 8 production build, static hosting check, SPA refresh check, and moderate audit.

## Boundaries

No production configuration, customer data, API contract, or Cloudflare runtime behavior changes.
