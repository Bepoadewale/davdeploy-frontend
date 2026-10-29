import { config } from '../config';

/** A browser session is authenticated by an HttpOnly same-origin cookie. */
export const BROWSER_SESSION_TOKEN = '__davdeploy_browser_session__';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(
    message: string,
    options: { status?: number; code?: string; requestId?: string } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? 0;
    this.code = options.code ?? 'request_failed';
    this.requestId = options.requestId;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  authenticated?: boolean;
  retrySafe?: boolean;
  idempotencyKey?: string;
}

const RETRYABLE_STATUS = new Set([408, 429, 502, 503, 504]);

export class ApiClient {
  constructor(
    private readonly getToken: () => string | null,
    private readonly baseUrl: string = config.apiBaseUrl,
  ) {}

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError('The API URL is not configured for this deployment.', {
        code: 'api_not_configured',
      });
    }
    if (!path.startsWith('/'))
      throw new ApiError('API paths must start with /.', { code: 'bad_path' });

    const method = (options.method ?? 'GET').toUpperCase();
    const retrySafe = options.retrySafe ?? ['GET', 'HEAD', 'OPTIONS'].includes(method);
    const attempts = retrySafe ? 2 : 1;
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await this.execute<T>(path, { ...options, method });
      } catch (error) {
        lastError = error;
        if (
          attempt + 1 >= attempts ||
          (error instanceof ApiError && !RETRYABLE_STATUS.has(error.status))
        ) {
          throw error;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 200 * (attempt + 1)));
      }
    }
    throw lastError;
  }

  private async execute<T>(path: string, options: ApiRequestOptions): Promise<T> {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort('timeout'),
      options.timeoutMs ?? 15_000,
    );
    const abort = () => controller.abort(options.signal?.reason);
    options.signal?.addEventListener('abort', abort, { once: true });

    const token = this.getToken();
    const authenticated = options.authenticated ?? true;
    if (authenticated && !token) {
      window.clearTimeout(timeout);
      throw new ApiError('Sign in is required.', { status: 401, code: 'authentication_required' });
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (authenticated && token && token !== BROWSER_SESSION_TOKEN) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        headers,
        signal: controller.signal,
        credentials: config.browserSessionProxy ? 'include' : options.credentials,
      });
      const requestId =
        response.headers.get('x-request-id') ??
        response.headers.get('x-correlation-id') ??
        undefined;
      if (!response.ok) {
        let message = `Request failed with status ${response.status}.`;
        try {
          const error = (await response.json()) as { detail?: string; message?: string };
          message = error.detail ?? error.message ?? message;
        } catch {
          // Preserve the status-based message for non-JSON errors.
        }
        throw new ApiError(message, {
          status: response.status,
          code: response.status === 403 ? 'permission_denied' : 'api_error',
          requestId,
        });
      }
      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (controller.signal.aborted) {
        throw new ApiError('The request timed out or was cancelled.', { code: 'request_aborted' });
      }
      throw new ApiError('The API could not be reached. Check the connection and try again.', {
        code: 'network_error',
      });
    } finally {
      window.clearTimeout(timeout);
      options.signal?.removeEventListener('abort', abort);
    }
  }
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
