import { ApiError, type ApiClient } from '../api/client';
import type { WorkspaceProfile } from '../api/contracts';

interface ResolveWorkspaceOptions {
  identityName: string;
  invitationToken: string | null;
  createWorkspace: boolean;
}

// A cold hosted database can take longer than the general UI request budget.
// Authentication must not discard a valid Cognito session while that first
// workspace lookup is waking the control plane.
const AUTH_WORKSPACE_TIMEOUT_MS = 45_000;

export async function resolveWorkspaceProfile(
  api: Pick<ApiClient, 'request'>,
  options: ResolveWorkspaceOptions,
): Promise<{ profile: WorkspaceProfile; onboarded: boolean }> {
  const onboard = () =>
    api.request<WorkspaceProfile>('/api/v1/onboarding', {
      method: 'POST',
      body: {
        workspace_name: options.identityName.split('@')[0] || 'My workspace',
        invitation_token: options.invitationToken || undefined,
      },
      timeoutMs: AUTH_WORKSPACE_TIMEOUT_MS,
      retrySafe: false,
    });

  if (options.createWorkspace || options.invitationToken) {
    return { profile: await onboard(), onboarded: true };
  }

  try {
    return {
      profile: await api.request<WorkspaceProfile>('/api/v1/me', {
        timeoutMs: AUTH_WORKSPACE_TIMEOUT_MS,
      }),
      onboarded: false,
    };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 403) throw error;
    return { profile: await onboard(), onboarded: true };
  }
}
