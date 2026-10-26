# ticket44 — Explain planning rejections in plain English

PR: [#44](https://github.com/Bepoadewale/davdeploy-frontend/pull/44)

## Problem / goal

When the planner correctly rejected an impossible combination of requirements, the form displayed
the raw implementation reason. It was technically accurate but not useful to a customer deciding
what to change.

## Current repo state

The backend safely rejects incompatible plans, including workloads whose upper estimated cost plus
required monitoring exceeds a hard budget. The frontend passed the full backend string directly
into the alert.

## Research / references used

- Controlled screenshot of the rejected plan form.
- Planner rejection conditions and budget options in the frontend form.
- Existing NewPlan workflow tests.

## Work planned for the PR

- Translate no-viable-architecture budget rejections into a short, specific next step.
- Keep raw backend information inside an optional technical-details disclosure.
- Use equally plain-language feedback for repository and generic planning failures.
- Restore the public homepage’s four-step Connect, Plan, Review, Deploy workflow.

## Acceptance criteria

- [x] A budget rejection tells the customer what to change and suggests the next budget tier.
- [x] Raw planning details are available without being the primary error message.
- [x] Generic failures do not expose raw technical text as the primary customer guidance.
- [x] The homepage shows all four intended workflow stages.

## Acceptance status

Implementation is complete pending local and hosted verification.

## Tests / validation performed

See `docs/test/test44.md`.

## Evidence files produced

- `docs/test/test44.md`

## Boundaries

This improves frontend error presentation only. It does not weaken planner constraints, modify
cost calculations, or create cloud resources.

## Follow-up work

Add structured rejection codes to the backend response so the frontend can give equally precise
guidance for every policy and architecture mismatch.
