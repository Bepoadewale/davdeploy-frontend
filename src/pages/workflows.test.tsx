import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  profile: {
    user: { subject: 'developer', role: 'developer' as 'developer' | 'administrator' },
    workspace: { id: 'workspace-1', name: 'Founder workspace' },
  },
  api: { request: vi.fn() },
}));
vi.mock('../auth/AuthContext', () => ({ useAuth: () => auth }));

import ActivityPage from './ActivityPage';
import NewPlanPage from './NewPlanPage';
import PlanPage from './PlanPage';
import SettingsPage from './SettingsPage';

const review = {
  id: 'revision-1',
  plan_id: 'customer-plan-1',
  revision: 1,
  state: 'SUBMITTED',
  creator_subject: 'developer',
  content_digest: 'a'.repeat(64),
  content: {
    summary: { selected_profile: 'App Runner', why: 'Lowest-complexity viable profile' },
    resource_breakdown: [
      { name: 'Application', service: 'Managed application runtime', purpose: 'Managed compute' },
    ],
    security: ['Private customer data'],
    cost_estimate: { monthly_low: 20, monthly_high: 50, assumptions: ['Fixture estimate'] },
    observability: { prometheus: true, grafana: true },
    risks_and_limitations: ['Live deployment is not enabled'],
  },
};

const verifiedAwsConnection = {
  id: 'connection-1',
  display_name: 'AWS account 123456789012',
  account_id: '123456789012',
  setup_state: 'VERIFIED',
};

describe('customer workflows', () => {
  it('completes the supported repository-to-review planning contract', async () => {
    auth.profile.user.role = 'developer';
    auth.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({
          execution: 'SIMULATED',
          installations: [{ id: 'install-1', account_login: 'demo', account_type: 'Organization' }],
        });
      if (path === '/api/v1/cloud-connections') return Promise.resolve([verifiedAwsConnection]);
      if (path.endsWith('/repositories'))
        return Promise.resolve([
          {
            full_name: 'example/support-api',
            html_url: 'https://github.com/example/support-api',
            default_branch: 'main',
          },
        ]);
      if (path.endsWith('/branches')) return Promise.resolve({ branches: ['main'] });
      if (path === '/api/v1/projects')
        return Promise.resolve({ id: 'project-1', name: 'project-1' });
      if (path.endsWith('/repository-discovery')) return Promise.resolve({ evidence: [] });
      if (path === '/api/v1/intents') return Promise.resolve({ id: 'intent-1' });
      if (path === '/api/v1/intents/intent-1/plans')
        return Promise.resolve({
          id: 'deployment-1',
          selected_architecture: { profile: 'App Runner', components: [] },
        });
      if (path === '/api/v1/deployment-plans/deployment-1/customer-review')
        return Promise.resolve({ ...review, state: 'DRAFT' });
      return Promise.reject(new Error(`Unexpected ${path}`));
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NewPlanPage />} />
          <Route path="/plans/:revisionId" element={<div>Review opened</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('option', { name: 'example/support-api' })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Project name' }), 'Support API');
    await user.type(screen.getByRole('textbox', { name: 'AWS account ID' }), '123456789012');
    await user.click(screen.getByRole('button', { name: /analyze and create plan/i }));
    expect(await screen.findByText('Review opened')).toBeInTheDocument();
    expect(auth.api.request).toHaveBeenCalledWith(
      '/api/v1/projects',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ name: 'Support API' }),
      }),
    );
    expect(auth.api.request).toHaveBeenCalledWith(
      '/api/v1/intents',
      expect.objectContaining({
        method: 'POST',
        retrySafe: false,
        body: expect.objectContaining({
          project_id: 'project-1',
          cloud_connection_id: 'connection-1',
          source_repository: 'https://github.com/example/support-api',
          prompt: expect.stringContaining('average_rps=5; peak_rps=20'),
        }),
      }),
    );
  });

  it('collects visible customer-friendly material requirements', async () => {
    auth.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({ execution: 'SIMULATED', installations: [] });
      if (path === '/api/v1/cloud-connections') return Promise.resolve([verifiedAwsConnection]);
      return Promise.resolve([]);
    });

    render(
      <MemoryRouter>
        <NewPlanPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Choose the closest fit' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Project name' })).toHaveAttribute(
      'maxlength',
      '64',
    );
    expect(screen.getByRole('textbox', { name: 'Project name' })).toBeRequired();
    expect(screen.getByRole('combobox', { name: 'Cloud provider' })).toHaveValue('aws');
    expect(screen.getByRole('textbox', { name: 'AWS account ID' })).toBeRequired();
    expect(screen.getByRole('combobox', { name: /expected usage/i })).toHaveValue('5');
    expect(screen.getByRole('combobox', { name: /peak pattern/i })).toHaveValue('4');
    expect(screen.getByRole('combobox', { name: /monthly budget/i })).toHaveValue('500');
    expect(screen.getByRole('combobox', { name: /product type/i })).toHaveValue('AI API');
    expect(screen.getByText(/no traffic forecast is required/i)).toBeInTheDocument();
  });

  it('keeps future cloud providers visible without presenting them as available', async () => {
    auth.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({ execution: 'SIMULATED', installations: [] });
      if (path === '/api/v1/cloud-connections') return Promise.resolve([]);
      return Promise.resolve([]);
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NewPlanPage />
      </MemoryRouter>,
    );

    const provider = await screen.findByRole('combobox', { name: 'Cloud provider' });
    await user.selectOptions(provider, 'azure');
    expect(screen.getByText(/azure connections are coming soon/i)).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'AWS account ID' })).not.toBeInTheDocument();
  });

  it('routes account setup from Create Plan into Connections', async () => {
    auth.api.request.mockImplementation((path: string, options?: { method?: string }) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({ execution: 'SIMULATED', installations: [] });
      if (path === '/api/v1/cloud-connections' && options?.method === 'POST')
        return Promise.resolve({ id: 'connection-2', setup_state: 'PENDING' });
      if (path === '/api/v1/cloud-connections') return Promise.resolve([]);
      if (path === '/api/v1/cloud-connections/connection-2/aws-quick-create')
        return Promise.resolve({
          quick_create_url: 'https://console.aws.amazon.com/cloudformation',
        });
      return Promise.reject(new Error(`Unexpected ${path}`));
    });
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NewPlanPage />
      </MemoryRouter>,
    );

    await user.type(await screen.findByRole('textbox', { name: 'AWS account ID' }), '123456789012');
    await user.click(screen.getByRole('button', { name: 'Connect Account' }));

    expect(auth.api.request).not.toHaveBeenCalledWith(
      '/api/v1/cloud-connections',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('explains an unworkable budget in plain English and keeps technical detail optional', async () => {
    auth.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({ execution: 'SIMULATED', installations: [] });
      if (path === '/api/v1/cloud-connections') return Promise.resolve([verifiedAwsConnection]);
      if (path.startsWith('/api/v1/github/public-repository?'))
        return Promise.resolve({
          full_name: 'example/support-api',
          html_url: 'https://github.com/example/support-api',
          default_branch: 'main',
          branches: ['main'],
        });
      if (path === '/api/v1/projects') return Promise.resolve({ id: 'project-1' });
      if (path.endsWith('/repository-discovery')) return Promise.resolve({ evidence: [] });
      if (path === '/api/v1/intents') return Promise.resolve({ id: 'intent-1' });
      if (path.endsWith('/plans'))
        return Promise.reject(
          new Error(
            'no viable architecture: estimated upper cost including required Prometheus/Grafana monitoring exceeds the hard monthly budget',
          ),
        );
      return Promise.reject(new Error(`Unexpected ${path}`));
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NewPlanPage />
      </MemoryRouter>,
    );
    await user.click(await screen.findByRole('button', { name: 'Public GitHub URL' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Public GitHub repository' }),
      'https://github.com/example/support-api',
    );
    await user.click(screen.getByRole('button', { name: 'Check repository' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Monthly budget' }), '100');
    await user.type(screen.getByRole('textbox', { name: 'Project name' }), 'Support API');
    await user.type(screen.getByRole('textbox', { name: 'AWS account ID' }), '123456789012');
    await user.click(await screen.findByRole('button', { name: /analyze and create plan/i }));
    expect(await screen.findByText('This plan needs a larger budget.')).toBeInTheDocument();
    expect(screen.getByText(/choose \$250 or more, then try again/i)).toBeInTheDocument();
    expect(screen.getByText('Technical details')).toBeInTheDocument();
  });

  it('verifies and plans from a customer-selected public repository', async () => {
    auth.profile.user.role = 'administrator';
    auth.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({ execution: 'SIMULATED', installations: [] });
      if (path === '/api/v1/cloud-connections') return Promise.resolve([verifiedAwsConnection]);
      if (path.startsWith('/api/v1/github/public-repository?'))
        return Promise.resolve({
          full_name: 'Bepoadewale/ai-platform-control-plane',
          html_url: 'https://github.com/Bepoadewale/ai-platform-control-plane',
          default_branch: 'main',
          branches: ['main'],
          execution: 'EXECUTED_PUBLIC_READ_ONLY',
        });
      if (path === '/api/v1/projects')
        return Promise.resolve({ id: 'public-project', name: 'public-project' });
      if (path.endsWith('/repository-discovery')) return Promise.resolve({ evidence: [] });
      if (path === '/api/v1/intents') return Promise.resolve({ id: 'public-intent' });
      if (path === '/api/v1/intents/public-intent/plans')
        return Promise.resolve({
          id: 'public-deployment-plan',
          selected_architecture: { profile: 'AWS Lambda API', components: [] },
        });
      if (path === '/api/v1/deployment-plans/public-deployment-plan/customer-review')
        return Promise.resolve({ ...review, state: 'DRAFT' });
      return Promise.reject(new Error(`Unexpected ${path}`));
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NewPlanPage />} />
          <Route path="/plans/:revisionId" element={<div>Public review opened</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: 'Public GitHub URL' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Public GitHub repository' }),
      'https://github.com/Bepoadewale/ai-platform-control-plane',
    );
    await user.click(screen.getByRole('button', { name: 'Check repository' }));
    expect(
      await screen.findByText('Bepoadewale/ai-platform-control-plane verified read-only'),
    ).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Project name' }), 'AI Control Plane');
    await user.type(screen.getByRole('textbox', { name: 'AWS account ID' }), '123456789012');
    await user.click(screen.getByRole('button', { name: /analyze and create plan/i }));

    expect(await screen.findByText('Public review opened')).toBeInTheDocument();
    expect(auth.api.request).toHaveBeenCalledWith(
      '/api/v1/projects',
      expect.objectContaining({
        body: expect.objectContaining({
          repository_url: 'https://github.com/Bepoadewale/ai-platform-control-plane',
          repository_branch: 'main',
        }),
      }),
    );
  });

  it('submits an exact-digest administrator approval and reports backend success', async () => {
    auth.profile.user.role = 'administrator';
    auth.api.request.mockImplementation((path: string, options?: { method?: string }) => {
      if (options?.method === 'POST') return Promise.resolve({ ...review, state: 'APPROVED' });
      return Promise.resolve(review);
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/plans/revision-1']}>
        <Routes>
          <Route path="/plans/:revisionId" element={<PlanPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole('button', { name: /approve exact digest/i });
    expect(screen.queryByText('Lowest-complexity viable profile')).not.toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: /approve exact digest/i }));
    await waitFor(() =>
      expect(auth.api.request).toHaveBeenCalledWith(
        '/api/v1/customer-plan-revisions/revision-1/decisions',
        expect.objectContaining({
          method: 'POST',
          body: { decision: 'APPROVED', content_digest: 'a'.repeat(64) },
        }),
      ),
    );
    expect(await screen.findByText(/approval persisted/i)).toBeInTheDocument();
  });

  it('keeps a failed plan decision visible and understandable', async () => {
    auth.profile.user.role = 'administrator';
    auth.api.request.mockImplementation((_path: string, options?: { method?: string }) => {
      if (options?.method === 'POST')
        return Promise.reject(new Error('The plan changed. Refresh it first.'));
      return Promise.resolve(review);
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/plans/revision-1']}>
        <Routes>
          <Route path="/plans/:revisionId" element={<PlanPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: /approve exact digest/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The plan changed. Refresh it first.',
    );
  });

  it('keeps plan evidence compact until a reviewer chooses to read details', async () => {
    auth.profile.user.role = 'developer';
    auth.api.request.mockResolvedValue({
      ...review,
      state: 'DRAFT',
      content: {
        ...review.content,
        application_analysis: { repository: 'example/support-api', workload: 'API' },
      },
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/plans/revision-1']}>
        <Routes>
          <Route path="/plans/:revisionId" element={<PlanPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const applicationDetails = (await screen.findByText('Interpreted requirements')).closest(
      'details',
    );
    expect(applicationDetails).not.toHaveAttribute('open');
    expect(screen.getAllByText('Read details')).toHaveLength(7);
    await user.click(screen.getAllByText('Read details')[0]);
    expect(applicationDetails).toHaveAttribute('open');
    expect(screen.getByText('example/support-api')).toBeVisible();
    await user.click(screen.getAllByRole('button', { name: 'Close details' })[0]);
    expect(applicationDetails).not.toHaveAttribute('open');
  });

  it('groups audit evidence and exposes inspectable event detail', async () => {
    auth.api.request.mockResolvedValue([
      {
        id: 'event-1',
        action: 'plan_submitted',
        at: '2026-10-16T12:00:00Z',
        actor_subject: 'developer',
        entity_type: 'plan',
        metadata: { digest: 'abc', project_name: 'Payments', environment: 'production' },
      },
      {
        id: 'event-2',
        action: 'plan_created',
        at: '2026-10-16T10:00:00Z',
        actor_subject: 'developer',
        entity_type: 'plan',
        metadata: { project_name: 'Analytics', environment: 'staging' },
      },
    ]);
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ActivityPage />
      </MemoryRouter>,
    );
    await user.click(await screen.findByRole('button', { name: /plan submitted/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: /plan submitted/i })).toBeInTheDocument();
    expect(within(dialog).getByText(/event evidence/i)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));

    await user.selectOptions(screen.getByLabelText('Project'), 'Payments');
    await user.selectOptions(screen.getByLabelText('Environment'), 'production');
    expect(screen.queryByRole('button', { name: /plan created/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download evidence' })).toBeEnabled();
  });

  it('records a support request without claiming it sends an email', async () => {
    auth.profile.user.role = 'developer';
    auth.api.request.mockImplementation((path: string, options?: { method?: string }) => {
      if (path.endsWith('/members'))
        return Promise.resolve([{ subject: 'developer', role: 'developer' }]);
      if (path.endsWith('/usage')) return Promise.resolve({});
      if (path.endsWith('/subscription')) return Promise.resolve({});
      if (path === '/api/v1/support/tickets' && options?.method === 'POST')
        return Promise.resolve({});
      return Promise.reject(new Error(`Unexpected ${path}`));
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: 'Request product support' });
    await user.type(screen.getByLabelText('Subject'), 'Need help with a plan');
    await user.type(screen.getByLabelText('Details'), 'The review needs clarification.');
    await user.click(screen.getByRole('button', { name: 'Record support request' }));

    await waitFor(() =>
      expect(auth.api.request).toHaveBeenCalledWith(
        '/api/v1/support/tickets',
        expect.objectContaining({
          method: 'POST',
          body: { subject: 'Need help with a plan', body: 'The review needs clarification.' },
        }),
      ),
    );
    expect(screen.getByRole('link', { name: 'Email support instead' })).toHaveAttribute(
      'href',
      'mailto:support@davdeploy.tech',
    );
  });

  it('keeps payment collection out of billing-ready settings', async () => {
    auth.profile.user.role = 'developer';
    auth.api.request.mockImplementation((path: string) => {
      if (path.endsWith('/members'))
        return Promise.resolve([{ subject: 'developer', role: 'developer' }]);
      if (path.endsWith('/usage')) return Promise.resolve({ plans_created: 2 });
      if (path.endsWith('/subscription'))
        return Promise.resolve({
          plan_name: 'private-beta',
          state: 'ACTIVE',
          limits: { plans: 20 },
        });
      return Promise.resolve({});
    });
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/does not collect payment details/i)).toBeInTheDocument();
    expect(document.querySelector('.settings-stack')).toBeInTheDocument();
    expect(document.querySelector('.settings-grid')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request deletion/i })).toBeDisabled();
  });

  it('lets administrators inspect, resend, and cancel email invitations', async () => {
    auth.profile.user.role = 'administrator';
    const requests: Array<{ path: string; method?: string }> = [];
    auth.api.request.mockImplementation((path: string, options?: { method?: string }) => {
      requests.push({ path, method: options?.method });
      if (path.endsWith('/members'))
        return Promise.resolve([{ subject: 'administrator', role: 'administrator' }]);
      if (path === '/api/v1/workspace/invitations')
        return Promise.resolve([
          {
            id: 'invite-1',
            email: 'invitee@example.com',
            role: 'developer',
            state: 'PENDING',
            delivery_state: 'SENT',
            send_count: 1,
            expires_at: '2026-10-28T12:00:00Z',
          },
        ]);
      if (path.endsWith('/usage')) return Promise.resolve({});
      if (path.endsWith('/subscription'))
        return Promise.resolve({ plan_name: 'private-beta', state: 'ACTIVE', limits: {} });
      if (path.endsWith('/resend') || path.endsWith('/cancel')) return Promise.resolve({});
      return Promise.reject(new Error(`Unexpected ${path}`));
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('invitee@example.com')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Resend' }));
    await waitFor(() =>
      expect(requests).toContainEqual({
        path: '/api/v1/workspace/invitations/invite-1/resend',
        method: 'POST',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(requests).toContainEqual({
        path: '/api/v1/workspace/invitations/invite-1/cancel',
        method: 'POST',
      }),
    );
  });
});
