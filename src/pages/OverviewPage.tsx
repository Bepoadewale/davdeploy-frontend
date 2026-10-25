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
        description: 'Review the plan, make the call, and keep the story clear.',
      }
    : {
        eyebrow: 'Developer workspace',
        title: 'Turn the next big idea into a clear plan.',
        description: 'Bring the context. We help make the next move easier to review.',
      };

  return (
    <div className="page workspace-overview">
      <header className="page-heading workspace-overview-heading visual-page-heading">
        <div>
          <p className="eyebrow">{roleCopy.eyebrow}</p>
          <h1>{roleCopy.title}</h1>
          <p>{roleCopy.description}</p>
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
                      {administrator ? 'Plans requiring a decision' : 'Continue where you left off'}
                    </h2>
                  </div>
                  <Link to="/history">View history</Link>
                </div>
                {(administrator ? state.data.queue : state.data.dashboard.plans).length ? (
                  <div className="workspace-plan-list">
                    {(administrator ? state.data.queue : state.data.dashboard.plans)
                      .slice(0, 5)
                      .map((plan) => (
                        <Link className="workspace-plan-row" to={`/plans/${plan.id}`} key={plan.id}>
                          <span className="plan-row-mark" aria-hidden="true">
                            {administrator ? 'R' : 'P'}
                          </span>
                          <span className="plan-row-copy">
                            <b>{plan.title ?? `Infrastructure plan, revision ${plan.revision}`}</b>
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
                    <p className="eyebrow">Workspace readiness</p>
                    <h2>What is ready</h2>
                  </div>
                </div>
                <div className="readiness-list">
                  <Link to="/connections">
                    <span
                      className={state.data.dashboard.cloud_connections.length ? 'ready' : ''}
                      aria-hidden="true"
                    />
                    <span>
                      <b>Cloud context</b>
                      <small>
                        {state.data.dashboard.cloud_connections.length
                          ? `${state.data.dashboard.cloud_connections.length} connection${state.data.dashboard.cloud_connections.length === 1 ? '' : 's'} available`
                          : 'Connect scoped account metadata'}
                      </small>
                    </span>
                    <i aria-hidden="true">→</i>
                  </Link>
                  <Link to="/plans/new">
                    <span
                      className={
                        state.data.dashboard.projects.some((project) => project.repository_url)
                          ? 'ready'
                          : ''
                      }
                      aria-hidden="true"
                    />
                    <span>
                      <b>Repository evidence</b>
                      <small>
                        {state.data.dashboard.projects.some((project) => project.repository_url)
                          ? 'Repository context available'
                          : 'Choose a repository for analysis'}
                      </small>
                    </span>
                    <i aria-hidden="true">→</i>
                  </Link>
                  <Link to="/activity">
                    <span
                      className={state.data.dashboard.recent_activity?.length ? 'ready' : ''}
                      aria-hidden="true"
                    />
                    <span>
                      <b>Decision trail</b>
                      <small>
                        {state.data.dashboard.recent_activity?.length
                          ? 'Evidence is being recorded'
                          : 'Activity will appear after your first action'}
                      </small>
                    </span>
                    <i aria-hidden="true">→</i>
                  </Link>
                </div>
                <p className="readiness-note">
                  Every important change has a clear decision record.
                </p>
              </aside>
            </div>

            <div className="two-column">
              <section className="panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Recent projects</p>
                    <h2>Cloud work in progress</h2>
                  </div>
                  <Link to="/history">History</Link>
                </div>
                {state.data.dashboard.projects.length ? (
                  <div className="compact-list">
                    {state.data.dashboard.projects.slice(0, 5).map((project) => (
                      <div key={project.id}>
                        <span className="compact-mark">P</span>
                        <span>
                          <b>{project.name}</b>
                          <small>{project.repository_url || 'Repository not connected'}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No projects yet"
                    message="Start with an outcome and repository to create your first governed deployment plan."
                    action={{ label: 'Create a plan', to: '/plans/new' }}
                  />
                )}
              </section>
              <section className="panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Recent activity</p>
                    <h2>Latest evidence</h2>
                  </div>
                  <Link to="/activity">Activity</Link>
                </div>
                {state.data.dashboard.recent_activity?.length ? (
                  <div className="compact-list">
                    {state.data.dashboard.recent_activity.slice(0, 5).map((event, index) => (
                      <div key={event.id ?? index}>
                        <span className="compact-mark">A</span>
                        <span>
                          <b>{event.action.replaceAll('_', ' ')}</b>
                          <small>{formatDate(event.at)}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No activity recorded"
                    message="Governed actions will appear here with actor and entity evidence."
                  />
                )}
              </section>
            </div>
            {!state.data.dashboard.projects.length && !state.data.dashboard.plans.length ? (
              <section className="onboarding panel workspace-onboarding">
                <div>
                  <p className="eyebrow">Getting started</p>
                  <h2>From repository to a confident next move</h2>
                  <p>Connect, review, approve, move forward.</p>
                </div>
                <ol>
                  <li>
                    <span>1</span>
                    <b>Connect code and cloud</b>
                    <small>Choose authorized source and target context</small>
                  </li>
                  <li>
                    <span>2</span>
                    <b>Plan and approve</b>
                    <small>Review cost, security, unknowns, and trade-offs</small>
                  </li>
                  <li>
                    <span>3</span>
                    <b>Move forward with confidence</b>
                    <small>Keep the approved decision and its outcome together</small>
                  </li>
                </ol>
              </section>
            ) : null}
          </>
        ) : null}
      </AsyncRegion>
    </div>
  );
}
