import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    profile: null,
    loading: false,
    error: null,
    signInWithGoogle: vi.fn(),
    startEmailSignIn: vi.fn(),
    startEmailSignUp: vi.fn(),
    verifyEmailCode: vi.fn(),
    localSignIn: vi.fn(),
  }),
}));

describe('hosted workspace sign-in', () => {
  it('fails closed with a clear configuration state', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /sign in to your workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /clear cloud decisions/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in to continue with your workspace/i)).toBeInTheDocument();
    expect(screen.getByText('Verified membership')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue with Google' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in with email' })).toBeDisabled();
    expect(screen.getByText('Workspace access is not configured')).toBeInTheDocument();
    expect(screen.getByText(/Cognito is connected/i)).toBeInTheDocument();
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
