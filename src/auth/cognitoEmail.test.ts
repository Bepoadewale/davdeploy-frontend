import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock('@aws-sdk/client-cognito-identity-provider', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@aws-sdk/client-cognito-identity-provider')>();
  return {
    ...original,
    CognitoIdentityProviderClient: class {
      send = mocks.send;
    },
  };
});

import {
  refreshEmailSession,
  startEmailSignIn,
  startEmailSignUp,
  verifyEmailChallenge,
} from './cognitoEmail';

describe('Cognito email OTP adapter', () => {
  beforeEach(() => mocks.send.mockReset());

  it('starts the expected passwordless challenge for an existing user', async () => {
    mocks.send.mockResolvedValueOnce({ ChallengeName: 'EMAIL_OTP', Session: 'session-1' });
    const result = await startEmailSignIn('us-east-1', 'client', ' Person@Example.com ');
    expect(result).toEqual({
      status: 'CHALLENGE',
      challenge: { email: 'person@example.com', kind: 'SIGN_IN', session: 'session-1' },
      message: 'Enter the code sent to your email.',
    });
  });

  it('does not silently create an account for an unknown sign-in', async () => {
    const missing = new Error('missing');
    missing.name = 'UserNotFoundException';
    mocks.send.mockRejectedValueOnce(missing);
    await expect(startEmailSignIn('us-east-1', 'client', 'new@example.com')).rejects.toThrow(
      'No account exists for this email. Create an account first.',
    );
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });

  it('starts explicit sign-up without creating or storing a password', async () => {
    mocks.send.mockResolvedValueOnce({});
    const result = await startEmailSignUp('us-east-1', 'client', ' New@Example.com ');
    expect(result.status).toBe('CHALLENGE');
    if (result.status === 'CHALLENGE') {
      expect(result.challenge).toEqual({ email: 'new@example.com', kind: 'SIGN_UP' });
    }
  });

  it('directs an existing account back to sign in', async () => {
    const existing = new Error('exists');
    existing.name = 'UsernameExistsException';
    mocks.send.mockRejectedValueOnce(existing);
    await expect(startEmailSignUp('us-east-1', 'client', 'person@example.com')).rejects.toThrow(
      'An account already exists for this email. Sign in instead.',
    );
  });

  it('returns renewable tokens only after the email code succeeds', async () => {
    mocks.send.mockResolvedValueOnce({
      AuthenticationResult: {
        IdToken: 'identity-token',
        RefreshToken: 'refresh-token',
        ExpiresIn: 900,
      },
    });
    const result = await verifyEmailChallenge(
      'us-east-1',
      'client',
      { email: 'person@example.com', kind: 'SIGN_IN', session: 'session-1' },
      '123456',
    );
    expect(result).toEqual({
      status: 'AUTHENTICATED',
      identityToken: 'identity-token',
      refreshToken: 'refresh-token',
      expiresIn: 900,
    });
  });

  it('renews a Cognito session without requesting another email code', async () => {
    mocks.send.mockResolvedValueOnce({
      AuthenticationResult: { IdToken: 'renewed-token', ExpiresIn: 900 },
    });
    await expect(refreshEmailSession('us-east-1', 'client', 'refresh-token')).resolves.toEqual({
      status: 'AUTHENTICATED',
      identityToken: 'renewed-token',
      refreshToken: undefined,
      expiresIn: 900,
    });
    expect(mocks.send.mock.calls[0]?.[0].input).toMatchObject({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: { REFRESH_TOKEN: 'refresh-token' },
    });
  });
});
