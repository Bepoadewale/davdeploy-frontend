import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthCallbackPage from './AuthCallbackPage';

const state = vi.hoisted(() => ({
  auth: {
    profile: null as { workspace_name: string } | null,
    error: null as string | null,
    completeCallback: vi.fn<() => Promise<void>>(),
  },
}));

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => state.auth,
}));

function renderCallback() {
  return render(
    <MemoryRouter initialEntries={['/auth/callback']}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/overview" element={<p>Authenticated overview</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('hosted authentication callback', () => {
  beforeEach(() => {
    state.auth.profile = null;
    state.auth.error = null;
    state.auth.completeCallback.mockReset().mockResolvedValue();
  });

  it('starts callback completion once and explains the pending state', async () => {
    renderCallback();

    expect(screen.getByRole('status')).toHaveTextContent('Completing secure sign-in');
    expect(screen.getByText('Verifying identity and workspace access.')).toBeInTheDocument();
    await waitFor(() => expect(state.auth.completeCallback).toHaveBeenCalledTimes(1));
  });

  it('keeps a callback failure actionable', async () => {
    state.auth.error = 'Your workspace invitation has expired.';
    renderCallback();

    expect(
      screen.getByRole('heading', { name: 'Sign-in could not be completed.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Your workspace invitation has expired.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to sign in' })).toHaveAttribute(
      'href',
      '/login',
    );
    await waitFor(() => expect(state.auth.completeCallback).toHaveBeenCalledTimes(1));
  });

  it('redirects an already resolved workspace profile', () => {
    state.auth.profile = { workspace_name: 'Acme' };
    renderCallback();

    expect(screen.getByText('Authenticated overview')).toBeInTheDocument();
    expect(state.auth.completeCallback).not.toHaveBeenCalled();
  });
});
