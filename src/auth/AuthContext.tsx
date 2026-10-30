import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import type { UserManager, UserManagerSettings } from 'oidc-client-ts';
import { ApiClient, BROWSER_SESSION_TOKEN } from '../api/client';
import type { WorkspaceProfile } from '../api/contracts';
import { config, emailOtpConfigured, oidcConfigured } from '../config';
import type { EmailAuthResult, EmailOtpChallenge, PasswordAuthResult } from './cognitoEmail';
import { resolveWorkspaceProfile } from './workspaceSession';

interface AuthState {
  profile: WorkspaceProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  api: ApiClient;
  signInWithGoogle: () => Promise<void>;
  startEmailSignIn: (email: string) => Promise<EmailAuthResult | null>;
  startEmailSignUp: (email: string, password: string) => Promise<EmailAuthResult | null>;
  verifyEmailCode: (challenge: EmailOtpChallenge, code: string) => Promise<EmailAuthResult | null>;
  startPasswordSignIn: (email: string, password: string) => Promise<PasswordAuthResult | null>;
  verifyTotpSignIn: (
    challenge: Extract<PasswordAuthResult, { status: 'TOTP_CHALLENGE' }>,
    code: string,
  ) => Promise<EmailAuthResult | null>;
  startPasswordSetup: (email: string) => Promise<boolean>;
  confirmPasswordSetup: (email: string, code: string, password: string) => Promise<boolean>;
  cognitoAccessToken: string | null;
  localSignIn: (username: 'founder' | 'administrator') => Promise<void>;
  completeCallback: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);
const HOSTED_SESSION_KEY = 'davdeploy.hosted-session';
const LEGACY_HOSTED_SESSION_TOKEN_KEY = 'davdeploy.hosted-identity-token';
const REFRESH_EARLY_MS = 60_000;

interface HostedSession {
  identityToken: string;
  refreshToken?: string;
  expiresAt: number;
}

function tokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function readHostedSession(): HostedSession | null {
  const stored = window.sessionStorage.getItem(HOSTED_SESSION_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as HostedSession;
      if (typeof parsed.identityToken === 'string' && typeof parsed.expiresAt === 'number') {
        return parsed;
      }
    } catch {
      window.sessionStorage.removeItem(HOSTED_SESSION_KEY);
    }
  }
  const legacyToken = window.sessionStorage.getItem(LEGACY_HOSTED_SESSION_TOKEN_KEY);
  if (!legacyToken) return null;
  return { identityToken: legacyToken, expiresAt: tokenExpiry(legacyToken) ?? Date.now() };
}

async function createUserManager(): Promise<UserManager | null> {
  if (!oidcConfigured) return null;
  const { InMemoryWebStorage, UserManager, WebStorageStateStore } = await import('oidc-client-ts');
  const settings: UserManagerSettings = {
    authority: config.oidc.authority,
    client_id: config.oidc.clientId,
    redirect_uri: config.oidc.redirectUri,
    post_logout_redirect_uri: config.oidc.postLogoutRedirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
    userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),
    automaticSilentRenew: false,
  };
  return new UserManager(settings);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<WorkspaceProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Start in a restoring state in production so protected routes do not race a valid HttpOnly
  // cookie session to the sign-in page before the first workspace lookup completes.
  const [loading, setLoading] = useState(config.browserSessionProxy);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const [cognitoAccessToken, setCognitoAccessToken] = useState<string | null>(null);
  const managerRef = useRef<Promise<UserManager | null> | null>(null);
  const api = useMemo(() => new ApiClient(() => tokenRef.current), []);

  const manager = useCallback(() => {
    managerRef.current ??= createUserManager();
    return managerRef.current;
  }, []);

  const pendingInvitation = useCallback(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('invite');
    if (fromUrl) window.sessionStorage.setItem('davdeploy.invitation', fromUrl);
    return fromUrl ?? window.sessionStorage.getItem('davdeploy.invitation');
  }, []);

  const clearHostedSession = useCallback(() => {
    window.sessionStorage.removeItem(HOSTED_SESSION_KEY);
    window.sessionStorage.removeItem(LEGACY_HOSTED_SESSION_TOKEN_KEY);
  }, []);

  const persistHostedSession = useCallback(
    (identityToken: string, refreshToken?: string, expiresIn?: number) => {
      const expiresAt = expiresIn
        ? Date.now() + expiresIn * 1000
        : (tokenExpiry(identityToken) ?? Date.now());
      window.sessionStorage.setItem(
        HOSTED_SESSION_KEY,
        JSON.stringify({ identityToken, refreshToken, expiresAt } satisfies HostedSession),
      );
      window.sessionStorage.removeItem(LEGACY_HOSTED_SESSION_TOKEN_KEY);
    },
    [],
  );

  const establishBrowserSession = useCallback(
    async (identityToken: string, refreshToken?: string) => {
      if (!config.browserSessionProxy || !refreshToken) return false;
      const response = await fetch('/api/v1/auth/browser-session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityToken, refreshToken }),
      });
      if (!response.ok) throw new Error('Could not establish your secure browser session.');
      clearHostedSession();
      tokenRef.current = BROWSER_SESSION_TOKEN;
      setToken(BROWSER_SESSION_TOKEN);
      return true;
    },
    [clearHostedSession],
  );

  const adoptToken = useCallback(
    async (
      accessToken: string,
      identityName = 'My workspace',
      createWorkspace = false,
      persistSession = false,
      refreshToken?: string,
      expiresIn?: number,
      rawAccessToken?: string,
    ) => {
      tokenRef.current = accessToken;
      setToken(accessToken);
      setCognitoAccessToken(rawAccessToken ?? null);
      try {
        const resolved = await resolveWorkspaceProfile(api, {
          identityName,
          invitationToken: pendingInvitation(),
          createWorkspace,
        });
        setProfile(resolved.profile);
        if (persistSession) {
          persistHostedSession(accessToken, refreshToken, expiresIn);
          await establishBrowserSession(accessToken, refreshToken);
        }
        if (resolved.onboarded) window.sessionStorage.removeItem('davdeploy.invitation');
      } catch (requestError) {
        tokenRef.current = null;
        setToken(null);
        if (persistSession) clearHostedSession();
        throw requestError;
      }
    },
    [api, clearHostedSession, establishBrowserSession, pendingInvitation, persistHostedSession],
  );

  const renewHostedSession = useCallback(async () => {
    const session = readHostedSession();
    if (!session?.refreshToken || !emailOtpConfigured) return false;
    try {
      const { refreshEmailSession } = await import('./cognitoEmail');
      const refreshed = await refreshEmailSession(
        config.cognito.region,
        config.cognito.clientId,
        session.refreshToken,
      );
      tokenRef.current = refreshed.identityToken;
      setToken(refreshed.identityToken);
      persistHostedSession(
        refreshed.identityToken,
        refreshed.refreshToken ?? session.refreshToken,
        refreshed.expiresIn,
      );
      return true;
    } catch {
      tokenRef.current = null;
      clearHostedSession();
      setToken(null);
      setProfile(null);
      setError('Your sign-in session has ended. Sign in again to continue.');
      return false;
    }
  }, [clearHostedSession, persistHostedSession]);

  useEffect(() => {
    if (config.browserSessionProxy) {
      let active = true;
      tokenRef.current = BROWSER_SESSION_TOKEN;
      setToken(BROWSER_SESSION_TOKEN);
      setLoading(true);
      void resolveWorkspaceProfile(api, {
        identityName: 'My workspace',
        invitationToken: null,
        createWorkspace: false,
      })
        .then(({ profile: resolvedProfile }) => {
          if (active) setProfile(resolvedProfile);
        })
        .catch(() => {
          tokenRef.current = null;
          if (active) {
            setToken(null);
            setProfile(null);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }
    const storedSession = readHostedSession();
    if (!storedSession) return;
    let active = true;
    setLoading(true);
    setError(null);
    void (async () => {
      const needsRefresh = storedSession.expiresAt <= Date.now() + REFRESH_EARLY_MS;
      if (needsRefresh && !storedSession.refreshToken) {
        throw new Error('stored session is expired');
      }
      const refreshed = needsRefresh ? await renewHostedSession() : false;
      const restored = readHostedSession();
      const identityToken = refreshed ? restored?.identityToken : storedSession.identityToken;
      if (!identityToken || (needsRefresh && !refreshed)) return null;
      tokenRef.current = identityToken;
      setToken(identityToken);
      return resolveWorkspaceProfile(api, {
        identityName: 'My workspace',
        invitationToken: null,
        createWorkspace: false,
      });
    })()
      .then((resolved) => {
        if (active && resolved) setProfile(resolved.profile);
      })
      .catch(() => {
        tokenRef.current = null;
        if (!active) return;
        clearHostedSession();
        setToken(null);
        setProfile(null);
        setError('Your session has expired. Sign in again to continue.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api, clearHostedSession, renewHostedSession]);

  useEffect(() => {
    const session = readHostedSession();
    if (!token || !session?.refreshToken) return;
    const delay = Math.max(0, session.expiresAt - Date.now() - REFRESH_EARLY_MS);
    const timer = window.setTimeout(() => void renewHostedSession(), delay);
    return () => window.clearTimeout(timer);
  }, [renewHostedSession, token]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const userManager = await manager();
    if (!userManager) {
      setError('Hosted sign-in is not configured for this deployment.');
      return;
    }
    pendingInvitation();
    await userManager.signinRedirect({ extraQueryParams: { identity_provider: 'Google' } });
  }, [manager, pendingInvitation]);

  const startEmailSignIn = useCallback(
    async (email: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!emailOtpConfigured) throw new Error('Email code sign-in is not configured.');
        const { startEmailSignIn: beginEmailSignIn } = await import('./cognitoEmail');
        const result = await beginEmailSignIn(
          config.cognito.region,
          config.cognito.clientId,
          email,
        );
        if (result.status === 'AUTHENTICATED')
          await adoptToken(
            result.identityToken,
            email,
            false,
            true,
            result.refreshToken,
            result.expiresIn,
            result.accessToken,
          );
        return result;
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Email sign-in failed.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [adoptToken],
  );

  const startEmailSignUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!emailOtpConfigured) throw new Error('Email account creation is not configured.');
      const { startEmailSignUp: beginEmailSignUp } = await import('./cognitoEmail');
      return await beginEmailSignUp(
        config.cognito.region,
        config.cognito.clientId,
        email,
        password,
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Account creation failed.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmailCode = useCallback(
    async (challenge: EmailOtpChallenge, code: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!emailOtpConfigured) throw new Error('Email code sign-in is not configured.');
        const { verifyEmailChallenge } = await import('./cognitoEmail');
        const result = await verifyEmailChallenge(
          config.cognito.region,
          config.cognito.clientId,
          challenge,
          code,
        );
        if (result.status === 'AUTHENTICATED') {
          await adoptToken(
            result.identityToken,
            challenge.email,
            challenge.kind === 'SIGN_UP',
            true,
            result.refreshToken,
            result.expiresIn,
            result.accessToken,
          );
        }
        return result;
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : 'Code verification failed.',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [adoptToken],
  );

  const startPasswordSignIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const { startPasswordSignIn: begin } = await import('./cognitoEmail');
        const result = await begin(config.cognito.region, config.cognito.clientId, email, password);
        if (result.status === 'AUTHENTICATED')
          await adoptToken(
            result.identityToken,
            email,
            false,
            true,
            result.refreshToken,
            result.expiresIn,
            result.accessToken,
          );
        return result;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Password sign-in failed.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [adoptToken],
  );

  const verifyTotpSignIn = useCallback(
    async (challenge: Extract<PasswordAuthResult, { status: 'TOTP_CHALLENGE' }>, code: string) => {
      setLoading(true);
      setError(null);
      try {
        const { verifyTotpSignIn: verify } = await import('./cognitoEmail');
        const result = await verify(
          config.cognito.region,
          config.cognito.clientId,
          challenge,
          code,
        );
        await adoptToken(
          result.identityToken,
          challenge.email,
          false,
          true,
          result.refreshToken,
          result.expiresIn,
          result.accessToken,
        );
        return result;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Authenticator verification failed.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [adoptToken],
  );

  const startPasswordSetup = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { sendPasswordSetupCode } = await import('./cognitoEmail');
      await sendPasswordSetupCode(config.cognito.region, config.cognito.clientId, email);
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not send a password setup code.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPasswordSetup = useCallback(
    async (email: string, code: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const { confirmPasswordSetup: confirm } = await import('./cognitoEmail');
        await confirm(config.cognito.region, config.cognito.clientId, email, code, password);
        return true;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not set the password.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const localSignIn = useCallback(
    async (username: 'founder' | 'administrator') => {
      setLoading(true);
      setError(null);
      try {
        if (!config.localLoginEnabled) throw new Error('Local fixture sign-in is disabled.');
        const response = await api.request<{ access_token: string }>('/api/v1/auth/local-login', {
          method: 'POST',
          body: { username },
          authenticated: false,
          retrySafe: false,
        });
        await adoptToken(response.access_token, 'My workspace', false, false);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Sign-in failed.');
      } finally {
        setLoading(false);
      }
    },
    [adoptToken, api],
  );

  const completeCallback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userManager = await manager();
      if (!userManager) throw new Error('Hosted sign-in is not configured.');
      const user = await userManager.signinRedirectCallback();
      if (!user.id_token) throw new Error('Cognito did not return an identity token.');
      await adoptToken(
        user.id_token,
        String(user.profile.email ?? 'My workspace'),
        false,
        true,
        user.refresh_token,
        user.expires_at ? Math.max(0, user.expires_at * 1000 - Date.now()) / 1000 : undefined,
      );
    } catch (callbackError) {
      setError(callbackError instanceof Error ? callbackError.message : 'Sign-in callback failed.');
      throw callbackError;
    } finally {
      setLoading(false);
    }
  }, [adoptToken, manager]);

  const signOut = useCallback(async () => {
    tokenRef.current = null;
    setCognitoAccessToken(null);
    setToken(null);
    setProfile(null);
    setError(null);
    clearHostedSession();
    if (config.browserSessionProxy) {
      await fetch('/api/v1/auth/browser-session', { method: 'DELETE', credentials: 'include' });
    }
    const userManager = await manager();
    if (userManager) {
      await userManager.removeUser();
      await userManager.clearStaleState();
    }
  }, [clearHostedSession, manager]);

  const value = useMemo<AuthState>(
    () => ({
      profile,
      token,
      loading,
      error,
      api,
      signInWithGoogle,
      startEmailSignIn,
      startEmailSignUp,
      verifyEmailCode,
      startPasswordSignIn,
      verifyTotpSignIn,
      startPasswordSetup,
      confirmPasswordSetup,
      cognitoAccessToken,
      localSignIn,
      completeCallback,
      signOut,
    }),
    [
      api,
      completeCallback,
      error,
      loading,
      localSignIn,
      profile,
      signInWithGoogle,
      signOut,
      startEmailSignIn,
      startEmailSignUp,
      token,
      verifyEmailCode,
      startPasswordSignIn,
      verifyTotpSignIn,
      startPasswordSetup,
      confirmPasswordSetup,
      cognitoAccessToken,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Context hooks intentionally live beside their provider so the auth boundary stays cohesive.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
