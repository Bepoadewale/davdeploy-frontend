import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import type {
  Subscription,
  SupportTicket,
  UsageSummary,
  WorkspaceInvitation,
  WorkspaceMember,
} from '../api/contracts';
import { AsyncRegion } from '../components/AsyncRegion';
import { ReadableData } from '../components/ReadableData';
import { StatusBadge } from '../components/StatusBadge';
import { ProductVisual } from '../components/ProductVisual';
import { useAsync } from '../hooks/useAsync';

export default function SettingsPage() {
  const { api, profile } = useAuth();
  const admin = profile?.user.role === 'administrator';
  const supportManager =
    profile?.user.role === 'administrator' || profile?.user.role === 'operator';
  const state = useAsync(
    async (signal) => ({
      members: await api.request<WorkspaceMember[]>('/api/v1/workspace/members', { signal }),
      invitations: admin
        ? await api.request<WorkspaceInvitation[]>('/api/v1/workspace/invitations', { signal })
        : [],
      usage: await api.request<UsageSummary>('/api/v1/usage', { signal }),
      subscription: await api.request<Subscription>('/api/v1/billing/subscription', { signal }),
      supportTickets: await api.request<SupportTicket[]>('/api/v1/support/tickets', { signal }),
    }),
    [admin, api],
  );
  const [email, setEmail] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportBody, setSupportBody] = useState('');
  const [credential, setCredential] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function action(task: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await task();
      setMessage(success);
      state.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    await action(
      () =>
        api.request('/api/v1/workspace/invitations', {
          method: 'POST',
          retrySafe: false,
          body: { email, role: 'developer' },
        }),
      'Invitation sent by email.',
    );
    setEmail('');
  }

  async function resendInvitation(invitationId: string) {
    await action(
      () =>
        api.request(`/api/v1/workspace/invitations/${invitationId}/resend`, {
          method: 'POST',
          retrySafe: false,
        }),
      'Invitation email sent again.',
    );
  }

  async function cancelInvitation(invitationId: string) {
    await action(
      () =>
        api.request(`/api/v1/workspace/invitations/${invitationId}/cancel`, {
          method: 'POST',
          retrySafe: false,
        }),
      'Invitation cancelled.',
    );
  }

  async function createCredential() {
    setBusy(true);
    setError(null);
    try {
      const result = await api.request<{ secret?: string; token?: string; value?: string }>(
        '/api/v1/api-credentials',
        {
          method: 'POST',
          retrySafe: false,
          body: { name: `browser-${new Date().toISOString().slice(0, 10)}`, scopes: ['read'] },
        },
      );
      setCredential(
        result.secret ??
          result.token ??
          result.value ??
          'Credential created; secret format was not returned by this backend.',
      );
      setMessage('Credential created. Copy it now; this view will not persist it.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Credential creation failed.');
    } finally {
      setBusy(false);
    }
  }

  async function support(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const ticket = await api.request<SupportTicket>('/api/v1/support/tickets', {
        method: 'POST',
        retrySafe: false,
        body: { subject: supportSubject, body: supportBody },
      });
      setMessage(
        `Support request recorded as ${ticket.state.toLowerCase()}. Use email support for urgent follow-up.`,
      );
      setSupportSubject('');
      setSupportBody('');
      state.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Support request failed.');
    } finally {
      setBusy(false);
    }
  }

  async function updateSupportTicket(ticketId: string, stateValue: string) {
    await action(
      () =>
        api.request(`/api/v1/support/tickets/${ticketId}`, {
          method: 'PATCH',
          retrySafe: false,
          body: { state: stateValue },
        }),
      `Support status updated to ${stateValue.toLowerCase().replaceAll('_', ' ')}.`,
    );
  }

  return (
    <div className="page">
      <div className="page-heading visual-page-heading">
        <div>
          <p className="eyebrow">Workspace settings</p>
          <h1>Your workspace, under control.</h1>
          <p>Members, usage, access, and data.</p>
        </div>
        <ProductVisual kind="settings" />
      </div>
      {message ? (
        <div className="notice notice-success" role="status">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="notice notice-error" role="alert">
          {error}
        </div>
      ) : null}
      <AsyncRegion
        loading={state.loading}
        error={state.error}
        onRetry={state.reload}
        label="workspace settings"
      >
        {state.data ? (
          <div className="settings-stack">
            <section className="panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Members</p>
                  <h2>Server-resolved access</h2>
                </div>
              </div>
              <div className="member-list">
                {state.data.members.map((member) => (
                  <div key={member.subject}>
                    <span>
                      <b>{member.email ?? member.subject}</b>
                      <small>{member.subject}</small>
                    </span>
                    <StatusBadge state={member.role} />
                  </div>
                ))}
              </div>
              {admin ? (
                <>
                  <form className="inline-form" onSubmit={(event) => void invite(event)}>
                    <label>
                      Invite developer
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="teammate@company.com"
                        required
                      />
                    </label>
                    <button className="button button-secondary" disabled={busy} type="submit">
                      Send invitation
                    </button>
                  </form>
                  <div className="invitation-list" aria-label="Workspace invitations">
                    {state.data.invitations.length ? (
                      state.data.invitations.map((invitation) => (
                        <div className="invitation-row" key={invitation.id}>
                          <span>
                            <b>{invitation.email}</b>
                            <small>
                              {invitation.delivery_state.toLowerCase()} · sent{' '}
                              {invitation.send_count}{' '}
                              {invitation.send_count === 1 ? 'time' : 'times'}
                            </small>
                          </span>
                          <StatusBadge state={invitation.state} />
                          {invitation.state === 'PENDING' ? (
                            <div className="invitation-actions">
                              <button
                                className="button button-quiet"
                                disabled={busy}
                                type="button"
                                onClick={() => void resendInvitation(invitation.id)}
                              >
                                Resend
                              </button>
                              <button
                                className="button button-quiet"
                                disabled={busy}
                                type="button"
                                onClick={() => void cancelInvitation(invitation.id)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="muted">No invitations yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="muted">Only administrators can change workspace membership.</p>
              )}
            </section>
            <section className="panel">
              <p className="eyebrow">Subscription</p>
              <h2>Billing-ready controls</h2>
              <ReadableData value={state.data.subscription} />
              <p className="muted">
                The private-beta backend uses manual entitlements. This UI does not collect payment
                details.
              </p>
            </section>
            <section className="panel">
              <p className="eyebrow">Usage</p>
              <h2>Metered product activity</h2>
              <ReadableData value={state.data.usage} />
            </section>
            <section className="panel">
              <p className="eyebrow">Developer access</p>
              <h2>Scoped API credential</h2>
              <p className="muted">
                Create a read-only credential. The secret is shown once and never saved by this
                browser.
              </p>
              <button
                className="button button-secondary"
                disabled={busy}
                type="button"
                onClick={() => void createCredential()}
              >
                Create read-only credential
              </button>
              {credential ? (
                <div className="one-time-secret">
                  <strong>Copy now</strong>
                  <code>{credential}</code>
                  <button
                    className="button button-quiet"
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(credential);
                      setCredential(null);
                    }}
                  >
                    Copy and dismiss
                  </button>
                </div>
              ) : null}
            </section>
            <section className="panel">
              <p className="eyebrow">Privacy</p>
              <h2>Data lifecycle requests</h2>
              <p className="muted">
                Export and deletion are controlled workflows, not immediate browser-side operations.
              </p>
              <div className="button-row">
                <button
                  className="button button-secondary"
                  disabled={busy}
                  type="button"
                  onClick={() =>
                    void action(
                      () =>
                        api.request('/api/v1/data-lifecycle', {
                          method: 'POST',
                          retrySafe: false,
                          body: { request_type: 'EXPORT' },
                        }),
                      'Export request queued for operator review.',
                    )
                  }
                >
                  Request export
                </button>
                <button
                  className="button button-danger"
                  disabled={busy || !admin}
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Request workspace data deletion? The backend still controls approval and retention.',
                      )
                    )
                      void action(
                        () =>
                          api.request('/api/v1/data-lifecycle', {
                            method: 'POST',
                            retrySafe: false,
                            body: { request_type: 'DELETE' },
                          }),
                        'Deletion request queued for operator review.',
                      );
                  }}
                >
                  Request deletion
                </button>
              </div>
            </section>
            <section className="panel">
              <p className="eyebrow">Support</p>
              <h2>Support requests</h2>
              <p className="muted">
                Record a workspace-scoped request here, or email support for access and incident
                help. Never include passwords, one-time codes, keys, or cloud credentials.
              </p>
              <form onSubmit={(event) => void support(event)}>
                <label>
                  Subject
                  <input
                    value={supportSubject}
                    onChange={(event) => setSupportSubject(event.target.value)}
                    required
                    minLength={3}
                  />
                </label>
                <label>
                  Details
                  <textarea
                    value={supportBody}
                    onChange={(event) => setSupportBody(event.target.value)}
                    required
                  />
                </label>
                <button className="button button-primary" disabled={busy} type="submit">
                  Record support request
                </button>
              </form>
              <a className="button button-quiet" href="mailto:support@davdeploy.tech">
                Email support instead
              </a>
              <div className="invitation-list" aria-label="Support request history">
                {state.data.supportTickets.length ? (
                  state.data.supportTickets.map((ticket) => (
                    <div className="invitation-row" key={ticket.id}>
                      <span>
                        <b>{ticket.subject}</b>
                        <small>
                          {ticket.state.toLowerCase().replaceAll('_', ' ')} ·{' '}
                          {ticket.created_by_subject}
                        </small>
                      </span>
                      {supportManager ? (
                        <label>
                          Status
                          <select
                            aria-label={`Status for ${ticket.subject}`}
                            value={ticket.state}
                            disabled={busy}
                            onChange={(event) =>
                              void updateSupportTicket(ticket.id, event.target.value)
                            }
                          >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </label>
                      ) : (
                        <StatusBadge state={ticket.state} />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="muted">No support requests yet.</p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </AsyncRegion>
    </div>
  );
}
