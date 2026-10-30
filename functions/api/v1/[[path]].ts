interface Env {
  DAVDEPLOY_API_ORIGIN: string;
  DAVDEPLOY_COGNITO_TOKEN_ENDPOINT: string;
  DAVDEPLOY_COGNITO_CLIENT_ID: string;
}

const ID_COOKIE = 'davdeploy_browser_id';
const REFRESH_COOKIE = 'davdeploy_browser_refresh';
const REFRESH_EARLY_SECONDS = 60;
const REFRESH_MAX_AGE = 60 * 60 * 24;

function cookies(request: Request): Record<string, string> {
  return Object.fromEntries(
    (request.headers.get('Cookie') ?? '')
      .split(';')
      .map((entry) => entry.trim().split(/=(.*)/s, 2))
      .filter(([name]) => Boolean(name)),
  );
}

function jwtExpiresAt(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : 0;
  } catch {
    return 0;
  }
}

function sessionCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

function clearCookie(name: string): string {
  return `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function withSessionCookies(
  response: Response,
  identityToken: string,
  refreshToken: string,
): Response {
  const headers = new Headers(response.headers);
  headers.append('Set-Cookie', sessionCookie(ID_COOKIE, identityToken, 900));
  headers.append('Set-Cookie', sessionCookie(REFRESH_COOKIE, refreshToken, REFRESH_MAX_AGE));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function renew(env: Env, refreshToken: string): Promise<string | null> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: env.DAVDEPLOY_COGNITO_CLIENT_ID,
    refresh_token: refreshToken,
  });
  const response = await fetch(env.DAVDEPLOY_COGNITO_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { id_token?: string };
  return payload.id_token ?? null;
}

function upstreamUrl(request: Request, env: Env): string {
  const incoming = new URL(request.url);
  return `${env.DAVDEPLOY_API_ORIGIN.replace(/\/$/, '')}${incoming.pathname}${incoming.search}`;
}

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const isSession = url.pathname === '/api/v1/auth/browser-session';
  if (isSession && request.method === 'POST') {
    const payload = (await request.json()) as { identityToken?: string; refreshToken?: string };
    if (!payload.identityToken || !payload.refreshToken) {
      return Response.json(
        { message: 'A Cognito identity and refresh token are required.' },
        { status: 400 },
      );
    }
    const verified = await fetch(`${env.DAVDEPLOY_API_ORIGIN.replace(/\/$/, '')}/api/v1/me`, {
      headers: { Authorization: `Bearer ${payload.identityToken}` },
    });
    if (!verified.ok) {
      return Response.json(
        { message: 'Your identity could not be verified. Sign in again.' },
        { status: 401 },
      );
    }
    return withSessionCookies(
      new Response(null, { status: 204 }),
      payload.identityToken,
      payload.refreshToken,
    );
  }
  if (isSession && request.method === 'DELETE') {
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) {
      return Response.json(
        { message: 'Cross-site browser requests are not allowed.' },
        { status: 403 },
      );
    }
    const headers = new Headers();
    headers.append('Set-Cookie', clearCookie(ID_COOKIE));
    headers.append('Set-Cookie', clearCookie(REFRESH_COOKIE));
    return new Response(null, { status: 204, headers });
  }

  const headers = new Headers(request.headers);
  const suppliedAuthorization = headers.get('Authorization');
  const stored = cookies(request);
  let identityToken = stored[ID_COOKIE];
  const refreshToken = stored[REFRESH_COOKIE];
  let renewed = false;
  if (
    !suppliedAuthorization &&
    identityToken &&
    jwtExpiresAt(identityToken) <= Math.floor(Date.now() / 1000) + REFRESH_EARLY_SECONDS
  ) {
    if (!refreshToken)
      return Response.json({ message: 'Your session has ended. Sign in again.' }, { status: 401 });
    identityToken = await renew(env, refreshToken);
    if (!identityToken)
      return Response.json({ message: 'Your session has ended. Sign in again.' }, { status: 401 });
    renewed = true;
  }
  if (!suppliedAuthorization && identityToken) {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
      request.headers.get('Origin') !== url.origin
    ) {
      return Response.json(
        { message: 'Cross-site browser requests are not allowed.' },
        { status: 403 },
      );
    }
    headers.set('Authorization', `Bearer ${identityToken}`);
  }
  headers.delete('Cookie');
  headers.delete('Host');
  const response = await fetch(upstreamUrl(request, env), {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });
  if (renewed && identityToken && refreshToken)
    return withSessionCookies(response, identityToken, refreshToken);
  return response;
};
