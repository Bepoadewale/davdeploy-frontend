import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { CustomerPlanRevision, GeneratedPlanRunHistory } from '../api/contracts';
import { AsyncRegion } from '../components/AsyncRegion';
import { ReadableData } from '../components/ReadableData';
import { StatusBadge } from '../components/StatusBadge';
import { ProductVisual } from '../components/ProductVisual';
import { useAsync } from '../hooks/useAsync';
import { downloadJson } from '../utils/downloadJson';

type MutationBody = Record<string, unknown> | undefined;

function PlanDetail({
  eyebrow,
  title,
  summary,
  value,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  value: unknown;
}) {
  return (
    <section className="panel plan-detail">
      <details>
        <summary>
          <span>
            <span className="eyebrow">{eyebrow}</span>
            <strong>{title}</strong>
          </span>
          <span className="plan-detail-toggle">
            <span className="plan-detail-read-more">Read details</span>
            <span className="plan-detail-close">Close</span>
          </span>
        </summary>
        <p className="plan-detail-summary">{summary}</p>
        <div className="plan-detail-content">
          <ReadableData value={value} />
        </div>
        <button
          className="button button-quiet plan-detail-close-bottom"
          type="button"
          onClick={(event) => {
            const detail = event.currentTarget.closest('details');
            if (detail) detail.open = false;
          }}
        >
          Close details
        </button>
      </details>
    </section>
  );
}

export default function PlanPage() {
  const { revisionId = '' } = useParams();
  const { api, profile } = useAuth();
  const state = useAsync(
    (signal) =>
      api.request<CustomerPlanRevision>(
        `/api/v1/customer-plan-revisions/${encodeURIComponent(revisionId)}`,
        { signal },
      ),
    [api, revisionId],
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const review = state.data;
  const admin = profile?.user.role === 'administrator';

  async function mutate(path: string, body?: MutationBody, success = 'Action recorded.') {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await api.request(path, { method: 'POST', body, retrySafe: false });
      setMessage(success);
      state.reload();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  function exportSummary() {
    if (!review) return;
    downloadJson(`davdeploy-plan-revision-${review.revision}.json`, {
      exported_at: new Date().toISOString(),
      export_type: 'customer-plan-summary',
      plan: {
        title: review.title ?? review.content.summary.selected_profile,
        revision: review.revision,
        approval_state: review.state.toLowerCase().replaceAll('_', ' '),
        summary: review.content.summary,
        resources: review.content.resource_breakdown,
        requirements: review.content.application_analysis,
        estimated_cost: review.content.cost_estimate,
        security: review.content.security,
        observability: review.content.observability,
        deployment_strategy: review.content.deployment_strategy,
        risks: review.content.risks_and_limitations,
      },
    });
  }

  async function addComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    await mutate(
      `/api/v1/customer-plans/revisions/${revisionId}/comments`,
      { body: comment.trim() },
      'Comment recorded.',
    );
    setComment('');
  }

  return (
    <div className="page">
      <AsyncRegion
        loading={state.loading}
        error={state.error}
        onRetry={state.reload}
        label="plan review"
      >
        {review ? (
          <>
            <div className="page-heading visual-page-heading plan-visual-heading">
              <div>
                <p className="eyebrow">Infrastructure plan · revision {review.revision}</p>
                <h1>{review.title ?? review.content.summary.selected_profile}</h1>
              </div>
              <ProductVisual kind="architecture" />
              <div className="heading-actions">
                <StatusBadge state={review.state} />
                <button className="button button-secondary" type="button" onClick={exportSummary}>
                  Download plan evidence
                </button>
              </div>
            </div>
            <details className="digest plan-digest">
              <summary>View immutable plan digest</summary>
              <div>
                <code>{review.content_digest}</code>
                <button
                  className="button button-quiet"
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(review.content_digest)}
                >
                  Copy
                </button>
              </div>
            </details>
            <div className="truth-banner">
              <strong>
                {review.state === 'APPROVED' || review.state === 'SELF_APPROVED'
                  ? 'Approved.'
                  : 'This is a review record, not a deployment.'}
              </strong>
              <span>
                {review.state === 'APPROVED' || review.state === 'SELF_APPROVED'
                  ? 'Approval and deployment are separate. The progress below shows any operation the backend has recorded.'
                  : 'Infrastructure exists only when the backend reports independently observed execution.'}
              </span>
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
            <section className="plan-overview panel">
              <div>
                <p className="eyebrow">Selected architecture</p>
                <h2>{review.content.summary.selected_profile}</h2>
              </div>
              <div className="architecture-flow">
                <div>
                  <b>Repository</b>
                  <small>Source evidence</small>
                </div>
                {review.content.resource_breakdown.map((resource) => (
                  <div key={`${resource.service}-${resource.name}`}>
                    <b>{resource.service}</b>
                    <small>{resource.purpose}</small>
                  </div>
                ))}
              </div>
            </section>
            <div className="review-grid">
              <PlanDetail
                eyebrow="Application evidence"
                title="Interpreted requirements"
                summary="Repository, workload, and constraints used for this plan."
                value={review.content.application_analysis}
              />
              <PlanDetail
                eyebrow="Cost"
                title="Estimated range and assumptions"
                summary="A planning estimate, not an AWS bill."
                value={review.content.cost_estimate}
              />
              <PlanDetail
                eyebrow="Security"
                title="Controls in the plan"
                summary="The protections the selected architecture is designed to use."
                value={review.content.security}
              />
              <PlanDetail
                eyebrow="Observability"
                title="Metrics and dashboards"
                summary="What the plan proposes to measure and make visible."
                value={review.content.observability}
              />
              <PlanDetail
                eyebrow="Deployment strategy"
                title="Governed path"
                summary="The review and approval path before any future execution."
                value={review.content.deployment_strategy}
              />
              <PlanDetail
                eyebrow="Risk and uncertainty"
                title="Known limits and policy"
                summary="Limits, assumptions, and checks that need attention."
                value={{
                  risks: review.content.risks_and_limitations,
                  policy_findings: review.content.policy_findings,
                }}
              />
            </div>
            <section className="panel governance-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Governance</p>
                  <h2>
                    {review.state === 'APPROVED' || review.state === 'SELF_APPROVED'
                      ? 'Decision recorded'
                      : 'Available next action'}
                  </h2>
                </div>
              </div>
              <div className="action-stack">
                {review.state === 'DRAFT' ? (
                  <button
                    className="button button-primary"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void mutate(
                        `/api/v1/customer-plan-revisions/${review.id}/submit`,
                        undefined,
                        'Submitted for administrator review. It has not been deployed.',
                      )
                    }
                  >
                    Submit for approval
                  </button>
                ) : null}
                {review.state === 'SUBMITTED' && admin ? (
                  <>
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void mutate(
                          `/api/v1/customer-plan-revisions/${review.id}/decisions`,
                          { decision: 'APPROVED', content_digest: review.content_digest },
                          'Approval persisted. It has not been deployed.',
                        )
                      }
                    >
                      Approve exact digest
                    </button>
                    <label>
                      Rejection reason
                      <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                      />
                      <button
                        className="button button-danger"
                        type="button"
                        disabled={busy || !reason.trim()}
                        onClick={() =>
                          void mutate(
                            `/api/v1/customer-plan-revisions/${review.id}/decisions`,
                            { decision: 'REJECTED', content_digest: review.content_digest, reason },
                            'Rejection persisted; the creator can revise.',
                          )
                        }
                      >
                        Reject plan
                      </button>
                    </label>
                  </>
                ) : null}
                {review.state === 'SUBMITTED' && !admin ? (
                  <p className="muted">
                    Waiting for an authorized workspace administrator. The backend enforces this
                    decision.
                  </p>
                ) : null}
                {review.state === 'REJECTED' ? (
                  <button
                    className="button button-primary"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void mutate(
                        `/api/v1/customer-plans/${review.plan_id}/revisions`,
                        { content: review.content },
                        'New immutable draft revision created.',
                      )
                    }
                  >
                    Create revised draft
                  </button>
                ) : null}
                {review.state === 'APPROVED' || review.state === 'SELF_APPROVED' ? (
                  <ApprovedProgress review={review} api={api} onRefresh={state.reload} />
                ) : null}
              </div>
            </section>
            <section className="panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Collaboration</p>
                  <h2>Review comments</h2>
                </div>
              </div>
              <form className="comment-form" onSubmit={(event) => void addComment(event)}>
                <label htmlFor="comment">Add context for reviewers</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
                <button
                  className="button button-secondary"
                  disabled={busy || !comment.trim()}
                  type="submit"
                >
                  Add comment
                </button>
              </form>
            </section>
          </>
        ) : null}
      </AsyncRegion>
    </div>
  );
}

function ApprovedProgress({
  review,
  api,
  onRefresh,
}: {
  review: CustomerPlanRevision;
  api: ReturnType<typeof useAuth>['api'];
  onRefresh: () => void;
}) {
  const generatedRunHistory = useAsync(
    (signal) => {
      if (!review.project_id) {
        return Promise.resolve({ project_id: '', items: [], next_cursor: null });
      }
      const query = new URLSearchParams({ revision_id: review.id, limit: '1' });
      return api.request<GeneratedPlanRunHistory>(
        `/api/v1/projects/${encodeURIComponent(review.project_id)}/generated-plan-runs?${query}`,
        { signal },
      );
    },
    [api, review.id, review.project_id],
  );
  const generatedRun = generatedRunHistory.data?.items?.[0];
  const latestPlanRecord = review.terraform_plan_reviews?.[0];
  const applyRecord = review.cloud_execution_runs?.find(
    (item) => item.mode === 'AUTHENTICATED_APP_RUNNER_APPLY',
  );
  const teardownRecord = review.cloud_execution_runs?.find(
    (item) => item.mode === 'AUTHENTICATED_APP_RUNNER_DESTROY',
  );
  const planStatus = generatedRun
    ? describeGeneratedPlanRun(generatedRun.state)
    : describePlanReview(latestPlanRecord);
  const planStepTone = getPlanStepTone(generatedRun?.state, latestPlanRecord);
  const applyStepTone = getOperationStepTone(applyRecord, 'deployment');
  const healthStep = getHealthStep(applyRecord);
  const teardownStepTone = getOperationStepTone(teardownRecord, 'teardown');
  const applyStatus = applyRecord
    ? describeOperationState(applyRecord.state, 'deployment')
    : 'Not started. Approval alone does not create resources.';
  const teardownStatus = teardownRecord
    ? describeOperationState(teardownRecord.state, 'teardown')
    : 'Not started. No resources are being deleted; teardown is not available here yet.';
  const nextStep = describeNextStep(applyRecord, teardownRecord, generatedRun?.state);
  const hasRecordedOperation = Boolean(
    generatedRun || latestPlanRecord || applyRecord || teardownRecord,
  );
  return (
    <section className="approved-progress" aria-labelledby="deployment-progress-title">
      <div className="approved-progress-heading">
        <div>
          <p className="eyebrow">After approval</p>
          <h3 id="deployment-progress-title">
            {hasRecordedOperation ? 'Recorded activity' : 'Approval status'}
          </h3>
        </div>
        <div className="approved-progress-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              onRefresh();
              generatedRunHistory.reload();
            }}
          >
            Refresh status
          </button>
          <Link className="button button-secondary" to="/history">
            Find this plan later
          </Link>
        </div>
      </div>
      {!hasRecordedOperation ? (
        <div className="approved-next-step" role="status">
          <strong>
            {generatedRunHistory.loading
              ? 'Checking plan status…'
              : 'Approved. No deployment has started.'}
          </strong>
          <p>
            {generatedRunHistory.error
              ? 'Plan status could not be retrieved right now. Refresh this page to try again.'
              : 'DavDeploy has recorded the administrator’s decision. Approval does not start deployment; a generated Terraform plan must be reviewed and approved separately.'}
          </p>
          <p>
            Reopen this record from <Link to="/history">Plan history</Link>. Refresh it later to
            check for updates.
          </p>
        </div>
      ) : null}
      {hasRecordedOperation ? (
        <div className="approved-next-step current-deployment-status" role="status">
          <span className="eyebrow">Current status</span>
          <strong>{nextStep.title}</strong>
          <p>{nextStep.description}</p>
          <p>{nextStep.followUp}</p>
        </div>
      ) : null}
      {hasRecordedOperation ? (
        <details className="deployment-details">
          <summary>View all deployment stages</summary>
          <p className="deployment-progress-help">
            This history shows completed and current stages as well as future stages. “Not started”
            is informational; it does not mean an action is available on this page.
          </p>
          <ol className="deployment-steps" aria-label="Deployment progress">
            <li className="deployment-step is-complete">
              <span className="deployment-step-marker" aria-hidden="true">
                ✓
              </span>
              <div>
                <strong>Administrator approval</strong>
                <span className="deployment-step-status">Complete</span>
                <span>Approved · revision {review.revision}</span>
              </div>
            </li>
            <li
              className={`deployment-step is-${planStepTone}`}
              aria-current={planStepTone === 'in-progress' ? 'step' : undefined}
            >
              <span className="deployment-step-marker" aria-hidden="true">
                2
              </span>
              <div>
                <strong>Terraform plan</strong>
                <span className="deployment-step-status">{stageLabel(planStepTone)}</span>
                <span>{planStatus}</span>
                {generatedRun ? (
                  <span>Nova plan request · revision {generatedRun.revision_number}</span>
                ) : null}
              </div>
            </li>
            <li
              className={`deployment-step is-${applyStepTone}`}
              aria-current={applyStepTone === 'in-progress' ? 'step' : undefined}
            >
              <span className="deployment-step-marker" aria-hidden="true">
                3
              </span>
              <div>
                <strong>Deployment</strong>
                <span className="deployment-step-status">{stageLabel(applyStepTone)}</span>
                <span>{applyStatus}</span>
              </div>
            </li>
            <li
              className={`deployment-step is-${healthStep.tone}`}
              aria-current={healthStep.tone === 'in-progress' ? 'step' : undefined}
            >
              <span className="deployment-step-marker" aria-hidden="true">
                4
              </span>
              <div>
                <strong>Application health</strong>
                <span className="deployment-step-status">{healthStep.label}</span>
                <span>{healthStep.description}</span>
              </div>
            </li>
            <li
              className={`deployment-step is-${teardownStepTone}`}
              aria-current={teardownStepTone === 'in-progress' ? 'step' : undefined}
            >
              <span className="deployment-step-marker" aria-hidden="true">
                5
              </span>
              <div>
                <strong>Teardown</strong>
                <span className="deployment-step-status">{stageLabel(teardownStepTone)}</span>
                <span>{teardownStatus}</span>
              </div>
            </li>
          </ol>
        </details>
      ) : null}
      {hasRecordedOperation && generatedRunHistory.error ? (
        <p className="muted" role="status">
          The latest Nova plan status could not be refreshed. Refresh this page to try again.
        </p>
      ) : null}
    </section>
  );
}

function describeGeneratedPlanRun(state: string): string {
  if (state === 'PREPARING') return 'Nova is preparing the Terraform plan.';
  if (state === 'BUILD_STARTED') return 'Terraform is creating the plan.';
  if (state === 'PLAN_READY_REVIEW_ONLY')
    return 'Terraform plan is ready for review. It has not been applied.';
  if (state === 'RECONCILIATION_REQUIRED')
    return 'Plan status needs confirmation. Contact workspace support for help.';
  if (state === 'FAILED') return 'Plan generation failed. Contact workspace support for help.';
  return 'A Nova plan request exists, but its status is unclear. Contact workspace support for help.';
}

function describeOperationState(state: unknown, phase: 'deployment' | 'teardown'): string {
  if (typeof state !== 'string') return 'An operation record exists; its status is unavailable.';
  if (state === 'SUCCEEDED_AWAITING_OBSERVATION')
    return phase === 'deployment'
      ? 'Apply finished. Application health has not been verified.'
      : 'Destroy finished. Resource absence has not been verified.';
  if (state === 'READY_FOR_OPERATOR_APP_RUNNER_EXECUTION')
    return 'A pilot operation is waiting for an operator.';
  if (state.includes('RECONCILIATION') || state.includes('UNKNOWN'))
    return 'The operation needs its outcome confirmed.';
  if (state.includes('FAIL'))
    return 'The operation failed. Contact workspace support for help investigating it.';
  if (state.includes('RUNNING') || state.includes('PROGRESS') || state.includes('QUEUED'))
    return phase === 'deployment' ? 'Deployment is in progress.' : 'Teardown is in progress.';
  return 'An operation record exists, but its status is unclear. Contact workspace support for help.';
}

type ProgressTone = 'complete' | 'in-progress' | 'not-started' | 'needs-attention' | 'not-verified';

function stageLabel(tone: ProgressTone): string {
  if (tone === 'complete') return 'Complete';
  if (tone === 'in-progress') return 'In progress';
  if (tone === 'needs-attention') return 'Needs attention';
  if (tone === 'not-verified') return 'Not verified';
  return 'Not started';
}

function getPlanStepTone(
  state: string | undefined,
  record: Record<string, unknown> | undefined,
): ProgressTone {
  if (state === 'PREPARING' || state === 'BUILD_STARTED') return 'in-progress';
  if (state === 'PLAN_READY_REVIEW_ONLY') return 'complete';
  if (state === 'FAILED' || state === 'RECONCILIATION_REQUIRED') return 'needs-attention';
  if (state) return 'needs-attention';
  if (!record) return 'not-started';
  if (record.mode === 'LOCAL_CONTRACT_ONLY' || record.state === 'LOCAL_CONTRACT_PLAN_REVIEWED')
    return 'not-started';
  if (record.state === 'AUTHENTICATED_PLAN_REVIEWED') return 'complete';
  return 'needs-attention';
}

function getOperationStepTone(
  operation: Record<string, unknown> | undefined,
  phase: 'deployment' | 'teardown',
): ProgressTone {
  if (!operation) return 'not-started';
  const state = typeof operation.state === 'string' ? operation.state : '';
  if (state === 'READY_FOR_OPERATOR_APP_RUNNER_EXECUTION') return 'needs-attention';
  if (isActiveOperationState(state)) return 'in-progress';
  if (state === 'SUCCEEDED_AWAITING_OBSERVATION')
    return phase === 'deployment' ? 'complete' : 'not-verified';
  return 'needs-attention';
}

function getHealthStep(apply: Record<string, unknown> | undefined): {
  tone: ProgressTone;
  label: string;
  description: string;
} {
  if (!apply) {
    return {
      tone: 'not-started',
      label: 'Not started',
      description: 'A health check can run after a deployment finishes.',
    };
  }
  const state = typeof apply.state === 'string' ? apply.state : '';
  if (isActiveOperationState(state)) {
    return {
      tone: 'not-started',
      label: 'Waiting for deployment',
      description: 'Health is checked only after the deployment operation finishes.',
    };
  }
  if (state === 'SUCCEEDED_AWAITING_OBSERVATION') {
    return {
      tone: 'not-verified',
      label: 'Not verified',
      description: 'No independent health result is attached to this record.',
    };
  }
  return {
    tone: 'needs-attention',
    label: 'Unavailable',
    description: 'Health cannot be confirmed from the current deployment record.',
  };
}

function isActiveOperationState(state: string): boolean {
  return ['QUEUED', 'PENDING', 'STARTED', 'RUNNING', 'IN_PROGRESS', 'PROGRESS'].some((part) =>
    state.includes(part),
  );
}

function describePlanReview(record: Record<string, unknown> | undefined): string {
  if (!record) return 'No Terraform plan is attached to this approval yet.';
  if (record.mode === 'LOCAL_CONTRACT_ONLY' || record.state === 'LOCAL_CONTRACT_PLAN_REVIEWED')
    return 'A local plan contract was recorded. It is not a customer-account Terraform plan.';
  if (record.state === 'AUTHENTICATED_PLAN_REVIEWED')
    return 'A customer-account plan review was recorded. Final costed approval is still required.';
  return 'A plan review record exists, but its status is unclear. Contact workspace support for help.';
}

function describeNextStep(
  apply: Record<string, unknown> | undefined,
  teardown: Record<string, unknown> | undefined,
  generatedPlanState?: string,
): { title: string; description: string; followUp: ReactNode } {
  const applyState = typeof apply?.state === 'string' ? apply.state : '';
  const teardownState = typeof teardown?.state === 'string' ? teardown.state : '';
  if (teardown && isActiveOperationState(teardownState)) {
    return {
      title: 'Teardown in progress',
      description:
        'Resources may still exist while deletion runs. Do not assume teardown is complete yet.',
      followUp: (
        <>
          Refresh this page for updates. The backend must confirm resource absence before this plan
          can be marked deleted. Return to <Link to="/history">Plan history</Link> to reopen it.
        </>
      ),
    };
  }
  if (apply && isActiveOperationState(applyState)) {
    return {
      title: 'Deployment in progress',
      description:
        'The recorded deployment operation is still running. Application health has not been confirmed.',
      followUp: (
        <>
          Refresh this page for updates. Return to <Link to="/history">Plan history</Link> to reopen
          this plan later.
        </>
      ),
    };
  }
  if (applyState === 'READY_FOR_OPERATOR_APP_RUNNER_EXECUTION') {
    return {
      title: 'Deployment is waiting for an operator',
      description:
        'A pilot deployment request is ready, but this customer page cannot start that operation.',
      followUp: (
        <>
          Contact <Link to="/settings">workspace support</Link> for help. Reopen this plan from{' '}
          <Link to="/history">Plan history</Link>.
        </>
      ),
    };
  }
  if (teardownState === 'SUCCEEDED_AWAITING_OBSERVATION') {
    return {
      title: 'Teardown finished; deletion is not confirmed',
      description:
        'The destroy operation ended, but this page has no independent resource-absence result.',
      followUp: (
        <>
          Do not assume all resources are gone. Wait for a verified absence result and refresh this
          page. Return to <Link to="/history">Plan history</Link> to check again.
        </>
      ),
    };
  }
  if (applyState === 'SUCCEEDED_AWAITING_OBSERVATION') {
    return {
      title: 'Apply finished; health is not confirmed',
      description:
        'The infrastructure operation ended, but this page has no independent application-health result.',
      followUp: (
        <>
          Do not treat the application as healthy until health checks pass. Refresh this page for
          backend updates, or return to <Link to="/history">Plan history</Link> later.
        </>
      ),
    };
  }
  if (applyState.includes('FAIL') || teardownState.includes('FAIL')) {
    return {
      title: 'An operation needs attention',
      description:
        'A recorded lifecycle operation failed. This page cannot recover it; contact workspace support for help.',
      followUp: (
        <>
          <Link to="/settings">Contact workspace support</Link>, or reopen this revision from{' '}
          <Link to="/history">Plan history</Link>.
        </>
      ),
    };
  }
  if (generatedPlanState === 'PLAN_READY_REVIEW_ONLY') {
    return {
      title: 'Plan created; costed review is still needed',
      description:
        'The Terraform plan is ready and has not been applied. Cost review and final approval are separate steps.',
      followUp: (
        <>
          This page shows planning status. Costed approval and deployment are not available here
          yet. Return to <Link to="/history">Plan history</Link> to reopen this revision later.
        </>
      ),
    };
  }
  if (generatedPlanState === 'PREPARING' || generatedPlanState === 'BUILD_STARTED') {
    return {
      title: 'Terraform planning is in progress',
      description:
        'Nova and Terraform are preparing a review-only plan. Plan creation does not apply changes or create AWS resources.',
      followUp: (
        <>
          Refresh this page to check again, or return to <Link to="/history">Plan history</Link> and
          reopen this revision later.
        </>
      ),
    };
  }
  if (generatedPlanState === 'FAILED') {
    return {
      title: 'Plan generation failed',
      description:
        'No deployment is reported. Contact workspace support for help investigating the plan failure.',
      followUp: (
        <>
          <Link to="/settings">Contact workspace support</Link>, or return to{' '}
          <Link to="/history">Plan history</Link> to reopen this revision.
        </>
      ),
    };
  }
  if (generatedPlanState === 'RECONCILIATION_REQUIRED') {
    return {
      title: 'Plan status needs confirmation',
      description:
        'DavDeploy cannot yet confirm the outcome of this planning request. Do not start another request until its status is resolved.',
      followUp: (
        <>
          <Link to="/settings">Contact workspace support</Link>, or return to{' '}
          <Link to="/history">Plan history</Link> to check again later.
        </>
      ),
    };
  }
  return {
    title: 'What happens next',
    description:
      'Approval records permission to continue; it does not start a Terraform plan or create AWS resources. This plan cannot yet prepare the costed saved plan needed for deployment.',
    followUp: (
      <>
        Return to <Link to="/history">Plan history</Link> and open this revision to check again.
        Plan, apply, health, and deletion updates appear here only when the backend records them.
      </>
    ),
  };
}
