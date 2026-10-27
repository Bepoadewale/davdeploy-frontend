## Problem / goal

Make two central product messages clear on the public site: customers can describe what they need in natural language, and can use DavDeploy from the browser, command line, or MCP-enabled AI tools.

## Current repo state

The public homepage presents a concise product narrative, audience statement, workflow, and a truthfully labelled illustration.

## Research / references used

- Product-direction copy supplied by the founder.
- Existing concise homepage structure and accessibility tests.

## Work planned for the PR

- Make natural-language planning the homepage headline and supporting message.
- Add browser, CLI, and MCP compatibility to the audience statement.
- Update public-page assertions.

## Acceptance criteria

- Natural-language planning is visible above the fold.
- Browser, CLI, and MCP access is visible without adding a dense technical section.
- Existing public-page accessibility checks pass.

## Acceptance status

Implemented and locally verified; pending CI and review.

## Tests / validation performed

`npm run verify` passed: formatting, linting, TypeScript, 44 tests including homepage accessibility, API contract, public-environment checks, production build, static-hosting checks, SPA refresh check, and dependency audit.

## Evidence files produced

- `docs/test/test49.md`

## Boundaries

This is public product positioning only. It does not claim that a customer workflow has already completed or change browser, CLI, MCP, API, cloud, or authorization behavior.

## Follow-up work

Use the same phrases consistently in product documentation and future CLI/MCP onboarding material.
