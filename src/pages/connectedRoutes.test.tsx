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
    expect(screen.getByRole('link', { name: 'Open GitHub authorization' })).toHaveAttribute(
      'href',
      'https://github.com/apps/davdeploy/installations/new',
    );

    await user.click(screen.getByRole('button', { name: 'Review cloud setup' }));
    expect(await screen.findByText('Enter a 12-digit cloud account ID.')).toBeInTheDocument();
    expect(state.api.request).not.toHaveBeenCalledWith(
      '/api/v1/cloud-connections',
      expect.objectContaining({ method: 'POST' }),
    );

    await user.type(screen.getByRole('textbox', { name: 'Cloud account ID' }), '123456789012');
    await user.click(screen.getByRole('button', { name: 'Review cloud setup' }));
    await waitFor(() =>
      expect(openWindow).toHaveBeenCalledWith(
        'https://console.aws.amazon.com/cloudformation/review',
        '_blank',
        'noopener,noreferrer',
      ),
    );
    expect(
      await screen.findByText(/read-only discovery role. no workload resources were requested/i),
    ).toBeInTheDocument();
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
