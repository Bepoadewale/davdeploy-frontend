import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  beginTotpEnrollment,
  completeTotpSetup,
  type EmailOtpChallenge,
  type PasswordAuthResult,
} from '../auth/cognitoEmail';
import BrandMark from '../components/BrandMark';
import { config, emailOtpConfigured, googleSignInConfigured } from '../config';

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="m5 10 3 3 7-7" />
    </svg>
  );
}

export default function LoginPage() {
  const {
    profile,
    loading,
    error,
    signInWithGoogle,
    startEmailSignIn,
    startEmailSignUp,
    verifyEmailCode,
    startPasswordSignIn,
    verifyTotpSignIn,
    startPasswordSetup,
    confirmPasswordSetup,
    localSignIn,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'create-account'>('sign-in');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<EmailOtpChallenge | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [passwordMode] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordSetup, setPasswordSetup] = useState(false);
  const [passwordSetupCode, setPasswordSetupCode] = useState('');
  const [totpChallenge, setTotpChallenge] = useState<Extract<
    PasswordAuthResult,
    { status: 'TOTP_CHALLENGE' }
  > | null>(null);
  const [totpSetup, setTotpSetup] = useState<Extract<
    PasswordAuthResult,
    { status: 'TOTP_SETUP' }
  > | null>(null);
  const [totpSecret, setTotpSecret] = useState('');
  if (profile) return <Navigate to="/overview" replace />;

  async function submitEmail(event: FormEvent) {
    event.preventDefault();
    setEmailStatus(null);
    if (challenge?.kind === 'SIGN_UP') {
      await verifyEmailCode(challenge, code);
      setChallenge(null);
      setMode('sign-in');
      setCode('');
      setEmailStatus(
        'Email confirmed. Sign in with your password to set up your authenticator app.',
      );
      return;
    }
    if (challenge) {
      setEmailStatus('Verifying your code and preparing the workspace…');
      void import('./OverviewPage');
    }
    if (totpChallenge) {
      await verifyTotpSignIn(totpChallenge, code);
      return;
    }
    if (totpSetup) {
      await completeTotpSetup(
        config.cognito.region,
        config.cognito.clientId,
        totpSetup.email,
        totpSetup.session,
        code,
      );
      return;
    }
    if (passwordSetup) {
      const complete = await confirmPasswordSetup(email, passwordSetupCode, password);
      if (complete) {
        setPasswordSetup(false);
        setPasswordSetupCode('');
        setEmailStatus(
          'Password set. Sign in with your password, then add your authenticator app in Settings.',
        );
      }
      return;
    }
    if (mode === 'create-account' && !challenge) {
      const result = await startEmailSignUp(email, password);
      if (result?.status === 'CHALLENGE') {
        setChallenge(result.challenge);
        setCode('');
        setEmailStatus(result.message);
      }
      return;
    }
    if (passwordMode) {
      const result = await startPasswordSignIn(email, password);
      if (result?.status === 'TOTP_CHALLENGE') {
        setTotpChallenge(result);
        setCode('');
        setEmailStatus('Enter the code from your authenticator app.');
      }
      if (result?.status === 'TOTP_SETUP') {
        setTotpSetup(result);
        setTotpSecret(await beginTotpEnrollment(config.cognito.region, result.session, true));
        setCode('');
        setEmailStatus('Add the key to your authenticator app, then enter its code.');
      }
      return;
    }
    const result = challenge
      ? await verifyEmailCode(challenge, code)
      : mode === 'create-account'
        ? await startEmailSignUp(email)
        : await startEmailSignIn(email);
    if (result?.status === 'CHALLENGE') {
      setChallenge(result.challenge);
      setCode('');
      setEmailStatus(result.message);
    }
  }

  return (
    <main className="auth-page auth-page-v2">
      <header className="auth-header-v2">
        <a className="auth-brand-v2" href="/" aria-label="DavDeploy home">
          <BrandMark />
          <span>DavDeploy</span>
        </a>
        <a href="/">Back to product</a>
      </header>

      <div className="auth-layout auth-layout-v2">
        <section className="auth-context auth-context-v2" aria-labelledby="auth-context-heading">
          <div>
            <p className="auth-eyebrow-v2">DavDeploy</p>
            <h1 id="auth-context-heading">Clear cloud decisions.</h1>
            <p>Sign in to continue with your workspace.</p>
          </div>

          <ul className="auth-principles auth-principles-v2" aria-label="Workspace safeguards">
            <li>
              <CheckIcon /> Verified membership
            </li>
            <li>
              <CheckIcon /> Clear approvals
            </li>
            <li>
              <CheckIcon /> Private by design
            </li>
          </ul>
        </section>

        <section className="auth-card auth-card-v2" aria-labelledby="login-heading">
          <p className="auth-eyebrow-v2">Secure workspace access</p>
          <h1 id="login-heading">
            {mode === 'sign-in' ? 'Sign in to your workspace.' : 'Create your workspace.'}
          </h1>
          <p>
            {mode === 'sign-in'
              ? 'Use your work email to access your workspace.'
              : 'Start with your work email.'}
          </p>

          {error ? (
            <div className="notice notice-error" role="alert">
              {error}
            </div>
          ) : null}

          {config.authMode === 'oidc' ? (
            <div className="hosted-auth-options">
              <div className="auth-mode-switch" aria-label="Account access">
                <button
                  type="button"
                  aria-pressed={mode === 'sign-in'}
                  className={mode === 'sign-in' ? 'is-active' : ''}
                  onClick={() => {
                    setMode('sign-in');
                    setChallenge(null);
                    setCode('');
                    setEmailStatus(null);
                  }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  aria-pressed={mode === 'create-account'}
                  className={mode === 'create-account' ? 'is-active' : ''}
                  onClick={() => {
                    setMode('create-account');
                    setChallenge(null);
                    setCode('');
                    setEmailStatus(null);
                  }}
                >
                  Create account
                </button>
              </div>
              {googleSignInConfigured ? (
                <>
                  <button
                    className="button button-secondary button-wide auth-button-v2 google-button"
                    type="button"
                    disabled={loading}
                    onClick={() => void signInWithGoogle()}
                  >
                    <span className="google-mark" aria-hidden="true">
                      G
                    </span>
                    {loading ? 'Connecting…' : 'Continue with Google'}
                  </button>

                  <div className="auth-divider" aria-hidden="true">
                    <span>or</span>
                  </div>
                </>
              ) : null}

              <form className="email-auth-form" onSubmit={(event) => void submitEmail(event)}>
                {totpSetup ? (
                  <>
                    <label>Authenticator setup key</label>
                    <input readOnly value={totpSecret} />
                    <small>
                      Add this key manually in Google Authenticator, Authy, or 1Password.
                    </small>
                    <label htmlFor="email-code">Authenticator code</label>
                    <input
                      id="email-code"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      required
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                    />
                  </>
                ) : challenge || totpChallenge ? (
                  <>
                    <label htmlFor="email-code">
                      {totpChallenge ? 'Authenticator code' : 'Email verification code'}
                    </label>
                    <input
                      id="email-code"
                      name="code"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      minLength={6}
                      maxLength={8}
                      required
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                    />
                    <small className="auth-code-recipient">
                      {totpChallenge
                        ? 'Open your authenticator app to get a new code.'
                        : `Code sent to ${challenge?.email}`}
                    </small>
                  </>
                ) : passwordSetup ? (
                  <>
                    <label htmlFor="password-setup-code">Email verification code</label>
                    <input
                      id="password-setup-code"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      required
                      value={passwordSetupCode}
                      onChange={(event) => setPasswordSetupCode(event.target.value)}
                    />
                    <label htmlFor="password">New password</label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      minLength={12}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </>
                ) : passwordMode ? (
                  <>
                    <label htmlFor="email">Work email</label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                    />
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      autoComplete={mode === 'create-account' ? 'new-password' : 'current-password'}
                      minLength={12}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <label htmlFor="email">Work email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                    />
                  </>
                )}
                <button
                  className="button button-primary button-wide auth-button-v2"
                  type="submit"
                  disabled={loading || !emailOtpConfigured}
                >
                  {loading
                    ? 'Checking…'
                    : challenge || totpChallenge || totpSetup
                      ? 'Verify and continue'
                      : passwordSetup
                        ? 'Set password'
                        : passwordMode
                          ? mode === 'create-account'
                            ? 'Create account'
                            : 'Sign in with password'
                          : 'Sign in'}
                </button>
                {challenge || totpChallenge ? (
                  <button
                    className="auth-text-button"
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setChallenge(null);
                      setTotpChallenge(null);
                      setCode('');
                      setEmailStatus(null);
                    }}
                  >
                    Use a different email
                  </button>
                ) : null}
              </form>
              {mode === 'sign-in' &&
              !challenge &&
              !totpChallenge &&
              !totpSetup &&
              !passwordSetup ? (
                <div className="auth-password-options">
                  {passwordMode ? (
                    <button
                      className="auth-text-button"
                      type="button"
                      disabled={loading || !email}
                      onClick={() =>
                        void startPasswordSetup(email).then((sent) => {
                          if (sent) {
                            setPasswordSetup(true);
                            setEmailStatus('A password setup code was sent to your email.');
                          }
                        })
                      }
                    >
                      Set or reset password
                    </button>
                  ) : null}
                </div>
              ) : null}
              {emailStatus ? (
                <p className="auth-email-status" role="status">
                  {emailStatus}
                </p>
              ) : null}
            </div>
          ) : null}

          {config.localLoginEnabled ? (
            <div className="fixture-login fixture-login-v2">
              <span>Local development fixture</span>
              <button
                className="button button-primary"
                type="button"
                disabled={loading}
                onClick={() => void localSignIn('founder')}
              >
                Developer
              </button>
              <button
                className="button button-secondary"
                type="button"
                disabled={loading}
                onClick={() => void localSignIn('administrator')}
              >
                Administrator
              </button>
            </div>
          ) : null}

          {!googleSignInConfigured && !emailOtpConfigured && !config.localLoginEnabled ? (
            <div id="sign-in-status" className="notice auth-status auth-status-v2" role="status">
              <span className="auth-status-mark-v2" aria-hidden="true">
                i
              </span>
              <span>
                <strong>Workspace access is not configured</strong>
                <small>
                  The public site is online. Access will open after Cognito is connected.
                </small>
              </span>
            </div>
          ) : null}

          <div className="auth-assurance-v2">
            <CheckIcon />
            <small>Your cloud credentials are never requested here.</small>
          </div>
        </section>
      </div>
    </main>
  );
}
