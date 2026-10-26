import { ApiError, type ApiClient } from '../api/client';
import type { WorkspaceProfile } from '../api/contracts';

interface ResolveWorkspaceOptions {
  identityName: string;
  invitationToken: string | null;
  createWorkspace: boolean;
}

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
      retrySafe: false,
    });

  if (options.createWorkspace || options.invitationToken) {
    return { profile: await onboard(), onboarded: true };
  }

  try {
    return { profile: await api.request<WorkspaceProfile>('/api/v1/me'), onboarded: false };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 403) throw error;
    return { profile: await onboard(), onboarded: true };
  }
}
