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

    expect(screen.getByRole('combobox', { name: 'Cloud provider' })).toHaveValue('aws');
    expect(screen.getByText(/no cloud connection/i)).toBeInTheDocument();
    expect(state.api.request).not.toHaveBeenCalledWith(
      '/api/v1/cloud-connections',
      expect.objectContaining({ method: 'POST' }),
    );

    await user.type(screen.getByRole('textbox', { name: 'AWS account ID' }), '123456789012');
    await user.click(screen.getByRole('button', { name: 'Connect Account' }));
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

    await user.selectOptions(screen.getByRole('combobox', { name: 'Cloud provider' }), 'gcp');
    expect(screen.getByText(/google cloud connections are coming soon/i)).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'AWS account ID' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect Account' })).not.toBeInTheDocument();
  });

  it('requires an explicit acknowledgement before opening the administrator pilot setup', async () => {
    state.api.request.mockImplementation((path: string, options?: { method?: string }) => {
      if (path === '/api/v1/github/connection')
        return Promise.resolve({ execution: 'LIVE_READ_ONLY', installations: [] });
      if (path === '/api/v1/cloud-connections' && !options?.method) return Promise.resolve([]);
      if (path === '/api/v1/cloud-connections' && options?.method === 'POST')
        return Promise.resolve({ id: 'connection-1' });
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

    await screen.findByText('Customer-owned environments');
    await user.click(screen.getByRole('button', { name: /Enable deployment pilot/ }));
    await user.type(screen.getByRole('textbox', { name: 'AWS account ID' }), '123456789012');
    expect(screen.getByRole('button', { name: 'Enable pilot access' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Enable pilot access' }));

    await waitFor(() => expect(openWindow).toHaveBeenCalled());
    expect(state.api.request).toHaveBeenCalledWith(
      '/api/v1/cloud-connections/connection-1/aws-quick-create',
      expect.objectContaining({
        body: {
          account_id: '123456789012',
          access_mode: 'administrator-pilot',
          acknowledge_administrator_access: true,
        },
      }),
    );
  });

  it('filters and compares immutable plan history', async () => {
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
    await user.selectOptions(screen.getByLabelText('Earlier revision'), 'plan-1');
    await user.selectOptions(screen.getByLabelText('Later revision'), 'plan-2');
    expect(screen.getAllByText('SUBMITTED').length).toBeGreaterThan(1);
    expect(screen.getAllByText('APPROVED').length).toBeGreaterThan(1);

    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'admin-1');
    expect(screen.queryByText(/Revision 1/)).not.toBeInTheDocument();
    expect(screen.getByText(/Revision 2/)).toBeInTheDocument();
  });
});
