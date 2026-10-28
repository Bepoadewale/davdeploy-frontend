import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';

const auth = vi.hoisted(() => ({
  profile: null as { workspace: { id: string } } | null,
  loading: false,
  error: null as string | null,
  signInWithGoogle: vi.fn<() => Promise<void>>(),
  startEmailSignIn: vi.fn(),
  startEmailSignUp: vi.fn(),
  verifyEmailCode: vi.fn(),
  localSignIn: vi.fn(),
}));

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => auth,
}));

vi.mock('../config', () => ({
  config: { authMode: 'oidc', localLoginEnabled: false },
  emailOtpConfigured: true,
  googleSignInConfigured: true,
}));

describe('hosted workspace sign-in', () => {
  beforeEach(() => {
    auth.profile = null;
    auth.loading = false;
    auth.error = null;
    auth.signInWithGoogle.mockReset().mockResolvedValue();
    auth.startEmailSignIn.mockReset();
    auth.startEmailSignUp.mockReset();
    auth.verifyEmailCode.mockReset();
    auth.localSignIn.mockReset();
  });

  it('presents configured email and Google workspace access', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /sign in to your workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /clear cloud decisions/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in to continue with your workspace/i)).toBeInTheDocument();
    expect(screen.getByText('Verified membership')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Sign in with email' })).toBeEnabled();
    expect(screen.queryByText('Workspace access is not configured')).not.toBeInTheDocument();
  });

  it('presents explicit sign-in and account-creation paths', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const signIn = screen.getByRole('button', { name: 'Sign in' });
    const createAccount = screen.getByRole('button', { name: 'Create account' });
    expect(signIn).toHaveAttribute('aria-pressed', 'true');
    await user.click(createAccount);
    expect(createAccount).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Create your workspace.' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Create account' })).toHaveLength(2);
  });

  it('starts email sign-in, presents the code step, and verifies the same challenge', async () => {
    auth.startEmailSignIn.mockResolvedValue({
      status: 'CHALLENGE',
      challenge: { email: 'person@example.com', kind: 'SIGN_IN', session: 'session-1' },
      message: 'Enter the code sent to your email.',
    });
    auth.verifyEmailCode.mockResolvedValue({ status: 'AUTHENTICATED', identityToken: 'token' });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('Work email'), 'person@example.com');
    await user.click(screen.getByRole('button', { name: 'Sign in with email' }));
    expect(auth.startEmailSignIn).toHaveBeenCalledWith('person@example.com');
    expect(await screen.findByLabelText('Email verification code')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Enter the code sent to your email.');

    await user.type(screen.getByLabelText('Email verification code'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify and continue' }));
    expect(auth.verifyEmailCode).toHaveBeenCalledWith(
      { email: 'person@example.com', kind: 'SIGN_IN', session: 'session-1' },
      '123456',
    );
  });

  it('starts account creation and lets a customer return to a different email', async () => {
    auth.startEmailSignUp.mockResolvedValue({
      status: 'CHALLENGE',
      challenge: { email: 'new@example.com', kind: 'SIGN_UP' },
      message: 'Enter the code sent to your email to create your workspace.',
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Create account' }));
    await user.type(screen.getByLabelText('Work email'), 'new@example.com');
    await user.click(screen.getAllByRole('button', { name: 'Create account' })[1]);
    expect(auth.startEmailSignUp).toHaveBeenCalledWith('new@example.com');
    expect(await screen.findByText('Code sent to new@example.com')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Use a different email' }));
    expect(screen.getByLabelText('Work email')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('starts Google sign-in and makes provider errors visible', async () => {
    auth.error = 'Google sign-in could not be started.';
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Google sign-in could not be started.');
    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(auth.signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('redirects an established workspace instead of showing login controls', () => {
    auth.profile = { workspace: { id: 'workspace-1' } };
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/overview" element={<p>Workspace overview</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Workspace overview')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in with email' })).not.toBeInTheDocument();
  });

  it('has no automatically detectable WCAG 2.2 A/AA violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    const result = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    });
    expect(result.violations).toEqual([]);
  });

  it('keeps typed and autofilled email values readable on the light sign-in field', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/public-v3.css'), 'utf8');
    expect(css).toContain('-webkit-text-fill-color: #172019;');
    expect(css).toContain('.email-auth-form input:-webkit-autofill');
    expect(css).toContain('box-shadow: 0 0 0 1000px #fffefa inset !important;');
  });

  it('uses explicit dark foreground colours for OTP instructions and controls', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/public-v3.css'), 'utf8');
    expect(css).toContain('.auth-code-recipient');
    expect(css).toContain('color: #4f584f;');
    expect(css).toContain('color: #29483b;');
  });
});
