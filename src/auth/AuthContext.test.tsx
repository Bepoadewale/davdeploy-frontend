import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const auth = useAuth();
  return (
    <>
      <output data-testid="error">{auth.error ?? ''}</output>
      <button onClick={() => void auth.signInWithGoogle()}>Google</button>
      <button onClick={() => void auth.startPasswordSignIn('customer@example.com', 'password')}>
        Password
      </button>
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

  it('keeps password sign-in failures understandable when Cognito is unavailable', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => screen.getByRole('button', { name: 'Password' }).click());
    expect(screen.getByTestId('error')).toHaveTextContent('Password sign-in is not configured');
  });
});
