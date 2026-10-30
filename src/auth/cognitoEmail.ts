import {
  CognitoIdentityProviderClient,
  AssociateSoftwareTokenCommand,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SetUserMFAPreferenceCommand,
  SignUpCommand,
  VerifySoftwareTokenCommand,
} from '@aws-sdk/client-cognito-identity-provider';

export interface EmailOtpChallenge {
  email: string;
  kind: 'SIGN_IN' | 'SIGN_UP';
  session?: string;
}

export type EmailAuthResult =
  | { status: 'CHALLENGE'; challenge: EmailOtpChallenge; message: string }
  | {
      status: 'AUTHENTICATED';
      identityToken: string;
      accessToken?: string;
      refreshToken?: string;
      expiresIn?: number;
    };

function client(region: string) {
  return new CognitoIdentityProviderClient({ region });
}

function authenticatedResult(result: {
  AuthenticationResult?: {
    IdToken?: string;
    AccessToken?: string;
    RefreshToken?: string;
    ExpiresIn?: number;
  };
}): Extract<EmailAuthResult, { status: 'AUTHENTICATED' }> | null {
  const authentication = result.AuthenticationResult;
  if (!authentication?.IdToken) return null;
  return {
    status: 'AUTHENTICATED',
    identityToken: authentication.IdToken,
    accessToken: authentication.AccessToken,
    refreshToken: authentication.RefreshToken,
    expiresIn: authentication.ExpiresIn,
  };
}

export type PasswordAuthResult =
  | Extract<EmailAuthResult, { status: 'AUTHENTICATED' }>
  | { status: 'TOTP_CHALLENGE'; email: string; session: string }
  | { status: 'TOTP_SETUP'; email: string; session: string };

export async function startPasswordSignIn(
  region: string,
  clientId: string,
  email: string,
  password: string,
): Promise<PasswordAuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const response = await client(region).send(
    new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: { USERNAME: normalizedEmail, PASSWORD: password },
    }),
  );
  const authenticated = authenticatedResult(response);
  if (authenticated) return authenticated;
  if (response.ChallengeName === 'SOFTWARE_TOKEN_MFA' && response.Session) {
    return { status: 'TOTP_CHALLENGE', email: normalizedEmail, session: response.Session };
  }
  if (response.ChallengeName === 'MFA_SETUP' && response.Session) {
    return { status: 'TOTP_SETUP', email: normalizedEmail, session: response.Session };
  }
  throw new Error('Cognito did not return the expected password or authenticator challenge.');
}

export async function verifyTotpSignIn(
  region: string,
  clientId: string,
  challenge: Extract<PasswordAuthResult, { status: 'TOTP_CHALLENGE' }>,
  code: string,
) {
  const response = await client(region).send(
    new RespondToAuthChallengeCommand({
      ChallengeName: 'SOFTWARE_TOKEN_MFA',
      ClientId: clientId,
      Session: challenge.session,
      ChallengeResponses: { USERNAME: challenge.email, SOFTWARE_TOKEN_MFA_CODE: code.trim() },
    }),
  );
  const authenticated = authenticatedResult(response);
  if (!authenticated) throw new Error('The authenticator code could not be verified.');
  return authenticated;
}

export async function sendPasswordSetupCode(region: string, clientId: string, email: string) {
  await client(region).send(
    new ForgotPasswordCommand({ ClientId: clientId, Username: email.trim().toLowerCase() }),
  );
}

export async function confirmPasswordSetup(
  region: string,
  clientId: string,
  email: string,
  code: string,
  password: string,
) {
  await client(region).send(
    new ConfirmForgotPasswordCommand({
      ClientId: clientId,
      Username: email.trim().toLowerCase(),
      ConfirmationCode: code.trim(),
      Password: password,
    }),
  );
}

export async function beginTotpEnrollment(region: string, accessToken: string, useSession = false) {
  const response = await client(region).send(
    new AssociateSoftwareTokenCommand(
      useSession ? { Session: accessToken } : { AccessToken: accessToken },
    ),
  );
  if (!response.SecretCode) throw new Error('Cognito did not return an authenticator setup key.');
  return response.SecretCode;
}

export async function completeTotpSetup(
  region: string,
  clientId: string,
  email: string,
  session: string,
  code: string,
) {
  const verified = await client(region).send(
    new VerifySoftwareTokenCommand({
      Session: session,
      UserCode: code.trim(),
      FriendlyDeviceName: 'Authenticator app',
    }),
  );
  if (verified.Status !== 'SUCCESS' || !verified.Session)
    throw new Error('The authenticator code could not be verified.');
  const response = await client(region).send(
    new RespondToAuthChallengeCommand({
      ChallengeName: 'MFA_SETUP',
      ClientId: clientId,
      Session: verified.Session,
      ChallengeResponses: { USERNAME: email },
    }),
  );
  const authenticated = authenticatedResult(response);
  if (!authenticated) throw new Error('Cognito did not complete authenticator setup.');
  return authenticated;
}

export async function confirmTotpEnrollment(region: string, accessToken: string, code: string) {
  const verified = await client(region).send(
    new VerifySoftwareTokenCommand({
      AccessToken: accessToken,
      UserCode: code.trim(),
      FriendlyDeviceName: 'Authenticator app',
    }),
  );
  if (verified.Status !== 'SUCCESS')
    throw new Error('The authenticator code could not be verified.');
  await client(region).send(
    new SetUserMFAPreferenceCommand({
      AccessToken: accessToken,
      SoftwareTokenMfaSettings: { Enabled: true, PreferredMfa: true },
    }),
  );
}

function isMissingUser(error: unknown) {
  return error instanceof Error && error.name === 'UserNotFoundException';
}

function isExistingUser(error: unknown) {
  return error instanceof Error && error.name === 'UsernameExistsException';
}

function requireOtpChallenge(
  email: string,
  response: { ChallengeName?: string; Session?: string },
): EmailAuthResult {
  if (response.ChallengeName !== 'EMAIL_OTP' || !response.Session) {
    throw new Error('Cognito did not return the expected email code challenge.');
  }
  return {
    status: 'CHALLENGE',
    challenge: { email, kind: 'SIGN_IN', session: response.Session },
    message: 'Enter the code sent to your email.',
  };
}

export async function startEmailSignIn(
  region: string,
  clientId: string,
  email: string,
): Promise<EmailAuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const response = await client(region).send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: normalizedEmail,
          PREFERRED_CHALLENGE: 'EMAIL_OTP',
        },
      }),
    );
    const authenticated = authenticatedResult(response);
    return authenticated ? authenticated : requireOtpChallenge(normalizedEmail, response);
  } catch (error) {
    if (isMissingUser(error)) {
      throw new Error('No account exists for this email. Create an account first.');
    }
    throw error;
  }
}

export async function startEmailSignUp(
  region: string,
  clientId: string,
  email: string,
  password: string,
): Promise<EmailAuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    await client(region).send(
      new SignUpCommand({
        ClientId: clientId,
        Username: normalizedEmail,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: normalizedEmail }],
      }),
    );
    return {
      status: 'CHALLENGE',
      challenge: { email: normalizedEmail, kind: 'SIGN_UP' },
      message: 'Enter the code sent to your email to create your workspace.',
    };
  } catch (error) {
    if (isExistingUser(error)) {
      throw new Error('An account already exists for this email. Sign in instead.');
    }
    throw error;
  }
}

export async function verifyEmailChallenge(
  region: string,
  clientId: string,
  challenge: EmailOtpChallenge,
  code: string,
): Promise<EmailAuthResult> {
  const cognito = client(region);
  if (challenge.kind === 'SIGN_UP') {
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: challenge.email,
        ConfirmationCode: code.trim(),
      }),
    );
    return { status: 'CHALLENGE', challenge, message: 'Email confirmed.' };
  }

  const response = await cognito.send(
    new RespondToAuthChallengeCommand({
      ChallengeName: 'EMAIL_OTP',
      ClientId: clientId,
      Session: challenge.session,
      ChallengeResponses: {
        USERNAME: challenge.email,
        EMAIL_OTP_CODE: code.trim(),
      },
    }),
  );
  const authenticated = authenticatedResult(response);
  if (!authenticated) throw new Error('Cognito did not return an identity token.');
  return authenticated;
}

/** Renew a Cognito browser session without another email challenge. */
export async function refreshEmailSession(
  region: string,
  clientId: string,
  refreshToken: string,
): Promise<Extract<EmailAuthResult, { status: 'AUTHENTICATED' }>> {
  const response = await client(region).send(
    new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: clientId,
      AuthParameters: { REFRESH_TOKEN: refreshToken },
    }),
  );
  const authenticated = authenticatedResult(response);
  if (!authenticated) throw new Error('Cognito could not renew your session. Sign in again.');
  return authenticated;
}
