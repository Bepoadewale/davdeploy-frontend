import axe from 'axe-core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  profile: null as null | {
    user: { subject: string; role: 'developer' | 'administrator' };
    workspace: { id: string; name: string };
  },
  token: null as string | null,
  loading: false,
  error: null as string | null,
  api: { request: vi.fn() },
  signInWithGoogle: vi.fn(),
  startEmailSignIn: vi.fn(),
  verifyEmailCode: vi.fn(),
  localSignIn: vi.fn(),
  completeCallback: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('./auth/AuthContext', () => ({ useAuth: () => auth }));
import App from './App';

describe('application routes', () => {
  it('redirects unauthenticated workspace routes to sign in', async () => {
    auth.profile = null;
    render(
      <MemoryRouter initialEntries={['/overview']}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole('heading', { name: /sign in to your workspace/i }),
    ).toBeInTheDocument();
  });

  it.each([
    ['/team', /meet the founder/i],
    ['/about', /clearer infrastructure choices/i],
  ])('renders %s without requiring workspace authentication', async (path, heading) => {
    auth.profile = null;
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('renders role-aware administrator review work from the backend', async () => {
    auth.profile = {
      user: { subject: 'admin', role: 'administrator' },
      workspace: { id: 'workspace-1', name: 'Founder workspace' },
    };
    auth.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/dashboard')
        return Promise.resolve({
          workspace: { id: 'workspace-1', name: 'Founder workspace' },
          projects: [],
          cloud_connections: [],
          plans: [],
          recent_activity: [],
        });
      if (path.includes('/admin/customer-plan-revisions'))
        return Promise.resolve([
          {
            id: 'revision-1',
            plan_id: 'plan-1',
            revision: 1,
            state: 'SUBMITTED',
            creator_subject: 'developer',
            title: 'Support API',
            content_digest: 'a'.repeat(64),
            content: {
              summary: { selected_profile: 'App Runner', why: 'Simple' },
              resource_breakdown: [],
              security: [],
            },
          },
        ]);
      return Promise.reject(new Error(`Unexpected ${path}`));
    });
    const { container } = render(
      <MemoryRouter initialEntries={['/overview']}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole('heading', { name: /keep the next cloud decision moving/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Support API')).toBeInTheDocument();
    const result = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    });
    expect(result.violations).toEqual([]);
  });

  it('starts independent administrator overview requests together', async () => {
    auth.profile = {
      user: { subject: 'admin', role: 'administrator' },
      workspace: { id: 'workspace-1', name: 'Founder workspace' },
    };
    let resolveDashboard: (value: unknown) => void = () => undefined;
    let resolveQueue: (value: unknown) => void = () => undefined;
    auth.api.request.mockImplementation((path: string) => {
      if (path === '/api/v1/dashboard')
        return new Promise((resolve) => {
          resolveDashboard = resolve;
        });
      if (path.includes('/admin/customer-plan-revisions'))
        return new Promise((resolve) => {
          resolveQueue = resolve;
        });
      return Promise.reject(new Error(`Unexpected ${path}`));
    });

    render(
      <MemoryRouter initialEntries={['/overview']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(auth.api.request).toHaveBeenCalledWith(
        '/api/v1/dashboard',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(auth.api.request).toHaveBeenCalledWith(
        '/api/v1/admin/customer-plan-revisions?state=SUBMITTED',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });

    resolveDashboard({
      workspace: { id: 'workspace-1', name: 'Founder workspace' },
      projects: [],
      cloud_connections: [],
      plans: [],
      recent_activity: [],
    });
    resolveQueue([]);
    expect(
      await screen.findByRole('heading', { name: /start with a clear cloud plan/i }),
    ).toBeInTheDocument();
  });

  it('prioritizes plan continuity for a developer workspace', async () => {
    auth.profile = {
      user: { subject: 'developer', role: 'developer' },
      workspace: { id: 'workspace-1', name: 'Founder workspace' },
    };
    auth.api.request.mockResolvedValue({
      workspace: { id: 'workspace-1', name: 'Founder workspace' },
      projects: [],
      cloud_connections: [],
      plans: [],
      recent_activity: [],
    });
    render(
      <MemoryRouter initialEntries={['/overview']}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole('heading', { name: /start with a clear cloud plan/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create a plan' })).toBeInTheDocument();
    expect(screen.queryByText('Plans requiring a decision')).not.toBeInTheDocument();
    expect(screen.queryByText('Cloud work in progress')).not.toBeInTheDocument();
    expect(screen.queryByText('Latest recorded changes')).not.toBeInTheDocument();
  });

  it('keeps overview navigation in one compact quick-links panel', async () => {
    auth.profile = {
      user: { subject: 'developer', role: 'developer' },
      workspace: { id: 'workspace-1', name: 'Founder workspace' },
    };
    auth.api.request.mockResolvedValue({
      workspace: { id: 'workspace-1', name: 'Founder workspace' },
      projects: [
        { id: 'project-1', name: 'Support API', repository_url: 'https://github.com/example/api' },
      ],
      cloud_connections: [],
      plans: [
        {
          id: 'revision-1',
          project_id: 'project-1',
          title: 'Support API plan',
          revision: 1,
          state: 'DRAFT',
          created_at: '2026-10-26T20:48:00Z',
        },
      ],
      recent_activity: [
        { id: 'event-1', action: 'infrastructure.plan.draft.created', at: '2026-10-26T20:48:00Z' },
      ],
    });
    render(
      <MemoryRouter initialEntries={['/overview']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Quick links' })).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link', { name: 'Connections' })
        .find((link) => link.getAttribute('href') === '/connections'),
    ).toBeDefined();
    expect(screen.getByRole('link', { name: 'Recent projects' })).toHaveAttribute(
      'href',
      '/history',
    );
    expect(screen.getByRole('link', { name: 'Audit trail' })).toHaveAttribute('href', '/activity');
    expect(screen.queryByText('Cloud work in progress')).not.toBeInTheDocument();
    expect(screen.queryByText('Latest recorded changes')).not.toBeInTheDocument();
  });

  it('does not offer approval controls to a developer', async () => {
    auth.profile = {
      user: { subject: 'developer', role: 'developer' },
      workspace: { id: 'workspace-1', name: 'Founder workspace' },
    };
    auth.api.request.mockResolvedValue({
      id: 'revision-1',
      plan_id: 'plan-1',
      revision: 1,
      state: 'SUBMITTED',
      creator_subject: 'developer',
      content_digest: 'a'.repeat(64),
      content: {
        summary: { selected_profile: 'App Runner', why: 'Simplest viable option' },
        resource_breakdown: [],
        security: [],
      },
    });
    render(
      <MemoryRouter initialEntries={['/plans/revision-1']}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByText(/waiting for an authorized workspace administrator/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /approve exact digest/i })).not.toBeInTheDocument();
  });

  it('submits a draft using the exact backend contract', async () => {
    auth.profile = {
      user: { subject: 'developer', role: 'developer' },
      workspace: { id: 'workspace-1', name: 'Founder workspace' },
    };
    auth.api.request.mockResolvedValue({
      id: 'revision-1',
      plan_id: 'plan-1',
      revision: 1,
      state: 'DRAFT',
      creator_subject: 'developer',
      content_digest: 'a'.repeat(64),
      content: {
        summary: { selected_profile: 'App Runner', why: 'Simplest viable option' },
        resource_breakdown: [],
        security: [],
      },
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/plans/revision-1']}>
        <App />
      </MemoryRouter>,
    );
    await user.click(await screen.findByRole('button', { name: /submit for approval/i }));
    await waitFor(() =>
      expect(auth.api.request).toHaveBeenCalledWith(
        '/api/v1/customer-plan-revisions/revision-1/submit',
        expect.objectContaining({ method: 'POST', retrySafe: false }),
      ),
    );
    expect(await screen.findByText(/submitted for administrator review/i)).toBeInTheDocument();
  });
});
