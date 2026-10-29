/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BROWSER_SESSION_PROXY_ENABLED?: string;
  readonly VITE_AUTH_MODE?: 'local-fixture' | 'oidc';
  readonly VITE_ENABLE_LOCAL_LOGIN?: string;
  readonly VITE_GOOGLE_SIGN_IN_ENABLED?: string;
  readonly VITE_OIDC_AUTHORITY?: string;
  readonly VITE_OIDC_CLIENT_ID?: string;
  readonly VITE_OIDC_REDIRECT_URI?: string;
  readonly VITE_OIDC_POST_LOGOUT_REDIRECT_URI?: string;
  readonly VITE_COGNITO_REGION?: string;
  readonly VITE_COGNITO_USER_POOL_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
