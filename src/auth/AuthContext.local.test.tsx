import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  request: vi.fn(),
  resolveWorkspaceProfile: vi.fn(),
}));

vi.mock('../config', () => ({
  config: {
    localLoginEnabled: true,
    oidc: { authority: '', clientId: '', redirectUri: '', postLogoutRedirectUri: '' },
  },
  emailOtpConfigured: false,
  oidcConfigured: false,
}));

vi.mock('../api/client', () => ({
  ApiClient: class {
    request = fixture.request;
  },
}));

vi.mock('./workspaceSession', () => ({
  resolveWorkspaceProfile: fixture.resolveWorkspaceProfile,
}));

import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const auth = useAuth();
  return (
    <>
      <output data-testid="subject">{auth.profile?.user.subject ?? ''}</output>
      <output data-testid="token">{auth.token ?? ''}</output>
      <button onClick={() => void auth.localSignIn('founder')}>Local sign in</button>
      <button onClick={() => void auth.signOut()}>Sign out</button>
    </>
  );
}

describe('AuthProvider local fixture boundary', () => {
  beforeEach(() => {
    fixture.request.mockReset();
    fixture.resolveWorkspaceProfile.mockReset();
    fixture.request.mockResolvedValue({ access_token: 'fixture-token' });
    fixture.resolveWorkspaceProfile.mockResolvedValue({
      profile: {
        user: { subject: 'fixture-founder', role: 'administrator' },
        workspace: { id: 'workspace-1', name: 'Fixture workspace' },
      },
      onboarded: false,
    });
  });

  it('adopts a local fixture token only after server-side workspace resolution and clears it on sign-out', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => screen.getByRole('button', { name: 'Local sign in' }).click());

    expect(fixture.request).toHaveBeenCalledWith('/api/v1/auth/local-login', {
      method: 'POST',
      body: { username: 'founder' },
      authenticated: false,
      retrySafe: false,
    });
    expect(fixture.resolveWorkspaceProfile).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ identityName: 'My workspace', createWorkspace: false }),
    );
    expect(screen.getByTestId('subject')).toHaveTextContent('fixture-founder');
    expect(screen.getByTestId('token')).toHaveTextContent('fixture-token');

    await act(async () => screen.getByRole('button', { name: 'Sign out' }).click());

    expect(screen.getByTestId('subject')).toBeEmptyDOMElement();
    expect(screen.getByTestId('token')).toBeEmptyDOMElement();
  });
});
