import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { CloudConnection, GitHubConnection } from '../api/contracts';
import { AsyncRegion } from '../components/AsyncRegion';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { ProductVisual } from '../components/ProductVisual';
import { useAsync } from '../hooks/useAsync';

export default function ConnectionsPage() {
  const { api } = useAuth();
  const state = useAsync(
    async (signal) => ({
      github: await api.request<GitHubConnection>('/api/v1/github/connection', { signal }),
      cloud: await api.request<CloudConnection[]>('/api/v1/cloud-connections', { signal }),
    }),
    [api],
  );
  const [cloudProvider, setCloudProvider] = useState('aws');
  const [accountId, setAccountId] = useState('');
  const [accessMode, setAccessMode] = useState<
    'existing-role' | 'discovery' | 'administrator-pilot'
  >('discovery');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function beginCloudConnection() {
    setBusy(true);
    setMessage(null);
    try {
      if (!/^\d{12}$/.test(accountId)) throw new Error('Enter a 12-digit AWS account ID.');
      const connection = await api.request<CloudConnection>('/api/v1/cloud-connections', {
        method: 'POST',
        body: { display_name: `AWS account ${accountId}`, provider: 'aws' },
        retrySafe: false,
      });
      if (accessMode === 'existing-role') {
        setMessage(
          'Role contract created. Configure your existing role, then verify this connection.',
        );
        state.reload();
        return;
      }
      const setup = await api.request<{ quick_create_url: string }>(
        `/api/v1/cloud-connections/${connection.id}/aws-quick-create`,
        {
          method: 'POST',
          body: { account_id: accountId, access_mode: accessMode },
          retrySafe: false,
        },
      );
      window.open(setup.quick_create_url, '_blank', 'noopener,noreferrer');
      setMessage(
        accessMode === 'administrator-pilot'
          ? 'AWS opened a review page for a separate AdministratorAccess pilot role.'
          : 'AWS opened a review page for a read-only discovery role. No workload resources were requested.',
      );
      state.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Connection setup failed.');
    } finally {
      setBusy(false);
    }
  }

  async function disconnect(id: string) {
    setBusy(true);
    setMessage(null);
    try {
      await api.request(`/api/v1/cloud-connections/${id}`, { method: 'DELETE', retrySafe: false });
      setMessage('Connection metadata disconnected.');
      state.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Disconnect failed.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyConnection(id: string) {
    setBusy(true);
    setMessage(null);
    try {
      const job = await api.request<{ id: string; state: string }>(
        `/api/v1/cloud-connections/${id}/aws-verify`,
        { method: 'POST', body: { region: 'us-east-1' }, retrySafe: false },
      );
      setMessage(
        job.state === 'SUCCEEDED'
          ? 'Cloud connection verified. Live inventory is now available for planning.'
          : 'Verification queued. Refresh this page shortly to see the verified connection.',
      );
      state.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Connection verification failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-heading visual-page-heading">
        <div>
          <p className="eyebrow">Connections</p>
          <h1>Connect only what you trust.</h1>
          <p>Scoped access to code and customer-owned cloud.</p>
        </div>
        <ProductVisual kind="connections" />
      </div>
      {message ? (
        <div className="notice" role="status">
          {message}
        </div>
      ) : null}
      <AsyncRegion
        loading={state.loading}
        error={state.error}
        onRetry={state.reload}
        label="connections"
      >
        {state.data ? (
          <div className="connection-stack">
            <section className="panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">GitHub</p>
                  <h2>Repository access</h2>
                </div>
                <StatusBadge state={state.data.github.execution} />
              </div>
              <p className="muted">
                Repository discovery is read-only. Desired-state writes require a separate reviewed
                backend capability.
              </p>
              <div
                className="connection-access-options"
                role="radiogroup"
                aria-label="AWS access type"
              >
                {[
                  ['existing-role', 'Use an existing role', 'Bring a customer-managed role.'],
                  ['discovery', 'Create read-only access', 'Recommended for planning.'],
                  [
                    'administrator-pilot',
                    'Enable deployment pilot',
                    'Creates a separate AdministratorAccess role.',
                  ],
                ].map(([value, title, detail]) => (
                  <button
                    key={value}
                    type="button"
                    className={accessMode === value ? 'is-selected' : ''}
                    onClick={() => setAccessMode(value as typeof accessMode)}
                  >
                    <b>{title}</b>
                    <small>{detail}</small>
                  </button>
                ))}
              </div>
              {accessMode === 'administrator-pilot' ? (
                <p className="notice notice-error">
                  Pilot access can create, change, and delete AWS resources. Use it only for a
                  reviewed deployment pilot.
                </p>
              ) : null}
              {state.data.github.installations.length ? (
                <div className="compact-list">
                  {state.data.github.installations.map((item) => (
                    <div key={item.id}>
                      <span className="compact-mark">GH</span>
                      <span>
                        <b>{item.account_login}</b>
                        <small>
                          {item.account_type} · installation {item.id}
                        </small>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No GitHub installation"
                  message="Authorize the backend GitHub App before selecting repositories."
                />
              )}
              {state.data.github.install_url ? (
                <a
                  className="button button-secondary"
                  href={state.data.github.install_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open GitHub authorization
                </a>
              ) : null}
            </section>
            <section className="panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Cloud</p>
                  <h2>Customer-owned environments</h2>
                </div>
              </div>
              <p className="muted">
                DavDeploy never asks the browser for provider access keys. AWS setup creates scoped
                role metadata through an AWS review.
              </p>
              <div className="inline-form">
                <label>
                  Cloud provider
                  <select
                    value={cloudProvider}
                    onChange={(event) => setCloudProvider(event.target.value)}
                  >
                    <option value="aws">AWS</option>
                    <option value="azure">Azure — coming soon</option>
                    <option value="gcp">Google Cloud — coming soon</option>
                    <option value="other">Other cloud — coming soon</option>
                  </select>
                </label>
                {cloudProvider === 'aws' ? (
                  <>
                    <label>
                      AWS account ID
                      <input
                        inputMode="numeric"
                        maxLength={12}
                        value={accountId}
                        onChange={(event) => setAccountId(event.target.value.replace(/\D/g, ''))}
                        placeholder="123456789012"
                      />
                    </label>
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={busy || !accountId}
                      onClick={() => void beginCloudConnection()}
                    >
                      {accessMode === 'existing-role'
                        ? 'Use role contract'
                        : accessMode === 'administrator-pilot'
                          ? 'Enable pilot access'
                          : 'Connect Account'}
                    </button>
                  </>
                ) : (
                  <p className="cloud-provider-coming-soon" role="status">
                    {cloudProvider === 'azure'
                      ? 'Azure'
                      : cloudProvider === 'gcp'
                        ? 'Google Cloud'
                        : 'This cloud'}{' '}
                    connections are coming soon. Choose AWS to connect an account today.
                  </p>
                )}
              </div>
              {state.data.cloud.length ? (
                <div className="connection-list">
                  {state.data.cloud.map((item) => (
                    <article key={item.id}>
                      <div>
                        <b>{item.display_name}</b>
                        <small>
                          {item.provider.toUpperCase()} ·{' '}
                          {item.account_id ?? 'Account setup pending'}
                        </small>
                      </div>
                      <StatusBadge state={item.setup_state} />
                      {item.setup_state === 'SETUP_LINK_GENERATED' ? (
                        <button
                          className="button button-secondary"
                          disabled={busy}
                          type="button"
                          onClick={() => void verifyConnection(item.id)}
                        >
                          Verify setup
                        </button>
                      ) : null}
                      <button
                        className="button button-quiet"
                        disabled={busy}
                        type="button"
                        onClick={() => void disconnect(item.id)}
                      >
                        Disconnect
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No cloud connection"
                  message="Connect an AWS account when you are ready to create a targeted plan."
                />
              )}
            </section>
          </div>
        ) : null}
      </AsyncRegion>
    </div>
  );
}
