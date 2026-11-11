import { expect, test, type Page } from '@playwright/test';

const profile = {
  user: { subject: 'fixture-founder', role: 'administrator' },
  workspace: { id: 'workspace-fixture', name: 'Fixture workspace', organization_id: 'org-fixture' },
};

const approvedRevision = {
  id: 'revision-1',
  plan_id: 'plan-1',
  project_id: 'project-1',
  revision: 1,
  state: 'APPROVED',
  creator_subject: 'fixture-founder',
  content_digest: 'a'.repeat(64),
  content: {
    summary: { selected_profile: 'App Runner', why: 'Lowest-complexity option for this API.' },
    resource_breakdown: [
      { name: 'Application', service: 'Managed application runtime', purpose: 'Run the API' },
    ],
    security: ['Private customer data'],
    cost_estimate: { monthly_low: 20, monthly_high: 50, assumptions: ['Fixture estimate'] },
    observability: {},
    risks_and_limitations: ['A generated plan must be reviewed before deployment.'],
  },
  terraform_plan_reviews: [],
  cloud_execution_runs: [],
};

async function mockApi(page: Page) {
  await page.route('http://api.fixture/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    if (path.endsWith('/auth/local-login') && method === 'POST')
      return json({ access_token: 'fixture-browser-token' });
    if (path.endsWith('/me')) return json(profile);
    if (path.endsWith('/dashboard'))
      return json({ workspace: profile.workspace, projects: [], cloud_connections: [], plans: [] });
    if (path.endsWith('/admin/customer-plan-revisions')) return json([]);
    if (path.endsWith('/github/connection'))
      return json({
        execution: 'LIVE_READ_ONLY',
        installations: [{ id: 'install-1', account_login: 'acme', account_type: 'Organization' }],
        install_url: 'https://github.com/apps/davdeploy/installations/new',
        webhooks_enabled: false,
        installation_states: [],
      });
    if (path.endsWith('/github/installations/install-1/repositories'))
      return json([
        {
          full_name: 'acme/fixture-service',
          html_url: 'https://github.com/acme/fixture-service',
          default_branch: 'main',
        },
      ]);
    if (path.endsWith('/github/installations/install-1/repositories/acme/fixture-service/branches'))
      return json({ branches: ['main'] });
    if (path.endsWith('/cloud-connections') && method === 'GET') return json([]);
    if (path.endsWith('/cloud-connections') && method === 'POST')
      return json({ id: 'connection-1', display_name: 'AWS account 123456789012' });
    if (path.endsWith('/aws-quick-create'))
      return json({ quick_create_url: 'https://console.aws.amazon.com/cloudformation/review' });
    return json({ detail: `Unexpected browser fixture request: ${method} ${path}` }, 500);
  });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('public Team and About pages remain available without workspace sign-in', async ({ page }) => {
  await page.goto('/team');
  await expect(page.getByRole('heading', { name: 'Meet the founder.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Adewale Ayeni-Bepo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about');

  await page.goto('/about');
  await expect(
    page.getByRole('heading', { name: 'Clearer infrastructure choices.' }),
  ).toBeVisible();
  await expect(
    page.getByText(/AWS is DavDeploy's initial implemented cloud provider/i),
  ).toBeVisible();
  await expect(page.getByText('They are not available today.')).toBeVisible();
});

test('public homepage serves official local brand media at desktop and mobile widths', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'DavDeploy home' }).first()).toBeVisible();
  await expect(page.locator('.ac3-hero-media .website-media-poster')).toHaveAttribute(
    'src',
    '/media/davdeploy/hero-idea-to-architecture-poster.jpg',
  );
  await expect(page.locator('.ac3-hero-media source')).toHaveAttribute(
    'src',
    '/media/davdeploy/hero-idea-to-architecture.mp4',
  );
  await expect(page.getByRole('button', { name: /architecture illustration/i })).toBeVisible();
  await expect(page.getByText('Cost is more than compute.')).toBeVisible();
});

async function signInToFixtureWorkspace(page: Page, role: 'Developer' | 'Administrator') {
  await page.goto('/login');
  await page.getByRole('button', { name: role }).click();
  await expect(page).toHaveURL(/\/overview$/);
  await expect(page.getByRole('heading', { name: 'Start with a clear cloud plan.' })).toBeVisible();
}

async function navigateWorkspace(page: Page, path: '/connections' | '/plans/new') {
  const menu = page.getByRole('button', { name: 'Menu' });
  if (await menu.isVisible()) await menu.click();
  await page.locator(`a[href="${path}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`));
}

test('local fixture sign-in reaches the first-plan workspace state', async ({ page }) => {
  await signInToFixtureWorkspace(page, 'Developer');

  await expect(page.getByRole('heading', { name: 'Start with a clear cloud plan.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Read the guide' })).toBeVisible();
});

test('AWS connection setup only offers read-only access', async ({ page }) => {
  await signInToFixtureWorkspace(page, 'Administrator');
  await navigateWorkspace(page, '/connections');

  await expect(page.getByRole('heading', { name: 'Customer-owned environments' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Attach an existing role/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Create read-only access/ })).toBeVisible();
  await expect(
    page.getByText(/AdministratorAccess|deployment pilot|create, change, and delete/i),
  ).toHaveCount(0);
});

test('plan setup keeps provider limits and input errors in plain English', async ({ page }) => {
  await signInToFixtureWorkspace(page, 'Developer');
  await navigateWorkspace(page, '/plans/new');

  await expect(page.getByRole('heading', { name: 'Start with the outcome.' })).toBeVisible();
  await expect(page.getByLabel('AWS account ID')).toBeVisible();
  await expect(page.getByLabel('Cloud provider')).toHaveCount(0);
  await page.getByLabel('AWS account ID').fill('12345678901');
  await expect(
    page.getByText(/DavDeploy never asks your browser for cloud credentials/i),
  ).toBeVisible();
});

test('approved plan leads with current status and keeps future stages collapsed', async ({
  page,
}) => {
  await page.route('http://api.fixture/api/v1/customer-plan-revisions/revision-1', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(approvedRevision),
    }),
  );
  await page.route('http://api.fixture/api/v1/projects/project-1/generated-plan-runs?*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        project_id: 'project-1',
        items: [
          {
            id: 'run-1',
            project_id: 'project-1',
            revision_id: 'revision-1',
            revision_sha256: 'a'.repeat(64),
            proposal_sha256: 'b'.repeat(64),
            state: 'PLAN_READY_REVIEW_ONLY',
            plan_title: 'Support API',
            revision_number: 1,
          },
        ],
        next_cursor: null,
      }),
    }),
  );

  await signInToFixtureWorkspace(page, 'Administrator');
  await page.evaluate(() => {
    window.history.pushState({}, '', '/plans/revision-1');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  await expect(page.getByText('Current status')).toBeVisible();
  await expect(page.getByText('Plan created; costed review is still needed')).toBeVisible();
  const stageDetails = page.locator('.deployment-details');
  await expect(stageDetails).not.toHaveAttribute('open', '');
  await expect(stageDetails.getByRole('list', { name: 'Deployment progress' })).toBeHidden();

  await page.getByText('View all deployment stages').click();
  await expect(stageDetails).toHaveAttribute('open', '');
  await expect(stageDetails.getByRole('list', { name: 'Deployment progress' })).toBeVisible();
  await expect(stageDetails.getByRole('listitem')).toHaveCount(5);
});

test('mobile navigation keeps support and product boundaries reachable', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only navigation contract');
  await signInToFixtureWorkspace(page, 'Developer');
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('link', { name: 'Help and updates' }).click();

  await expect(page.getByRole('heading', { name: 'Plan. Approve. Prepare.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact support' })).toHaveAttribute(
    'href',
    'mailto:support@davdeploy.tech',
  );
});
