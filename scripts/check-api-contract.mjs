import { readFile } from 'node:fs/promises';

const document = JSON.parse(
  await readFile(new URL('../contracts/openapi-v1.json', import.meta.url), 'utf8'),
);

const required = [
  ['post', '/api/v1/auth/local-login'],
  ['get', '/api/v1/me'],
  ['post', '/api/v1/onboarding'],
  ['get', '/api/v1/dashboard'],
  ['get', '/api/v1/workspace/members'],
  ['post', '/api/v1/workspace/invitations'],
  ['get', '/api/v1/usage'],
  ['get', '/api/v1/billing/subscription'],
  ['post', '/api/v1/api-credentials'],
  ['post', '/api/v1/support/tickets'],
  ['post', '/api/v1/data-lifecycle'],
  ['get', '/api/v1/github/connection'],
  ['get', '/api/v1/github/installations/{installation_id}/repositories'],
  ['get', '/api/v1/github/installations/{installation_id}/repositories/{repository}/branches'],
  ['get', '/api/v1/cloud-connections'],
  ['post', '/api/v1/cloud-connections'],
  ['delete', '/api/v1/cloud-connections/{connection_id}'],
  ['post', '/api/v1/cloud-connections/{connection_id}/aws-quick-create'],
  ['post', '/api/v1/projects'],
  ['get', '/api/v1/projects/{project_id}/repository-discovery'],
  ['post', '/api/v1/intents'],
  ['post', '/api/v1/intents/{intent_id}/plans'],
  ['post', '/api/v1/deployment-plans/{plan_id}/customer-review'],
  ['get', '/api/v1/customer-plan-revisions/{revision_id}'],
  ['post', '/api/v1/customer-plan-revisions/{revision_id}/submit'],
  ['post', '/api/v1/customer-plan-revisions/{revision_id}/decisions'],
  ['post', '/api/v1/customer-plan-revisions/{revision_id}/execute-dry-run'],
  ['post', '/api/v1/customer-plan-revisions/{revision_id}/desired-state-publications'],
  ['post', '/api/v1/customer-plan-revisions/{revision_id}/terraform-plan-renders'],
  ['post', '/api/v1/customer-plan-revisions/{revision_id}/cloud-readiness-preflights'],
  ['post', '/api/v1/customer-plan-revisions/{revision_id}/terraform-plan-reviews'],
  ['post', '/api/v1/customer-plan-revisions/{revision_id}/cloud-execution-runs'],
  ['get', '/api/v1/projects/{project_id}/customer-plan-revisions'],
  ['get', '/api/v1/projects/{project_id}/generated-plan-runs'],
  ['get', '/api/v1/generated-plan-apply-runs/{apply_run_id}'],
  ['get', '/api/v1/projects/{project_id}/generated-plan-apply-runs'],
  ['post', '/api/v1/customer-plans/{plan_id}/revisions'],
  ['post', '/api/v1/customer-plans/revisions/{revision_id}/comments'],
  ['get', '/api/v1/audit-evidence'],
];

const missing = required.filter(([method, path]) => !document.paths?.[path]?.[method]);
if (missing.length) {
  throw new Error(
    `Frontend-required operations are missing from the backend OpenAPI snapshot:\n${missing
      .map(([method, path]) => `${method.toUpperCase()} ${path}`)
      .join('\n')}`,
  );
}
const requiredQueryParameters = new Map([
  ['/api/v1/projects/{project_id}/customer-plan-revisions', ['limit', 'cursor']],
  ['/api/v1/projects/{project_id}/generated-plan-runs', ['limit', 'cursor', 'revision_id']],
  ['/api/v1/projects/{project_id}/generated-plan-apply-runs', ['limit', 'cursor', 'revision_id']],
]);
for (const [path, requiredNames] of requiredQueryParameters) {
  const queryNames = new Set(
    (document.paths?.[path]?.get?.parameters ?? [])
      .filter((parameter) => parameter.in === 'query')
      .map((parameter) => parameter.name),
  );
  const missingParameters = requiredNames.filter((name) => !queryNames.has(name));
  if (missingParameters.length) {
    throw new Error(
      `Frontend-required query parameters are missing from ${path}: ${missingParameters.join(', ')}`,
    );
  }
}
if (document.info?.title !== 'davdeploy') throw new Error('Unexpected API title.');
if (!document.info?.version) throw new Error('API version is missing.');
console.log(
  `Validated ${required.length} frontend operations against ${document.info.title} ${document.info.version}.`,
);
