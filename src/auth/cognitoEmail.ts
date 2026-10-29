import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
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
      refreshToken?: string;
      expiresIn?: number;
    };

function client(region: string) {
  return new CognitoIdentityProviderClient({ region });
}

function authenticatedResult(result: {
  AuthenticationResult?: { IdToken?: string; RefreshToken?: string; ExpiresIn?: number };
}): Extract<EmailAuthResult, { status: 'AUTHENTICATED' }> | null {
  const authentication = result.AuthenticationResult;
  if (!authentication?.IdToken) return null;
  return {
    status: 'AUTHENTICATED',
    identityToken: authentication.IdToken,
    refreshToken: authentication.RefreshToken,
    expiresIn: authentication.ExpiresIn,
  };
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
): Promise<EmailAuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    await client(region).send(
      new SignUpCommand({
        ClientId: clientId,
        Username: normalizedEmail,
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
    const confirmation = await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: challenge.email,
        ConfirmationCode: code.trim(),
      }),
    );
    const response = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_AUTH',
        ClientId: clientId,
        Session: confirmation.Session,
        AuthParameters: {
          USERNAME: challenge.email,
          PREFERRED_CHALLENGE: 'EMAIL_OTP',
        },
      }),
    );
    const authenticated = authenticatedResult(response);
    return authenticated ? authenticated : requireOtpChallenge(challenge.email, response);
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
