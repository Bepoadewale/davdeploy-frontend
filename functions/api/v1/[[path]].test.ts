import { afterEach, describe, expect, it, vi } from 'vitest';
import { onRequest } from './[[path]]';

const env = {
  DAVDEPLOY_API_ORIGIN: 'https://api.example.test',
  DAVDEPLOY_COGNITO_TOKEN_ENDPOINT: 'https://auth.example.test/oauth2/token',
  DAVDEPLOY_COGNITO_CLIENT_ID: 'public-client',
};

const token = (expiresAt: number) =>
  `header.${btoa(JSON.stringify({ exp: expiresAt })).replace(/=/g, '')}.signature`;

function request(path: string, init: RequestInit = {}) {
  return new Request(`https://davdeploy.tech${path}`, init);
}

describe('browser-session Pages Function', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('validates a Cognito identity before issuing host-only HttpOnly cookies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await onRequest({
      request: request('/api/v1/auth/browser-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityToken: 'identity', refreshToken: 'refresh' }),
      }),
      env,
    });

    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/api/v1/me', {
      headers: { Authorization: 'Bearer identity' },
    });
    expect(response.status).toBe(204);
    expect(response.headers.getSetCookie().join('\n')).toContain('HttpOnly');
    expect(response.headers.getSetCookie().join('\n')).toContain('Secure');
    expect(response.headers.getSetCookie().join('\n')).toContain('SameSite=Lax');
    expect(response.headers.getSetCookie().join('\n')).not.toContain('Domain=');
  });

  it('refreshes an expiring cookie token and forwards the renewed bearer token upstream', async () => {
    const oldToken = token(Math.floor(Date.now() / 1000) + 10);
    const newToken = token(Math.floor(Date.now() / 1000) + 900);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id_token: newToken }), { status: 200 }))
      .mockResolvedValueOnce(new Response('{"workspace":"ok"}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await onRequest({
      request: request('/api/v1/me', {
        headers: { Cookie: `davdeploy_browser_id=${oldToken}; davdeploy_browser_refresh=refresh` },
      }),
      env,
    });

    expect(fetchMock.mock.calls[0][0]).toBe('https://auth.example.test/oauth2/token');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.example.test/api/v1/me');
    expect(
      new Headers((fetchMock.mock.calls[1][1] as RequestInit).headers).get('Authorization'),
    ).toBe(`Bearer ${newToken}`);
    expect(response.headers.getSetCookie().join('\n')).toContain('davdeploy_browser_id=');
    expect(await response.json()).toEqual({ workspace: 'ok' });
  });

  it('rejects a cross-site cookie-authenticated mutation', async () => {
    const response = await onRequest({
      request: request('/api/v1/plans', {
        method: 'POST',
        headers: {
          Origin: 'https://attacker.example',
          Cookie: `davdeploy_browser_id=${token(Math.floor(Date.now() / 1000) + 900)}`,
        },
      }),
      env,
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: 'Cross-site browser requests are not allowed.',
    });
  });
});
