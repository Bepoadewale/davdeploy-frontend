import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';

const mocks = vi.hoisted(() => {
  const request = vi.fn();
  return {
    api: { request },
    profile: {
      user: { subject: 'author', role: 'administrator' },
      workspace: { id: 'workspace-1', name: 'DavDeploy' },
    },
    request,
    signOut: vi.fn(),
  };
});

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ api: mocks.api, profile: mocks.profile, signOut: mocks.signOut }),
}));

vi.mock('../config', () => ({ publicConfigurationIssues: () => [] }));

function renderWorkspace() {
  return render(
    <MemoryRouter initialEntries={['/overview']}>
      <Routes>
        <Route path="*" element={<AppShell />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('workspace blog author navigation', () => {
  beforeEach(() => {
    mocks.request.mockReset().mockResolvedValue({ can_publish: false });
  });

  it('shows a direct editor link when the backend confirms author access', async () => {
    mocks.request.mockResolvedValue({ can_publish: true });

    renderWorkspace();

    expect(await screen.findByRole('link', { name: 'Write a post' })).toHaveAttribute(
      'href',
      '/blog/manage',
    );
  });

  it('keeps the editor link hidden when the backend denies author access', async () => {
    renderWorkspace();

    expect(await screen.findByRole('link', { name: 'Help and updates' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Write a post' })).not.toBeInTheDocument();
  });
});
