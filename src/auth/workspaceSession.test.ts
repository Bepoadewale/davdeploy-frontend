import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import type { WorkspaceProfile } from '../api/contracts';
import { resolveWorkspaceProfile } from './workspaceSession';

const profile = {
  user: { subject: 'subject-1', role: 'administrator' },
  workspace: { id: 'workspace-1', name: 'Founder workspace' },
} as WorkspaceProfile;

describe('workspace session resolution', () => {
  it('onboards a newly confirmed account without an avoidable profile request', async () => {
    const request = vi.fn().mockResolvedValue(profile);

    const result = await resolveWorkspaceProfile({ request } as never, {
      identityName: 'founder@example.com',
      invitationToken: null,
      createWorkspace: true,
    });

    expect(result).toEqual({ profile, onboarded: true });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(
      '/api/v1/onboarding',
      expect.objectContaining({
        method: 'POST',
        body: { workspace_name: 'founder', invitation_token: undefined },
        timeoutMs: 45_000,
      }),
    );
  });

  it('onboards an invited identity without a redundant profile request', async () => {
    const request = vi.fn().mockResolvedValue(profile);

    const result = await resolveWorkspaceProfile({ request } as never, {
      identityName: 'invitee@example.com',
      invitationToken: 'invitation-token',
      createWorkspace: false,
    });

    expect(result.onboarded).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(
      '/api/v1/onboarding',
      expect.objectContaining({
        body: { workspace_name: 'invitee', invitation_token: 'invitation-token' },
        timeoutMs: 45_000,
      }),
    );
  });

  it('falls back to onboarding for an existing signed-in identity without membership', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new ApiError('Membership required', { status: 403 }))
      .mockResolvedValueOnce(profile);

    const result = await resolveWorkspaceProfile({ request } as never, {
      identityName: 'founder@example.com',
      invitationToken: null,
      createWorkspace: false,
    });

    expect(result.onboarded).toBe(true);
    expect(request).toHaveBeenNthCalledWith(1, '/api/v1/me', { timeoutMs: 45_000 });
    expect(request).toHaveBeenNthCalledWith(2, '/api/v1/onboarding', expect.anything());
  });
});
