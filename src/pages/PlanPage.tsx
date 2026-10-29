import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { CustomerPlanRevision } from '../api/contracts';
import { AsyncRegion } from '../components/AsyncRegion';
import { ReadableData, RawData } from '../components/ReadableData';
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
  raw,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  value: unknown;
  raw?: boolean;
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
          {raw ? <RawData value={value} /> : null}
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
    downloadJson(`davdeploy-plan-${review.id}.json`, {
      exported_at: new Date().toISOString(),
      export_type: 'plan-review-evidence',
      revision: review,
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

  const latest = <T,>(items?: T[]) => items?.[0] as T | undefined;
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
                {review.state === 'APPROVED'
                  ? 'Approved, not deployed.'
                  : 'This is a review record, not a deployment.'}
              </strong>
              <span>
                Infrastructure exists only when the backend reports independently observed
                execution.
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
                <div className="monitoring">
                  <b>Prometheus + Grafana</b>
                  <small>Metrics and dashboards</small>
                </div>
              </div>
            </section>
            <div className="review-grid">
              <PlanDetail
                eyebrow="Application evidence"
                title="Interpreted requirements"
                summary="Repository, workload, and constraints used for this plan."
                value={review.content.application_analysis}
                raw
              />
              <PlanDetail
                eyebrow="Cost"
                title="Estimated range and assumptions"
                summary="A planning estimate, not an AWS bill."
                value={review.content.cost_estimate}
                raw
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
                  <h2>Available next action</h2>
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
                  <ApprovedActions
                    review={review}
                    admin={admin}
                    busy={busy}
                    mutate={mutate}
                    latest={latest}
                  />
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
            <PlanDetail
              eyebrow="Evidence inventory"
              title="Generated and observed records"
              summary="Open this when you need the detailed audit inventory."
              value={{
                desired_state_publications: review.desired_state_publications ?? [],
                terraform_plan_renders: review.terraform_plan_renders ?? [],
                cloud_readiness_preflights: review.cloud_readiness_preflights ?? [],
                terraform_plan_reviews: review.terraform_plan_reviews ?? [],
                cloud_execution_runs: review.cloud_execution_runs ?? [],
                local_executions: review.local_executions ?? [],
              }}
            />
          </>
        ) : null}
      </AsyncRegion>
    </div>
  );
}

function ApprovedActions({
  review,
  admin,
  busy,
  mutate,
  latest,
}: {
  review: CustomerPlanRevision;
  admin: boolean;
  busy: boolean;
  mutate: (path: string, body?: MutationBody, success?: string) => Promise<void>;
  latest: <T>(items?: T[]) => T | undefined;
}) {
  const render = latest<Record<string, unknown>>(review.terraform_plan_renders);
  const preflight = latest<Record<string, unknown>>(review.cloud_readiness_preflights);
  const planReview = latest<Record<string, unknown>>(review.terraform_plan_reviews);
  const authenticatedPlanReview = review.terraform_plan_reviews?.find(
    (item) => item.state === 'AUTHENTICATED_PLAN_REVIEWED',
  );
  const authenticatedDestroyReview = review.terraform_plan_reviews?.find(
    (item) => item.state === 'AUTHENTICATED_DESTROY_PLAN_REVIEWED',
  );
  const latestCloudRun = latest<Record<string, unknown>>(review.cloud_execution_runs);
  const applySucceeded = review.cloud_execution_runs?.some(
    (item) =>
      item.mode === 'AUTHENTICATED_APP_RUNNER_APPLY' &&
      item.state === 'SUCCEEDED_AWAITING_OBSERVATION',
  );
  const target = review.content.target ?? {};
  const region = typeof target.region === 'string' ? target.region : 'us-east-1';
  const accountId = typeof target.account_id === 'string' ? target.account_id : undefined;
  return (
    <div className="approved-actions">
      <div className="notice">
        <strong>01 · Local evidence only</strong>
        <span>
          These create fixture evidence. They do not contact or deploy to a cloud account.
        </span>
      </div>
      <button
        className="button button-secondary"
        disabled={busy}
        type="button"
        onClick={() =>
          void mutate(
            `/api/v1/customer-plan-revisions/${review.id}/execute-dry-run`,
            undefined,
            'Local dry-run queued. Refresh to inspect observed state.',
          )
        }
      >
        Queue local dry-run
      </button>
      <button
        className="button button-secondary"
        disabled={busy}
        type="button"
        onClick={() =>
          void mutate(
            `/api/v1/customer-plan-revisions/${review.id}/desired-state-publications`,
            { content_digest: review.content_digest },
            'Desired-state publication recorded; human review remains required.',
          )
        }
      >
        Record desired-state review
      </button>
      <button
        className="button button-secondary"
        disabled={busy}
        type="button"
        onClick={() =>
          void mutate(
            `/api/v1/customer-plan-revisions/${review.id}/terraform-plan-renders`,
            { content_digest: review.content_digest },
            'Plan-only Terraform contract recorded. Nothing was applied.',
          )
        }
      >
        Generate plan-only contract
      </button>
      {admin ? (
        <>
          <p className="execution-stage-label">
            02 · Pilot preparation: no customer resources change
          </p>
          <button
            className="button button-secondary"
            disabled={busy}
            type="button"
            onClick={() =>
              void mutate(
                `/api/v1/customer-plan-revisions/${review.id}/cloud-readiness-preflights`,
                {
                  content_digest: review.content_digest,
                  allowed_regions: ['us-east-1'],
                  required_tags: {},
                  execution_mode: 'DRY_RUN_ONLY',
                  require_reviewed_pr: false,
                  runtime_identity_configured: false,
                },
                'Readiness preflight recorded. No provider call occurred.',
              )
            }
          >
            Run local readiness preflight
          </button>
          <button
            className="button button-secondary"
            disabled={busy || !preflight}
            type="button"
            onClick={() =>
              void mutate(
                `/api/v1/customer-plan-revisions/${review.id}/terraform-plan-reviews`,
                {
                  content_digest: review.content_digest,
                  preflight_id: preflight?.id ?? null,
                  expected_region: 'us-east-1',
                  mode: 'LOCAL_CONTRACT_ONLY',
                  allow_cloud_plan: false,
                },
                'Plan-only review recorded. Apply remains unavailable.',
              )
            }
          >
            Record local plan-only review
          </button>
          <button
            className="button button-secondary"
            disabled={busy || !render || !preflight || !planReview}
            type="button"
            onClick={() =>
              void mutate(
                `/api/v1/customer-plan-revisions/${review.id}/cloud-execution-runs`,
                {
                  content_digest: review.content_digest,
                  terraform_render_id: render?.id ?? null,
                  preflight_id: preflight?.id ?? null,
                  terraform_plan_review_id: planReview?.id ?? null,
                  expected_region: 'us-east-1',
                  mode: 'GUARDED_CLOUD_EXECUTION',
                  confirmation: null,
                },
                'Guarded run request recorded. The backend did not execute cloud changes.',
              )
            }
          >
            Record guarded-run request
          </button>
          <div className="notice execution-pilot-notice">
            <strong>03 · Separately authorised customer pilot</strong>
            <span>
              This path is available only for a verified connection and an enabled operator runtime.
              A saved cloud plan still needs review before any apply or destroy.
            </span>
          </div>
          <button
            className="button button-secondary"
            disabled={busy}
            type="button"
            onClick={() =>
              void mutate(
                `/api/v1/customer-plan-revisions/${review.id}/cloud-readiness-preflights`,
                {
                  content_digest: review.content_digest,
                  expected_account_id: accountId,
                  allowed_regions: [region],
                  required_tags: { ManagedBy: 'davdeploy' },
                  execution_mode: 'PLAN_ONLY',
                  require_reviewed_pr: false,
                  runtime_identity_configured: true,
                },
                'Cloud readiness recorded. The next step creates a real plan only.',
              )
            }
          >
            Check customer-pilot readiness
          </button>
          <button
            className="button button-primary"
            disabled={busy || !render || !preflight || !applySucceeded}
            type="button"
            onClick={() =>
              void mutate(
                `/api/v1/customer-plan-revisions/${review.id}/terraform-plan-reviews`,
                {
                  content_digest: review.content_digest,
                  preflight_id: preflight?.id ?? null,
                  expected_account_id: accountId,
                  expected_region: region,
                  mode: 'AUTHENTICATED_TERRAFORM_PLAN',
                  allow_cloud_plan: true,
                },
                'Authenticated Terraform plan submitted. Review its saved artifact before applying.',
              )
            }
          >
            Create reviewed cloud plan
          </button>
          <button
            className="button button-primary"
            disabled={busy || !render || !preflight || !authenticatedPlanReview}
            type="button"
            onClick={() => {
              const confirmation = window.prompt(
                'Type EXECUTE_APP_RUNNER_WORKLOAD to queue the reviewed plan.',
              );
              if (confirmation !== 'EXECUTE_APP_RUNNER_WORKLOAD') return;
              void mutate(
                `/api/v1/customer-plan-revisions/${review.id}/cloud-execution-runs`,
                {
                  content_digest: review.content_digest,
                  terraform_render_id: render?.id ?? null,
                  preflight_id: preflight?.id ?? null,
                  terraform_plan_review_id: authenticatedPlanReview?.id ?? null,
                  expected_account_id: accountId,
                  expected_region: region,
                  mode: 'AUTHENTICATED_APP_RUNNER_APPLY',
                  confirmation,
                },
                'Reviewed deployment request created. Queue it as the next explicit step.',
              );
            }}
          >
            Create reviewed deployment request
          </button>
          <button
            className="button button-primary"
            disabled={busy || latestCloudRun?.state !== 'READY_FOR_OPERATOR_APP_RUNNER_EXECUTION'}
            type="button"
            onClick={() => {
              const confirmation = window.prompt(
                'Type EXECUTE_APP_RUNNER_WORKLOAD to queue the reviewed deployment.',
              );
              if (confirmation !== 'EXECUTE_APP_RUNNER_WORKLOAD') return;
              void mutate(
                `/api/v1/cloud-execution-runs/${latestCloudRun?.id}/execute`,
                { content_digest: review.content_digest, confirmation },
                'Deployment queued. Refresh to inspect trusted runner evidence.',
              );
            }}
          >
            Apply reviewed deployment
          </button>
          <button
            className="button button-danger"
            disabled={busy || !render || !preflight}
            type="button"
            onClick={() =>
              void mutate(
                `/api/v1/customer-plan-revisions/${review.id}/terraform-plan-reviews`,
                {
                  content_digest: review.content_digest,
                  preflight_id: preflight?.id ?? null,
                  expected_account_id: accountId,
                  expected_region: region,
                  mode: 'AUTHENTICATED_TERRAFORM_DESTROY_PLAN',
                  allow_cloud_plan: true,
                },
                'Terraform destroy plan submitted. It is still review-only.',
              )
            }
          >
            Create reviewed destroy plan
          </button>
          <button
            className="button button-danger"
            disabled={
              busy || !render || !preflight || !authenticatedDestroyReview || !applySucceeded
            }
            type="button"
            onClick={() => {
              const confirmation = window.prompt(
                'Type DESTROY_APP_RUNNER_WORKLOAD to create the exact teardown request.',
              );
              if (confirmation !== 'DESTROY_APP_RUNNER_WORKLOAD') return;
              void mutate(
                `/api/v1/customer-plan-revisions/${review.id}/cloud-execution-runs`,
                {
                  content_digest: review.content_digest,
                  terraform_render_id: render?.id ?? null,
                  preflight_id: preflight?.id ?? null,
                  terraform_plan_review_id: authenticatedDestroyReview?.id ?? null,
                  expected_account_id: accountId,
                  expected_region: region,
                  mode: 'AUTHENTICATED_APP_RUNNER_DESTROY',
                  confirmation,
                },
                'Reviewed teardown request created. Queue it only after final review.',
              );
            }}
          >
            Create reviewed teardown request
          </button>
        </>
      ) : null}
    </div>
  );
}
