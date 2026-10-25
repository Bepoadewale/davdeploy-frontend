import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const auth = useAuth();
  return (
    <>
      <output data-testid="error">{auth.error ?? ''}</output>
      <button onClick={() => void auth.signInWithGoogle()}>Google</button>
      <button onClick={() => void auth.startEmailSignIn('customer@example.com')}>Email</button>
    </>
  );
}

describe('AuthProvider', () => {
  it('fails clearly when hosted identity configuration is unavailable', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => screen.getByRole('button', { name: 'Google' }).click());
    expect(screen.getByTestId('error')).toHaveTextContent('Hosted sign-in is not configured');
  });

  it('does not attempt an email sign-in without Cognito configuration', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => screen.getByRole('button', { name: 'Email' }).click());
    expect(screen.getByTestId('error')).toHaveTextContent('Email code sign-in is not configured');
  });
});
