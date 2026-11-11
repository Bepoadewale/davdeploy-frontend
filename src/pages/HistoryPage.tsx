import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type {
  CustomerPlanRevisionHistory,
  CustomerPlanRevisionSummary,
  DashboardResponse,
  ProjectSummary,
} from '../api/contracts';
import { AsyncRegion } from '../components/AsyncRegion';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { ProductVisual } from '../components/ProductVisual';
import { useAsync } from '../hooks/useAsync';

interface ProjectHistory {
  project: ProjectSummary;
  items: CustomerPlanRevisionSummary[];
  nextCursor: string | null;
}

function historyUrl(projectId: string, cursor?: string | null) {
  const query = new URLSearchParams({ limit: '20' });
  if (cursor) query.set('cursor', cursor);
  return `/api/v1/projects/${encodeURIComponent(projectId)}/customer-plan-revisions?${query}`;
}

export default function HistoryPage() {
  const { api } = useAuth();
  const state = useAsync(
    async (signal) => {
      const dashboard = await api.request<DashboardResponse>('/api/v1/dashboard', { signal });
      const histories = await Promise.all(
        dashboard.projects.map(async (project) => {
          const page = await api.request<CustomerPlanRevisionHistory>(historyUrl(project.id), {
            signal,
          });
          return { project, items: page.items, nextCursor: page.next_cursor };
        }),
      );
      return histories;
    },
    [api],
  );
  const [projectPages, setProjectPages] = useState<Record<string, ProjectHistory>>({});
  const [loadingProject, setLoadingProject] = useState<string | null>(null);
  const [loadErrors, setLoadErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (state.data) {
      setProjectPages(
        Object.fromEntries(state.data.map((history) => [history.project.id, history])),
      );
      setLoadErrors({});
    }
  }, [state.data]);

  const groups = useMemo(
    () =>
      (state.data ?? [])
        .map((initial) => projectPages[initial.project.id] ?? initial)
        .map((history) => ({
          ...history,
          filteredItems: history.items.filter((plan) => {
            const matchesState = filter === 'ALL' || plan.state === filter;
            const value = `${plan.title} ${plan.state}`.toLowerCase();
            return matchesState && value.includes(query.trim().toLowerCase());
          }),
        }))
        .filter((history) => history.filteredItems.length > 0 || history.nextCursor),
    [filter, projectPages, query, state.data],
  );
  const visibleCount = groups.reduce((count, group) => count + group.filteredItems.length, 0);
  const hasOlderRevisions = groups.some((group) => group.nextCursor);

  async function loadOlderRevisions(history: ProjectHistory) {
    if (!history.nextCursor || loadingProject) return;
    const projectId = history.project.id;
    const cursor = history.nextCursor;
    setLoadingProject(projectId);
    setLoadErrors((current) => ({ ...current, [projectId]: '' }));
    try {
      const page = await api.request<CustomerPlanRevisionHistory>(historyUrl(projectId, cursor));
      setProjectPages((current) => ({
        ...current,
        [projectId]: {
          ...history,
          items: [...history.items, ...page.items],
          nextCursor: page.next_cursor,
        },
      }));
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 401
          ? 'Your session may have expired. Sign in again to continue.'
          : error instanceof ApiError && error.status === 403
            ? 'You do not have permission to view these revisions.'
            : 'Unable to load older revisions. Try again.';
      setLoadErrors((current) => ({
        ...current,
        [projectId]: message,
      }));
    } finally {
      setLoadingProject(null);
    }
  }

  const loadedCount = (state.data ?? []).reduce(
    (count, history) => count + (projectPages[history.project.id] ?? history).items.length,
    0,
  );

  return (
    <div className="page">
      <div className="page-heading visual-page-heading">
        <div>
          <p className="eyebrow">Plan history</p>
          <h1>Every decision, in context.</h1>
          <p>Compare revisions and trace what changed.</p>
        </div>
        <ProductVisual kind="history" />
        <Link className="button button-primary" to="/plans/new">
          Create plan
        </Link>
      </div>
      <div className="filter-bar">
        <label>
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Plan name or status"
          />
        </label>
        <label>
          Status
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option>ALL</option>
            <option>DRAFT</option>
            <option>SUBMITTED</option>
            <option>APPROVED</option>
            <option>REJECTED</option>
          </select>
        </label>
      </div>
      <AsyncRegion
        loading={state.loading}
        error={state.error}
        onRetry={state.reload}
        label="plan history"
      >
        {groups.length ? (
          <div className="history-groups">
            {groups.map((history) => (
              <section key={history.project.id}>
                <div className="group-heading">
                  <b>{history.project.name}</b>
                  <small>
                    {history.filteredItems.length} shown · {history.items.length} loaded
                  </small>
                </div>
                {history.filteredItems.length ? (
                  <div className="row-list">
                    {history.filteredItems.map((plan) => (
                      <Link className="row-link" to={`/plans/${plan.id}`} key={plan.id}>
                        <span>
                          <b>{plan.title}</b>
                          <small>
                            Revision {plan.revision} ·{' '}
                            {plan.created_at
                              ? new Date(plan.created_at).toLocaleString()
                              : 'Date unavailable'}
                          </small>
                        </span>
                        <StatusBadge state={plan.state} />
                        <span aria-hidden="true">›</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No loaded revisions match these filters.</p>
                )}
                {loadErrors[history.project.id] ? (
                  <p className="notice notice-error" role="alert">
                    {loadErrors[history.project.id]}
                  </p>
                ) : null}
                {history.nextCursor ? (
                  <button
                    className="button button-secondary"
                    type="button"
                    disabled={loadingProject !== null}
                    onClick={() => void loadOlderRevisions(history)}
                  >
                    {loadingProject === history.project.id
                      ? 'Loading…'
                      : loadErrors[history.project.id]
                        ? 'Retry loading older revisions'
                        : 'Load older revisions'}
                  </button>
                ) : null}
              </section>
            ))}
            {visibleCount === 0 && !hasOlderRevisions ? (
              <EmptyState
                title={loadedCount ? 'No matching plans' : 'No plans yet'}
                message={
                  loadedCount
                    ? 'Try a different search or status.'
                    : 'Create a plan to start workspace history.'
                }
                action={loadedCount ? undefined : { label: 'Create a plan', to: '/plans/new' }}
              />
            ) : null}
          </div>
        ) : (
          <EmptyState
            title={loadedCount ? 'No matching plans' : 'No plans yet'}
            message={
              loadedCount
                ? 'Try a different search or status.'
                : 'Create a plan to start workspace history.'
            }
            action={loadedCount ? undefined : { label: 'Create a plan', to: '/plans/new' }}
          />
        )}
        {(query || filter !== 'ALL') && hasOlderRevisions ? (
          <p className="muted" aria-live="polite">
            Filters include the revisions loaded so far. Load older revisions to search further
            back.
          </p>
        ) : null}
      </AsyncRegion>
    </div>
  );
}
