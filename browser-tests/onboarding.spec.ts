import { expect, test, type Page } from '@playwright/test';

const profile = {
  user: { subject: 'fixture-founder', role: 'administrator' },
  workspace: { id: 'workspace-fixture', name: 'Fixture workspace', organization_id: 'org-fixture' },
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

test('AWS pilot access stays blocked until it is explicitly acknowledged', async ({ page }) => {
  await signInToFixtureWorkspace(page, 'Administrator');
  await navigateWorkspace(page, '/connections');

  await page.getByRole('button', { name: /Enable deployment pilot/ }).click();
  await page.getByRole('textbox', { name: 'AWS account ID' }).fill('123456789012');
  await expect(page.getByRole('button', { name: 'Enable pilot access' })).toBeDisabled();
  await page.getByRole('checkbox').check();
  await expect(page.getByRole('button', { name: 'Enable pilot access' })).toBeEnabled();
  await expect(page.getByText(/create, change, and delete AWS resources/i)).toBeVisible();
});

test('plan setup keeps provider limits and input errors in plain English', async ({ page }) => {
  await signInToFixtureWorkspace(page, 'Developer');
  await navigateWorkspace(page, '/plans/new');

  await expect(page.getByRole('heading', { name: 'Start with the outcome.' })).toBeVisible();
  await page.getByLabel('Cloud provider').selectOption('azure');
  await expect(page.getByRole('status')).toContainText('Azure connections are coming soon');
  await page.getByLabel('Cloud provider').selectOption('aws');
  await page.getByLabel('AWS account ID').fill('12345678901');
  await page.getByRole('button', { name: 'Connect Account' }).click();
  await expect(page.getByText('Enter a 12-digit AWS account ID.')).toBeVisible();
  await expect(
    page.getByText('Use the account where you want DavDeploy to plan the deployment.'),
  ).toBeVisible();
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
