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
  completeTotpSetup,
  refreshEmailSession,
  startEmailSignUp,
  startPasswordSignIn,
  verifyTotpSignIn,
  verifyEmailChallenge,
} from './cognitoEmail';

describe('Cognito email OTP adapter', () => {
  beforeEach(() => mocks.send.mockReset());

  it('starts an authenticator challenge after valid password authentication', async () => {
    mocks.send.mockResolvedValueOnce({ ChallengeName: 'SOFTWARE_TOKEN_MFA', Session: 'session-1' });
    const result = await startPasswordSignIn(
      'us-east-1',
      'client',
      ' Person@Example.com ',
      'password',
    );
    expect(result).toEqual({
      status: 'TOTP_CHALLENGE',
      email: 'person@example.com',
      session: 'session-1',
    });
  });

  it('starts explicit sign-up with a password', async () => {
    mocks.send.mockResolvedValueOnce({});
    const result = await startEmailSignUp('us-east-1', 'client', ' New@Example.com ', 'password');
    expect(result.status).toBe('CHALLENGE');
    if (result.status === 'CHALLENGE') {
      expect(result.challenge).toEqual({ email: 'new@example.com', kind: 'SIGN_UP' });
    }
  });

  it('directs an existing account back to sign in', async () => {
    const existing = new Error('exists');
    existing.name = 'UsernameExistsException';
    mocks.send.mockRejectedValueOnce(existing);
    await expect(
      startEmailSignUp('us-east-1', 'client', 'person@example.com', 'password'),
    ).rejects.toThrow('An account already exists for this email. Sign in instead.');
  });

  it('confirms an account creation email code without starting a passwordless session', async () => {
    mocks.send.mockResolvedValueOnce({});
    await expect(
      verifyEmailChallenge(
        'us-east-1',
        'client',
        { email: 'person@example.com', kind: 'SIGN_UP' },
        '123456',
      ),
    ).resolves.toMatchObject({ status: 'CHALLENGE', message: 'Email confirmed.' });
  });

  it('returns tokens only after an authenticator code succeeds', async () => {
    mocks.send.mockResolvedValueOnce({
      AuthenticationResult: {
        IdToken: 'identity-token',
        RefreshToken: 'refresh-token',
        ExpiresIn: 900,
      },
    });
    const result = await verifyTotpSignIn(
      'us-east-1',
      'client',
      { status: 'TOTP_CHALLENGE', email: 'person@example.com', session: 'session-1' },
      '123456',
    );
    expect(result).toEqual({
      status: 'AUTHENTICATED',
      identityToken: 'identity-token',
      refreshToken: 'refresh-token',
      expiresIn: 900,
    });
  });

  it('completes first-time authenticator enrollment and returns a signed-in session', async () => {
    mocks.send
      .mockResolvedValueOnce({ Status: 'SUCCESS', Session: 'verified-session' })
      .mockResolvedValueOnce({
        AuthenticationResult: { IdToken: 'identity-token', RefreshToken: 'refresh-token' },
      });
    await expect(
      completeTotpSetup('us-east-1', 'client', 'person@example.com', 'setup-session', '123456'),
    ).resolves.toMatchObject({ status: 'AUTHENTICATED', identityToken: 'identity-token' });
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
