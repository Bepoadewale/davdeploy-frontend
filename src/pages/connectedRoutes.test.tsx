import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  api: { request: vi.fn() },
}));

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ api: state.api }),
}));

import ConnectionsPage from './ConnectionsPage';
import HistoryPage from './HistoryPage';

const openWindow = vi.spyOn(window, 'open').mockImplementation(() => null);

describe('authenticated connected-route acceptance', () => {
  beforeEach(() => {
    state.api.request.mockReset();
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

  it('shows plan history without exposing opaque member IDs', async () => {
    state.api.request.mockResolvedValue({
      workspace: { id: 'workspace-1', name: 'Acme' },
      projects: [],
      cloud_connections: [],
      plans: [
        {
          id: 'plan-1',
          project_id: 'project-1',
          project_name: 'Payments',
          title: 'Payments API',
          revision: 1,
          state: 'SUBMITTED',
          creator_subject: 'dev-1',
          created_at: '2026-10-25T12:00:00Z',
        },
        {
          id: 'plan-2',
          project_id: 'project-1',
          project_name: 'Payments',
          title: 'Payments API',
          revision: 2,
          state: 'APPROVED',
          creator_subject: 'admin-1',
          created_at: '2026-10-25T13:00:00Z',
        },
      ],
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('2 revisions')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'admin-1');
    expect(screen.queryByText(/Revision 1/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Revision 2/)).not.toBeInTheDocument();
    expect(screen.queryByText('admin-1')).not.toBeInTheDocument();
    expect(screen.queryByText('dev-1')).not.toBeInTheDocument();
  });
});
