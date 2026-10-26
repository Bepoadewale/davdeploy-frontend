import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { CustomerPlanRevision, DashboardResponse } from '../api/contracts';
import { AsyncRegion } from '../components/AsyncRegion';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { ProductVisual } from '../components/ProductVisual';
import { useAsync } from '../hooks/useAsync';

function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value),
      )
    : 'Date unavailable';
}

export default function OverviewPage() {
  const { api, profile } = useAuth();
  const administrator = profile?.user.role === 'administrator';
  const state = useAsync(
    async (signal) => {
      const [dashboard, queue] = await Promise.all([
        api.request<DashboardResponse>('/api/v1/dashboard', { signal }),
        administrator
          ? api.request<CustomerPlanRevision[]>(
              '/api/v1/admin/customer-plan-revisions?state=SUBMITTED',
              { signal },
            )
          : Promise.resolve([]),
      ]);
      return { dashboard, queue };
    },
    [api, administrator],
  );

  const roleCopy = administrator
    ? {
        eyebrow: 'Administrator workspace',
        title: 'Keep the next cloud decision moving.',
      }
    : {
        eyebrow: 'Developer workspace',
        title: 'Turn the next big idea into a clear plan.',
      };
  const emptyWorkspace =
    state.data != null &&
    !state.data.dashboard.projects.length &&
    !state.data.dashboard.plans.length &&
    !state.data.dashboard.cloud_connections.length &&
    !state.data.queue.length;

  return (
    <div className="page workspace-overview">
      <header className="page-heading workspace-overview-heading visual-page-heading">
        <div>
          <p className="eyebrow">{roleCopy.eyebrow}</p>
          <h1>{roleCopy.title}</h1>
        </div>
        <ProductVisual kind="overview" />
        <Link className="button button-primary" to="/plans/new">
          <span aria-hidden="true">+</span> Create plan
        </Link>
      </header>
      <AsyncRegion
        loading={state.loading}
        error={state.error}
        onRetry={state.reload}
        label="workspace overview"
      >
        {state.data ? (
          emptyWorkspace ? (
            <section className="panel workspace-first-plan">
              <div>
                <p className="eyebrow">Welcome to DavDeploy</p>
                <h1>Start with a clear cloud plan.</h1>
                <p>
                  Add the context for your next workload. DavDeploy helps you review the plan before
                  anything changes.
                </p>
                <Link className="button button-primary" to="/plans/new">
                  Create a plan
                </Link>
              </div>
              <ol aria-label="Your first plan">
                <li>
                  <span>1</span>
                  <div>
                    <b>Choose a repository</b>
                  </div>
                </li>
                <li>
                  <span>2</span>
                  <div>
                    <b>Connect AWS when ready</b>
                  </div>
                </li>
                <li>
                  <span>3</span>
                  <div>
                    <b>Review the next action</b>
                  </div>
                </li>
              </ol>
              <p className="workspace-first-plan-help">
                Need help? <Link to="/help">Read the guide</Link>
              </p>
            </section>
          ) : (
            <>
              <section className="workspace-stat-strip" aria-label="Workspace totals">
                <article>
                  <span>Projects</span>
                  <strong>{state.data.dashboard.projects.length}</strong>
                </article>
                <article>
                  <span>Cloud connections</span>
                  <strong>{state.data.dashboard.cloud_connections.length}</strong>
                </article>
                <article>
                  <span>Plan revisions</span>
                  <strong>{state.data.dashboard.plans.length}</strong>
                </article>
                <article>
                  <span>{administrator ? 'Awaiting decision' : 'Latest plan state'}</span>
                  {administrator ? (
                    <strong>{state.data.queue.length}</strong>
                  ) : state.data.dashboard.plans[0] ? (
                    <StatusBadge state={state.data.dashboard.plans[0].state} />
                  ) : (
                    <strong>0</strong>
                  )}
                </article>
              </section>

              <div className="workspace-focus-grid">
                <section
                  className={`panel workspace-focus-panel ${administrator ? 'admin-focus-panel' : ''}`}
                >
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">{administrator ? 'Review queue' : 'Recent plans'}</p>
                      <h2>
                        {administrator
                          ? 'Plans requiring a decision'
                          : 'Continue where you left off'}
                      </h2>
                    </div>
                    <Link to="/history">View history</Link>
                  </div>
                  {(administrator ? state.data.queue : state.data.dashboard.plans).length ? (
                    <div className="workspace-plan-list">
                      {(administrator ? state.data.queue : state.data.dashboard.plans)
                        .slice(0, 5)
                        .map((plan) => (
                          <Link
                            className="workspace-plan-row"
                            to={`/plans/${plan.id}`}
                            key={plan.id}
                          >
                            <span className="plan-row-mark" aria-hidden="true">
                              {administrator ? 'R' : 'P'}
                            </span>
                            <span className="plan-row-copy">
                              <b>
                                {plan.title ?? `Infrastructure plan, revision ${plan.revision}`}
                              </b>
                              <small>
                                {'creator_subject' in plan && plan.creator_subject
                                  ? `Submitted by ${plan.creator_subject}`
                                  : `${'project_name' in plan && plan.project_name ? plan.project_name : 'Workspace plan'} · ${formatDate(plan.created_at)}`}
                              </small>
                            </span>
                            <StatusBadge state={plan.state} />
                            <span className="plan-row-arrow" aria-hidden="true">
                              →
                            </span>
                          </Link>
                        ))}
                    </div>
                  ) : (
                    <EmptyState
                      title={administrator ? 'The review queue is clear' : 'No plans yet'}
                      message={
                        administrator
                          ? 'Submitted plans will appear here when an authorized decision is needed.'
                          : 'Describe the outcome you need and create your first governed deployment plan.'
                      }
                      action={
                        administrator ? undefined : { label: 'Create a plan', to: '/plans/new' }
                      }
                    />
                  )}
                </section>

                <aside className="panel workspace-readiness-panel">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Workspace</p>
                      <h2>Quick links</h2>
                    </div>
                  </div>
                  <div className="readiness-list">
                    <Link to="/connections">
                      <span
                        className={state.data.dashboard.cloud_connections.length ? 'ready' : ''}
                        aria-hidden="true"
                      />
                      <span>
                        <b>Connections</b>
                      </span>
                      <i aria-hidden="true">→</i>
                    </Link>
                    <Link to="/history">
                      <span
                        className={
                          state.data.dashboard.projects.length || state.data.dashboard.plans.length
                            ? 'ready'
                            : ''
                        }
                        aria-hidden="true"
                      />
                      <span>
                        <b>Recent projects</b>
                      </span>
                      <i aria-hidden="true">→</i>
                    </Link>
                    <Link to="/activity">
                      <span
                        className={state.data.dashboard.recent_activity?.length ? 'ready' : ''}
                        aria-hidden="true"
                      />
                      <span>
                        <b>Audit trail</b>
                      </span>
                      <i aria-hidden="true">→</i>
                    </Link>
                  </div>
                </aside>
              </div>
            </>
          )
        ) : null}
      </AsyncRegion>
    </div>
  );
}
