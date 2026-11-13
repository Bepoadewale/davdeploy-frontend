import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  api: { request: vi.fn() },
  profile: { user: { role: 'developer' as 'developer' | 'administrator' } },
}));

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ api: state.api, profile: state.profile }),
}));

import ConnectionsPage from './ConnectionsPage';
import HistoryPage from './HistoryPage';

const openWindow = vi.spyOn(window, 'open').mockImplementation(() => null);

describe('authenticated connected-route acceptance', () => {
  beforeEach(() => {
    state.api.request.mockReset();
    state.profile.user.role = 'developer';
    openWindow.mockClear();
  });

  it('keeps GitHub authorization explicit and validates cloud setup before contacting the API', async () => {
    state.api.request.mockImplementation((path: string, options?: { method?: string }) => {
      if (path === '/api/v1/github/connection') {
        return Promise.resolve({
          execution: 'LIVE_READ_ONLY',
          installations: [{ id: 'install-1', account_login: 'acme', account_type: 'Organization' }],
          install_url: 'https://github.com/apps/davdeploy/installations/new',
        });
      }
      if (path === '/api/v1/cloud-connections' && !options?.method) return Promise.resolve([]);
      if (path === '/api/v1/cloud-connections' && options?.method === 'POST')
        return Promise.resolve({ id: 'connection-1', display_name: 'Cloud account 123456789012' });
      if (path.endsWith('/aws-quick-create'))
        return Promise.resolve({
          quick_create_url: 'https://console.aws.amazon.com/cloudformation/review',
        });
      throw new Error(`Unexpected ${path}`);
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ConnectionsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('acme')).toBeInTheDocument();
    expect(document.querySelector('.connection-stack')).toBeInTheDocument();
    expect(document.querySelector('.two-column')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open GitHub authorization' })).toHaveAttribute(
      'href',
      'https://github.com/apps/davdeploy/installations/new',
    );

    expect(screen.queryByRole('combobox', { name: 'Cloud provider' })).not.toBeInTheDocument();
    expect(screen.getByText(/no cloud connection/i)).toBeInTheDocument();
    expect(state.api.request).not.toHaveBeenCalledWith(
      '/api/v1/cloud-connections',
      expect.objectContaining({ method: 'POST' }),
    );

    await user.type(screen.getByRole('textbox', { name: 'AWS account ID' }), '123456789012');
    await user.click(screen.getByRole('button', { name: 'Connect account' }));
    await waitFor(() =>
      expect(openWindow).toHaveBeenCalledWith(
        'https://console.aws.amazon.com/cloudformation/review',
        '_blank',
        'noopener,noreferrer',
      ),
    );
    expect(
      await screen.findByText(/aws opened a review page for a read-only discovery role/i),
    ).toBeInTheDocument();
    expect(state.api.request).toHaveBeenCalledWith(
      '/api/v1/cloud-connections',
      expect.objectContaining({
        method: 'POST',
        body: { display_name: 'AWS account 123456789012', provider: 'aws' },
      }),
    );

    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it('does not offer broad administrator access to customers', async () => {
    state.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({ execution: 'LIVE_READ_ONLY', installations: [] });
      if (path === '/api/v1/cloud-connections') return Promise.resolve([]);
      throw new Error(`Unexpected ${path}`);
    });
    render(
      <MemoryRouter>
        <ConnectionsPage />
      </MemoryRouter>,
    );

    await screen.findByText('Customer-owned environments');
    expect(screen.queryByText(/AdministratorAccess/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /deployment pilot/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create read-only access/ })).toBeInTheDocument();
    expect(state.api.request).not.toHaveBeenCalledWith(
      '/api/v1/cloud-connections',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('does not offer plan-only role setup to a non-administrator', async () => {
    state.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({ execution: 'LIVE_READ_ONLY', installations: [] });
      if (path === '/api/v1/cloud-connections')
        return Promise.resolve([
          {
            id: 'connection-1',
            display_name: 'AWS account 123456789012',
            provider: 'aws',
            account_id: '123456789012',
            setup_state: 'VERIFIED',
            plan_role_setup_available: true,
          },
        ]);
      throw new Error(`Unexpected ${path}`);
    });
    render(
      <MemoryRouter>
        <ConnectionsPage />
      </MemoryRouter>,
    );

    await screen.findByText('Customer-owned environments');
    expect(screen.queryByRole('button', { name: 'Set up plan-only role' })).not.toBeInTheDocument();
  });

  it('keeps incomplete role setup disabled and shows a clear API failure', async () => {
    state.api.request.mockImplementation((path: string, options?: { method?: string }) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({ execution: 'LIVE_READ_ONLY', installations: [] });
      if (path === '/api/v1/cloud-connections' && !options?.method) return Promise.resolve([]);
      if (path === '/api/v1/cloud-connections' && options?.method === 'POST')
        return Promise.resolve({ id: 'connection-1' });
      if (path.endsWith('/aws-existing-role'))
        return Promise.reject(new Error('Role trust needs the external ID.'));
      throw new Error(`Unexpected ${path}`);
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ConnectionsPage />
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: /attach an existing role/i }));
    await user.type(screen.getByRole('textbox', { name: 'AWS account ID' }), '123456789012');
    expect(screen.getByRole('button', { name: 'Attach read-only role' })).toBeDisabled();
    await user.type(
      screen.getByRole('textbox', { name: 'Discovery role ARN' }),
      'arn:aws:iam::123456789012:role/DavDeployDiscovery',
    );
    await user.click(screen.getByRole('button', { name: 'Attach read-only role' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Role trust needs the external ID.');
  });

  it('lets only a workspace administrator set up and verify an eligible plan-only role', async () => {
    state.profile.user.role = 'administrator';
    let connectionReads = 0;
    state.api.request.mockImplementation((path: string, options?: { method?: string }) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({ execution: 'LIVE_READ_ONLY', installations: [] });
      if (path === '/api/v1/cloud-connections' && !options?.method) {
        connectionReads += 1;
        return Promise.resolve([
          connectionReads === 1
            ? {
                id: 'connection-1',
                display_name: 'AWS account 123456789012',
                provider: 'aws',
                account_id: '123456789012',
                setup_state: 'VERIFIED',
                plan_role_setup_available: true,
                plan_role_setup_state: 'NOT_CONFIGURED',
              }
            : {
                id: 'connection-1',
                display_name: 'AWS account 123456789012',
                provider: 'aws',
                account_id: '123456789012',
                setup_state: 'VERIFIED',
                plan_role_setup_available: false,
                plan_role_arn: 'arn:aws:iam::123456789012:role/davdeployPlan-connection-1',
                plan_role_setup_state: connectionReads === 2 ? 'SETUP_LINK_GENERATED' : 'VERIFIED',
                plan_role_policy_status:
                  connectionReads === 2 ? 'EXPECTED_UNVERIFIED' : 'POLICY_UNATTESTED',
              },
        ]);
      }
      if (path === '/api/v1/cloud-connections/connection-1/aws-quick-create')
        return Promise.resolve({
          quick_create_url: 'https://console.aws.amazon.com/cloudformation/plan-role',
        });
      if (path === '/api/v1/cloud-connections/connection-1/aws-verify')
        return Promise.resolve({ id: 'job-1', state: 'QUEUED' });
      throw new Error(`Unexpected ${path}`);
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ConnectionsPage />
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: 'Set up plan-only role' }));
    await waitFor(() =>
      expect(openWindow).toHaveBeenCalledWith(
        'https://console.aws.amazon.com/cloudformation/plan-role',
        '_blank',
        'noopener,noreferrer',
      ),
    );
    expect(state.api.request).toHaveBeenCalledWith(
      '/api/v1/cloud-connections/connection-1/aws-quick-create',
      expect.objectContaining({
        method: 'POST',
        body: { account_id: '123456789012', access_mode: 'plan-only' },
      }),
    );

    await user.click(await screen.findByRole('button', { name: 'Verify plan-only role' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Plan-only role verification queued.',
    );
    expect(await screen.findByText(/account identity verified/)).toBeInTheDocument();
    expect(
      screen.getByText(/effective AWS permissions have not been verified/),
    ).toBeInTheDocument();
  });

  it('shows plan history without exposing opaque member IDs', async () => {
    state.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/dashboard')
        return Promise.resolve({
          workspace: { id: 'workspace-1', name: 'Acme' },
          projects: [{ id: 'project-1', name: 'Payments' }],
          cloud_connections: [],
          plans: [],
        });
      if (path === '/api/v1/projects/project-1/customer-plan-revisions?limit=20')
        return Promise.resolve({
          project_id: 'project-1',
          next_cursor: null,
          items: [
            {
              id: 'revision-1',
              plan_id: 'plan-1',
              project_id: 'project-1',
              title: 'Payments API',
              revision: 1,
              state: 'SUBMITTED',
              content_digest: 'a'.repeat(64),
              created_at: '2026-10-25T12:00:00Z',
            },
            {
              id: 'revision-2',
              plan_id: 'plan-1',
              project_id: 'project-1',
              title: 'Payments API',
              revision: 2,
              state: 'APPROVED',
              content_digest: 'b'.repeat(64),
              created_at: '2026-10-25T13:00:00Z',
            },
          ],
        });
      if (path === '/api/v1/projects/project-1/generated-plan-runs?limit=100')
        return Promise.resolve({
          project_id: 'project-1',
          next_cursor: null,
          items: [
            {
              id: 'run-2',
              project_id: 'project-1',
              revision_id: 'revision-2',
              revision_sha256: 'b'.repeat(64),
              proposal_sha256: 'c'.repeat(64),
              state: 'PLAN_READY_REVIEW_ONLY',
              plan_title: 'Payments API',
              revision_number: 2,
            },
            {
              id: 'run-1',
              project_id: 'project-1',
              revision_id: 'revision-1',
              revision_sha256: 'a'.repeat(64),
              proposal_sha256: 'd'.repeat(64),
              state: 'BUILD_STARTED',
              plan_title: 'Payments API',
              revision_number: 1,
            },
          ],
        });
      if (path === '/api/v1/projects/project-1/generated-plan-apply-runs?limit=100')
        return Promise.resolve({
          project_id: 'project-1',
          next_cursor: null,
          items: [
            {
              id: 'apply-2',
              project_id: 'project-1',
              plan_title: 'Payments API',
              revision_id: 'revision-2',
              revision_number: 2,
              source_plan_run_id: 'run-2',
              artifact_id: 'artifact-2',
              state: 'APPLY_SUCCEEDED',
              error_summary: null,
            },
            {
              id: 'apply-1',
              project_id: 'project-1',
              plan_title: 'Payments API',
              revision_id: 'revision-1',
              revision_number: 1,
              source_plan_run_id: 'run-1',
              artifact_id: 'artifact-1',
              state: 'APPLY_RUNNING',
              error_summary: null,
            },
          ],
        });
      throw new Error(`Unexpected ${path}`);
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('2 shown · 2 loaded')).toBeInTheDocument();
    expect(await screen.findByText('Terraform plan ready · not applied')).toBeInTheDocument();
    expect(screen.getByText('Terraform planning is in progress')).toBeInTheDocument();
    expect(
      await screen.findByText('Terraform apply completed · health not verified'),
    ).toBeInTheDocument();
    expect(screen.getByText('Terraform apply in progress')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'admin-1');
    expect(screen.queryByText(/Revision 1/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Revision 2/)).not.toBeInTheDocument();
    expect(screen.queryByText('admin-1')).not.toBeInTheDocument();
    expect(screen.queryByText('dev-1')).not.toBeInTheDocument();
    await user.clear(screen.getByRole('textbox', { name: 'Search' }));
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'not applied');
    expect(screen.getByText('Payments API')).toBeInTheDocument();
    expect(screen.queryByText(/Revision 1/)).not.toBeInTheDocument();
  });

  it('loads older plan revisions from the project history cursor', async () => {
    state.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/dashboard')
        return Promise.resolve({
          workspace: { id: 'workspace-1', name: 'Acme' },
          projects: [{ id: 'project-1', name: 'Payments' }],
          cloud_connections: [],
          plans: [],
        });
      if (path === '/api/v1/projects/project-1/customer-plan-revisions?limit=20')
        return Promise.resolve({
          project_id: 'project-1',
          next_cursor: '00000000-0000-4000-8000-000000000002',
          items: [
            {
              id: 'revision-2',
              plan_id: 'plan-1',
              project_id: 'project-1',
              title: 'Payments API',
              revision: 2,
              state: 'APPROVED',
              content_digest: 'b'.repeat(64),
              created_at: '2026-10-25T13:00:00Z',
            },
          ],
        });
      if (
        path ===
        '/api/v1/projects/project-1/customer-plan-revisions?limit=20&cursor=00000000-0000-4000-8000-000000000002'
      )
        return Promise.resolve({
          project_id: 'project-1',
          next_cursor: null,
          items: [
            {
              id: 'revision-1',
              plan_id: 'plan-1',
              project_id: 'project-1',
              title: 'Payments API',
              revision: 1,
              state: 'SUBMITTED',
              content_digest: 'a'.repeat(64),
              created_at: '2026-10-25T12:00:00Z',
            },
          ],
        });
      throw new Error(`Unexpected ${path}`);
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Revision 2/)).toBeInTheDocument();
    expect(
      await screen.findByText(
        'Terraform plan status could not be loaded. Open a plan to check again.',
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Load older revisions' }));
    expect(await screen.findByText(/Revision 1/)).toBeInTheDocument();
    expect(state.api.request).toHaveBeenCalledWith(
      '/api/v1/projects/project-1/customer-plan-revisions?limit=20&cursor=00000000-0000-4000-8000-000000000002',
    );
    expect(screen.getByText('2 shown · 2 loaded')).toBeInTheDocument();
  });
});
