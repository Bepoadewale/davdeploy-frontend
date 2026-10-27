import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { newIdempotencyKey } from '../api/client';
import type {
  CloudConnection,
  CustomerPlanRevision,
  GitHubConnection,
  GitHubRepository,
  PlanGenerationResult,
  ProjectSummary,
} from '../api/contracts';
import { AsyncRegion } from '../components/AsyncRegion';
import { StatusBadge } from '../components/StatusBadge';
import { ProductVisual } from '../components/ProductVisual';
import { useAsync } from '../hooks/useAsync';

interface FormState {
  repository: string;
  publicRepository: string;
  projectName: string;
  branch: string;
  cloudConnectionId: string;
  region: string;
  dataClassification: string;
  budget: string;
  environment: string;
  availability: string;
  workload: string;
  averageRps: string;
  peakMultiplier: string;
  prompt: string;
}

interface PlanningFeedback {
  title: string;
  message: string;
  technicalDetail?: string;
}

const initialForm: FormState = {
  repository: '',
  publicRepository: '',
  projectName: '',
  branch: '',
  cloudConnectionId: '',
  region: 'us-east-1',
  dataClassification: 'restricted',
  budget: '500',
  environment: 'production',
  availability: '99.9%',
  workload: 'AI API',
  averageRps: '5',
  peakMultiplier: '4',
  prompt:
    'Deploy this product in the cloud. Keep customer data private. Enable monitoring and operational alerts.',
};

function explainPlanningFailure(reason: unknown, budget: string): PlanningFeedback {
  const technicalDetail = reason instanceof Error ? reason.message : 'Plan generation failed.';
  if (technicalDetail.includes('no viable architecture')) {
    if (technicalDetail.includes('hard monthly budget')) {
      const nextBudget = Number(budget) < 250 ? '$250 or more' : 'a higher budget';
      return {
        title: 'This plan needs a larger budget.',
        message: `The workload and required monitoring do not fit within the $${budget}/month limit. Choose ${nextBudget}, then try again.`,
        technicalDetail,
      };
    }
    return {
      title: 'These choices do not fit together yet.',
      message: 'Adjust the workload, reliability target, or budget, then create the plan again.',
      technicalDetail,
    };
  }
  return {
    title: 'We could not create this plan.',
    message: 'Check the information above and try again.',
    technicalDetail,
  };
}

export default function NewPlanPage() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [repositorySource, setRepositorySource] = useState<'authorized' | 'public'>('authorized');
  const [publicRepository, setPublicRepository] = useState<GitHubRepository | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<PlanningFeedback | null>(null);
  const state = useAsync(
    async (signal) => ({
      github: await api.request<GitHubConnection>('/api/v1/github/connection', { signal }),
      cloud: await api.request<CloudConnection[]>('/api/v1/cloud-connections', { signal }),
    }),
    [api],
  );
  const installation = state.data?.github.installations[0];

  useEffect(() => {
    if (!installation) return;
    const controller = new AbortController();
    api
      .request<GitHubRepository[]>(
        `/api/v1/github/installations/${encodeURIComponent(installation.id)}/repositories`,
        { signal: controller.signal },
      )
      .then((items) => {
        setRepositories(items);
        if (items[0])
          setForm((current) => ({
            ...current,
            repository: current.repository || items[0].html_url,
            branch: current.branch || items[0].default_branch,
          }));
      })
      .catch((reason: unknown) =>
        setError({
          title: 'Repository discovery failed.',
          message: 'Check the repository connection and try again.',
          technicalDetail: reason instanceof Error ? reason.message : undefined,
        }),
      );
    return () => controller.abort();
  }, [api, installation]);

  const repository = useMemo(
    () => repositories.find((item) => item.html_url === form.repository),
    [form.repository, repositories],
  );
  useEffect(() => {
    if (!installation || !repository) return;
    const controller = new AbortController();
    const encoded = repository.full_name.split('/').map(encodeURIComponent).join('/');
    api
      .request<{ branches: string[] }>(
        `/api/v1/github/installations/${encodeURIComponent(installation.id)}/repositories/${encoded}/branches`,
        { signal: controller.signal },
      )
      .then((result) => {
        setBranches(result.branches);
        setForm((current) => ({
          ...current,
          branch: result.branches.includes(current.branch)
            ? current.branch
            : repository.default_branch || result.branches[0] || '',
        }));
      })
      .catch((reason: unknown) =>
        setError({
          title: 'Branch discovery failed.',
          message: 'Choose another repository or branch, then try again.',
          technicalDetail: reason instanceof Error ? reason.message : undefined,
        }),
      );
    return () => controller.abort();
  }, [api, installation, repository]);

  const update = (field: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function inspectPublicRepository() {
    setBusy(true);
    setError(null);
    setPublicRepository(null);
    try {
      const result = await api.request<GitHubRepository & { branches: string[] }>(
        `/api/v1/github/public-repository?repository_url=${encodeURIComponent(form.publicRepository.trim())}`,
      );
      setPublicRepository(result);
      setBranches(result.branches);
      setForm((current) => ({ ...current, branch: result.default_branch }));
    } catch (reason) {
      setError({
        title: 'Repository check failed.',
        message: 'Check the public GitHub URL and try again.',
        technicalDetail: reason instanceof Error ? reason.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const selectedRepository =
        repositorySource === 'public' ? publicRepository?.html_url : form.repository;
      if (!selectedRepository || !form.branch)
        throw new Error('Choose an authorized repository and branch.');
      if (form.prompt.trim().length < 20)
        throw new Error('Describe the intended outcome in at least 20 characters.');
      const averageRps = Number(form.averageRps);
      const peakRps = averageRps * Number(form.peakMultiplier);
      if (!averageRps || !peakRps)
        throw new Error('Choose the expected traffic level and peak pattern.');
      setProgress('Creating tenant-scoped project…');
      const project = await api.request<ProjectSummary>('/api/v1/projects', {
        method: 'POST',
        retrySafe: false,
        body: {
          name: form.projectName.trim(),
          repository_url: selectedRepository,
          repository_branch: form.branch,
        },
      });
      setProgress('Collecting repository evidence…');
      await api.request(`/api/v1/projects/${project.id}/repository-discovery`);
      setProgress('Interpreting constraints…');
      const constraints = `\n\nExplicit constraints: region=${form.region}; data=${form.dataClassification}; monthly budget USD=${form.budget}; environments=${form.environment}; availability=${form.availability}; workload=${form.workload}; average_rps=${averageRps}; peak_rps=${peakRps}.`;
      const intent = await api.request<{ id: string }>('/api/v1/intents', {
        method: 'POST',
        retrySafe: false,
        idempotencyKey: newIdempotencyKey(),
        body: {
          project_id: project.id,
          prompt: `${form.prompt.trim()}${constraints}`,
          source_repository: selectedRepository,
          cloud_connection_id: form.cloudConnectionId || null,
          idempotency_key: newIdempotencyKey(),
        },
      });
      setProgress('Comparing minimum-necessary architectures…');
      const plan = await api.request<PlanGenerationResult>(`/api/v1/intents/${intent.id}/plans`, {
        method: 'POST',
        retrySafe: false,
      });
      setProgress('Creating immutable customer review…');
      const review = await api.request<CustomerPlanRevision>(
        `/api/v1/deployment-plans/${plan.id}/customer-review`,
        { method: 'POST', retrySafe: false },
      );
      navigate(`/plans/${review.id}`);
    } catch (reason) {
      setError(explainPlanningFailure(reason, form.budget));
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  return (
    <div className="page narrow-page">
      <div className="page-heading visual-page-heading">
        <div>
          <p className="eyebrow">New infrastructure plan</p>
          <h1>Start with the outcome.</h1>
          <p>Describe the outcome. Review the architecture before anything changes.</p>
        </div>
        <ProductVisual kind="plan" />
        <span className="mode-pill">
          <i /> Plan before change
        </span>
      </div>
      <AsyncRegion
        loading={state.loading}
        error={state.error}
        onRetry={state.reload}
        label="planning connections"
      >
        {state.data ? (
          <form className="planning-form" onSubmit={(event) => void submit(event)}>
            <section className="panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">01 · Evidence</p>
                  <h2>Source and target</h2>
                </div>
                {state.data.github.execution ? (
                  <StatusBadge state={state.data.github.execution} />
                ) : null}
              </div>
              <div className="repository-source-switch" aria-label="Repository access method">
                <button
                  type="button"
                  className={repositorySource === 'authorized' ? 'is-active' : ''}
                  aria-pressed={repositorySource === 'authorized'}
                  onClick={() => {
                    setRepositorySource('authorized');
                    setBranches(repository ? [repository.default_branch] : []);
                    setForm((current) => ({
                      ...current,
                      branch: repository?.default_branch ?? '',
                    }));
                  }}
                >
                  Connected repositories
                </button>
                <button
                  type="button"
                  className={repositorySource === 'public' ? 'is-active' : ''}
                  aria-pressed={repositorySource === 'public'}
                  onClick={() => {
                    setRepositorySource('public');
                    setBranches(publicRepository ? [publicRepository.default_branch] : []);
                    setForm((current) => ({
                      ...current,
                      branch: publicRepository?.default_branch ?? '',
                    }));
                  }}
                >
                  Public GitHub URL
                </button>
              </div>
              <div className="form-grid two">
                <div className="form-field">
                  <label htmlFor="project-name">Project name</label>
                  <input
                    id="project-name"
                    value={form.projectName}
                    onChange={(event) => update('projectName', event.target.value)}
                    placeholder="French Pattern Cramming"
                    minLength={3}
                    maxLength={64}
                    pattern="[A-Za-z0-9][A-Za-z0-9 .,'()&-]{2,63}"
                    aria-describedby="project-name-help"
                    required
                  />
                  <small id="project-name-help">Use a name your team will recognise.</small>
                </div>
                {repositorySource === 'authorized' ? (
                  <label>
                    GitHub repository
                    <select
                      value={form.repository}
                      onChange={(event) => update('repository', event.target.value)}
                      required
                    >
                      <option value="">Choose repository</option>
                      {repositories.map((item) => (
                        <option value={item.html_url} key={item.full_name}>
                          {item.full_name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="form-field">
                    <label htmlFor="public-repository-url">Public GitHub repository</label>
                    <span className="repository-url-control">
                      <input
                        id="public-repository-url"
                        type="url"
                        value={form.publicRepository}
                        onChange={(event) => {
                          update('publicRepository', event.target.value);
                          setPublicRepository(null);
                          setBranches([]);
                          update('branch', '');
                        }}
                        placeholder="https://github.com/owner/repository"
                        required
                      />
                      <button
                        className="button button-secondary"
                        type="button"
                        disabled={busy || !form.publicRepository.trim()}
                        onClick={() => void inspectPublicRepository()}
                      >
                        Check repository
                      </button>
                    </span>
                    <small>
                      {publicRepository
                        ? `${publicRepository.full_name} verified read-only`
                        : 'Only public metadata and bounded manifest files are read.'}
                    </small>
                  </div>
                )}
                <label>
                  Branch
                  <select
                    value={form.branch}
                    onChange={(event) => update('branch', event.target.value)}
                    required
                  >
                    <option value="">Choose branch</option>
                    {branches.map((branch) => (
                      <option key={branch}>{branch}</option>
                    ))}
                  </select>
                </label>
                <label className="span-two">
                  Cloud target
                  <select
                    value={form.cloudConnectionId}
                    onChange={(event) => update('cloudConnectionId', event.target.value)}
                  >
                    <option value="">Local planning only · no cloud account</option>
                    {state.data.cloud.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.display_name} · {item.setup_state}
                      </option>
                    ))}
                  </select>
                  <small>
                    A connected account is optional. Credentials never enter the browser.
                  </small>
                </label>
              </div>
            </section>
            <section className="panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">02 · Customer intent</p>
                  <h2>What should davdeploy build?</h2>
                </div>
              </div>
              <label>
                Desired outcome
                <textarea
                  rows={7}
                  value={form.prompt}
                  onChange={(event) => update('prompt', event.target.value)}
                  required
                />
              </label>
              <section
                className="planning-requirements"
                aria-labelledby="planning-requirements-heading"
              >
                <div className="section-heading compact-section-heading">
                  <div>
                    <p className="eyebrow">Required planning inputs</p>
                    <h3 id="planning-requirements-heading">Choose the closest fit</h3>
                    <small>Estimates are enough. DavDeploy uses them to avoid overbuilding.</small>
                  </div>
                </div>
                <div className="form-grid three">
                  <label>
                    Region
                    <select
                      value={form.region}
                      onChange={(event) => update('region', event.target.value)}
                      required
                    >
                      <option value="us-east-1">US East, N. Virginia</option>
                      <option value="eu-west-1">Europe, Ireland</option>
                    </select>
                  </label>
                  <label>
                    Data sensitivity
                    <select
                      value={form.dataClassification}
                      onChange={(event) => update('dataClassification', event.target.value)}
                      required
                    >
                      <option value="restricted">Customer or sensitive data</option>
                      <option value="internal">Company-internal data</option>
                      <option value="public">Public data only</option>
                    </select>
                  </label>
                  <label>
                    Monthly budget
                    <select
                      value={form.budget}
                      onChange={(event) => update('budget', event.target.value)}
                      required
                    >
                      <option value="100">Lean start, up to $100</option>
                      <option value="250">Small production, up to $250</option>
                      <option value="500">Growing product, up to $500</option>
                      <option value="1000">Established product, up to $1,000</option>
                      <option value="2500">Larger operation, up to $2,500</option>
                      <option value="5000">Scale budget, up to $5,000</option>
                    </select>
                  </label>
                  <label>
                    Environments
                    <select
                      value={form.environment}
                      onChange={(event) => update('environment', event.target.value)}
                      required
                    >
                      <option value="production">Production only</option>
                      <option value="staging,production">Staging and production</option>
                    </select>
                  </label>
                  <label>
                    Reliability target
                    <select
                      value={form.availability}
                      onChange={(event) => update('availability', event.target.value)}
                      required
                    >
                      <option value="99.5%">Cost-first, occasional downtime is acceptable</option>
                      <option value="99.9%">Standard production, recommended</option>
                      <option value="99.95%">Business-critical</option>
                      <option value="99.99%">Mission-critical</option>
                    </select>
                  </label>
                  <label>
                    Product type
                    <select
                      value={form.workload}
                      onChange={(event) => update('workload', event.target.value)}
                      required
                    >
                      <option value="AI API">AI or model-powered API</option>
                      <option value="Web API">Web or mobile API</option>
                      <option value="Web application">Customer-facing web application</option>
                      <option value="Background worker">Background jobs or automation</option>
                      <option value="Data pipeline">Data processing pipeline</option>
                    </select>
                  </label>
                  <label>
                    Expected usage
                    <select
                      value={form.averageRps}
                      onChange={(event) => update('averageRps', event.target.value)}
                      required
                    >
                      <option value="1">Pilot or internal use</option>
                      <option value="5">Early product, recommended if unsure</option>
                      <option value="20">Growing product</option>
                      <option value="100">Busy product</option>
                      <option value="500">Large-scale product</option>
                    </select>
                    <small>No traffic forecast is required. Choose the closest stage.</small>
                  </label>
                  <label>
                    Peak pattern
                    <select
                      value={form.peakMultiplier}
                      onChange={(event) => update('peakMultiplier', event.target.value)}
                      required
                    >
                      <option value="2">Mostly steady traffic</option>
                      <option value="4">Normal daily bursts, recommended</option>
                      <option value="8">Campaigns or sharp spikes</option>
                      <option value="12">Highly unpredictable traffic</option>
                    </select>
                    <small>DavDeploy converts this into safe capacity assumptions.</small>
                  </label>
                </div>
              </section>
            </section>
            {error ? (
              <div className="notice notice-error" role="alert">
                <div>
                  <strong>{error.title}</strong>
                  <p>{error.message}</p>
                  {error.technicalDetail ? (
                    <details className="planning-error-detail">
                      <summary>Technical details</summary>
                      <p>{error.technicalDetail}</p>
                    </details>
                  ) : null}
                </div>
              </div>
            ) : null}
            {progress ? (
              <div className="notice" role="status">
                <span className="spinner" />
                {progress}
              </div>
            ) : null}
            <div className="form-actions">
              <button className="button button-primary" type="submit" disabled={busy}>
                {busy ? 'Building review…' : 'Analyze and create plan'}
              </button>
              <span>Creates a draft review record. No cloud resources are created.</span>
            </div>
          </form>
        ) : null}
      </AsyncRegion>
    </div>
  );
}
