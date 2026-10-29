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
import { ApiClient } from '../api/client';
import type { WorkspaceProfile } from '../api/contracts';
import { config, emailOtpConfigured, oidcConfigured } from '../config';
import type { EmailAuthResult, EmailOtpChallenge } from './cognitoEmail';
import { resolveWorkspaceProfile } from './workspaceSession';

interface AuthState {
  profile: WorkspaceProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  api: ApiClient;
  signInWithGoogle: () => Promise<void>;
  startEmailSignIn: (email: string) => Promise<EmailAuthResult | null>;
  startEmailSignUp: (email: string) => Promise<EmailAuthResult | null>;
  verifyEmailCode: (challenge: EmailOtpChallenge, code: string) => Promise<EmailAuthResult | null>;
  localSignIn: (username: 'founder' | 'administrator') => Promise<void>;
  completeCallback: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);
const HOSTED_SESSION_TOKEN_KEY = 'davdeploy.hosted-identity-token';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
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
    window.sessionStorage.removeItem(HOSTED_SESSION_TOKEN_KEY);
  }, []);

  const adoptToken = useCallback(
    async (
      accessToken: string,
      identityName = 'My workspace',
      createWorkspace = false,
      persistHostedSession = false,
    ) => {
      tokenRef.current = accessToken;
      setToken(accessToken);
      try {
        const resolved = await resolveWorkspaceProfile(api, {
          identityName,
          invitationToken: pendingInvitation(),
          createWorkspace,
        });
        setProfile(resolved.profile);
        if (persistHostedSession) {
          window.sessionStorage.setItem(HOSTED_SESSION_TOKEN_KEY, accessToken);
        }
        if (resolved.onboarded) window.sessionStorage.removeItem('davdeploy.invitation');
      } catch (requestError) {
        tokenRef.current = null;
        setToken(null);
        if (persistHostedSession) clearHostedSession();
        throw requestError;
      }
    },
    [api, clearHostedSession, pendingInvitation],
  );

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem(HOSTED_SESSION_TOKEN_KEY);
    if (!storedToken) return;
    let active = true;
    setLoading(true);
    setError(null);
    tokenRef.current = storedToken;
    setToken(storedToken);
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
  }, [api, clearHostedSession]);

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
          await adoptToken(result.identityToken, email, false, true);
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

  const startEmailSignUp = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!emailOtpConfigured) throw new Error('Email account creation is not configured.');
      const { startEmailSignUp: beginEmailSignUp } = await import('./cognitoEmail');
      return await beginEmailSignUp(config.cognito.region, config.cognito.clientId, email);
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
      await adoptToken(user.id_token, String(user.profile.email ?? 'My workspace'), false, true);
    } catch (callbackError) {
      setError(callbackError instanceof Error ? callbackError.message : 'Sign-in callback failed.');
      throw callbackError;
    } finally {
      setLoading(false);
    }
  }, [adoptToken, manager]);

  const signOut = useCallback(async () => {
    tokenRef.current = null;
    setToken(null);
    setProfile(null);
    setError(null);
    clearHostedSession();
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
