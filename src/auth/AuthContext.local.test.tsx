import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  request: vi.fn(),
  resolveWorkspaceProfile: vi.fn(),
  startPasswordSignIn: vi.fn(),
  verifyEmailChallenge: vi.fn(),
  refreshEmailSession: vi.fn(),
}));

vi.mock('../config', () => ({
  config: {
    localLoginEnabled: true,
    oidc: { authority: '', clientId: '', redirectUri: '', postLogoutRedirectUri: '' },
    cognito: { region: 'test-region', clientId: 'test-client' },
  },
  emailOtpConfigured: true,
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

vi.mock('./cognitoEmail', () => ({
  startPasswordSignIn: fixture.startPasswordSignIn,
  verifyEmailChallenge: fixture.verifyEmailChallenge,
  refreshEmailSession: fixture.refreshEmailSession,
}));

import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const auth = useAuth();
  return (
    <>
      <output data-testid="subject">{auth.profile?.user.subject ?? ''}</output>
      <output data-testid="token">{auth.token ?? ''}</output>
      <output data-testid="error">{auth.error ?? ''}</output>
      <button onClick={() => void auth.localSignIn('founder')}>Local sign in</button>
      <button onClick={() => void auth.startPasswordSignIn('person@example.com', 'password')}>
        Password sign in
      </button>
      <button
        onClick={() =>
          void auth.verifyEmailCode({ email: 'person@example.com', kind: 'SIGN_UP' }, '123456')
        }
      >
        Verify email code
      </button>
      <button onClick={() => void auth.signOut()}>Sign out</button>
    </>
  );
}

describe('AuthProvider local fixture boundary', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    fixture.request.mockReset();
    fixture.resolveWorkspaceProfile.mockReset();
    fixture.startPasswordSignIn.mockReset();
    fixture.verifyEmailChallenge.mockReset();
    fixture.refreshEmailSession.mockReset();
    fixture.request.mockResolvedValue({ access_token: 'fixture-token' });
    fixture.resolveWorkspaceProfile.mockResolvedValue({
      profile: {
        user: { subject: 'fixture-founder', role: 'administrator' },
        workspace: { id: 'workspace-1', name: 'Fixture workspace' },
      },
      onboarded: false,
    });
    fixture.startPasswordSignIn.mockResolvedValue({
      status: 'AUTHENTICATED',
      identityToken: 'email-token',
      refreshToken: 'email-refresh-token',
      expiresIn: 900,
    });
    fixture.verifyEmailChallenge.mockResolvedValue({
      status: 'AUTHENTICATED',
      identityToken: 'verified-token',
      refreshToken: 'verified-refresh-token',
      expiresIn: 900,
    });
    fixture.refreshEmailSession.mockResolvedValue({
      status: 'AUTHENTICATED',
      identityToken: 'renewed-token',
      expiresIn: 900,
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

  it('adopts an authenticated password token and retains a plain-English failure when sign-in fails', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => screen.getByRole('button', { name: 'Password sign in' }).click());
    expect(fixture.startPasswordSignIn).toHaveBeenCalledWith(
      'test-region',
      'test-client',
      'person@example.com',
      'password',
    );
    expect(screen.getByTestId('token')).toHaveTextContent('email-token');

    fixture.startPasswordSignIn.mockRejectedValueOnce(
      new Error('Password sign-in is unavailable.'),
    );
    await act(async () => screen.getByRole('button', { name: 'Password sign in' }).click());
    expect(screen.getByTestId('error')).toHaveTextContent('Password sign-in is unavailable.');
  });

  it('does not create a workspace from account confirmation alone', async () => {
    fixture.verifyEmailChallenge.mockResolvedValue({
      status: 'CHALLENGE',
      challenge: { email: 'person@example.com', kind: 'SIGN_UP' },
      message: 'Email confirmed.',
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => screen.getByRole('button', { name: 'Verify email code' }).click());

    expect(fixture.verifyEmailChallenge).toHaveBeenCalledWith(
      'test-region',
      'test-client',
      { email: 'person@example.com', kind: 'SIGN_UP' },
      '123456',
    );
    expect(fixture.resolveWorkspaceProfile).not.toHaveBeenCalled();
    expect(screen.getByTestId('token')).toBeEmptyDOMElement();
  });

  it('keeps local sign-in failures understandable and does not retain a token', async () => {
    fixture.request.mockRejectedValueOnce(new Error('Local fixture sign-in is disabled.'));
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => screen.getByRole('button', { name: 'Local sign in' }).click());

    expect(screen.getByTestId('error')).toHaveTextContent('Local fixture sign-in is disabled.');
    expect(screen.getByTestId('token')).toBeEmptyDOMElement();
  });

  it('keeps failed code verification understandable and does not create a workspace', async () => {
    fixture.verifyEmailChallenge.mockRejectedValueOnce(
      new Error('That code has expired. Request a new one.'),
    );
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => screen.getByRole('button', { name: 'Verify email code' }).click());

    expect(screen.getByTestId('error')).toHaveTextContent(
      'That code has expired. Request a new one.',
    );
    expect(screen.getByTestId('token')).toBeEmptyDOMElement();
    expect(fixture.resolveWorkspaceProfile).not.toHaveBeenCalled();
  });

  it('restores a validated hosted email session after a browser refresh', async () => {
    const first = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await act(async () => screen.getByRole('button', { name: 'Password sign in' }).click());
    expect(window.sessionStorage.getItem('davdeploy.hosted-session')).toContain('email-token');
    first.unmount();
    fixture.resolveWorkspaceProfile.mockClear();

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('subject')).toHaveTextContent('fixture-founder'));
    expect(screen.getByTestId('token')).toHaveTextContent('email-token');
    expect(fixture.resolveWorkspaceProfile).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ invitationToken: null, createWorkspace: false }),
    );
  });

  it('clears an invalid restored session instead of retaining browser access', async () => {
    window.sessionStorage.setItem('davdeploy.hosted-identity-token', 'expired-token');
    fixture.resolveWorkspaceProfile.mockRejectedValueOnce(new Error('expired'));
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent('session has expired'),
    );
    expect(screen.getByTestId('token')).toBeEmptyDOMElement();
    expect(window.sessionStorage.getItem('davdeploy.hosted-identity-token')).toBeNull();
  });

  it('silently renews an expired Cognito session before restoring workspace access', async () => {
    window.sessionStorage.setItem(
      'davdeploy.hosted-session',
      JSON.stringify({
        identityToken: 'expired-identity-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() - 1,
      }),
    );
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('token')).toHaveTextContent('renewed-token'));
    expect(fixture.refreshEmailSession).toHaveBeenCalledWith(
      'test-region',
      'test-client',
      'refresh-token',
    );
    expect(window.sessionStorage.getItem('davdeploy.hosted-session')).toContain('renewed-token');
  });

  it('clears a rejected refresh session and explains the next step', async () => {
    fixture.refreshEmailSession.mockRejectedValueOnce(new Error('refresh expired'));
    window.sessionStorage.setItem(
      'davdeploy.hosted-session',
      JSON.stringify({
        identityToken: 'expired-token',
        refreshToken: 'refresh-token',
        expiresAt: 0,
      }),
    );
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('session has ended'));
    expect(window.sessionStorage.getItem('davdeploy.hosted-session')).toBeNull();
  });
});
