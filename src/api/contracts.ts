export type Role = 'developer' | 'operator' | 'administrator';
export type PlanState = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SELF_APPROVED';

export interface WorkspaceProfile {
  user: { subject: string; role: Role };
  workspace: { id: string; name: string; organization_id?: string };
}

export interface WorkspaceInvitation {
  id: string;
  email: string;
  role: Role;
  state: 'PENDING' | 'ACCEPTED' | 'CANCELLED' | string;
  delivery_state: 'PENDING' | 'SENT' | 'FAILED' | string;
  delivery_provider?: string | null;
  send_count: number;
  last_sent_at?: string | null;
  expires_at: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  repository_url?: string | null;
  repository_branch?: string | null;
  created_at?: string;
}

export interface PlanSummary {
  id: string;
  plan_id?: string;
  project_id?: string;
  project_name?: string;
  title: string;
  revision: number;
  state: PlanState | string;
  creator_subject?: string;
  created_at: string;
}

export interface AuditEvent {
  id?: string;
  action: string;
  at: string;
  actor_subject?: string;
  actor_role?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface DashboardResponse {
  workspace: { id: string; name: string };
  projects: ProjectSummary[];
  cloud_connections: CloudConnection[];
  plans: PlanSummary[];
  recent_activity?: AuditEvent[];
}

export interface GitHubInstallation {
  id: string;
  account_login: string;
  account_type: string;
}

export interface GitHubInstallationState {
  installation_id: string;
  state: string;
  account_login?: string;
  repository_selection?: string;
  last_event?: { event?: string; action?: string };
}

export interface GitHubConnection {
  execution: 'SIMULATED' | 'LIVE' | string;
  installations: GitHubInstallation[];
  install_url?: string | null;
  webhooks_enabled?: boolean;
  installation_states?: GitHubInstallationState[];
  recent_webhook_deliveries?: Array<Record<string, unknown>>;
}

export interface GitHubRepository {
  full_name: string;
  html_url: string;
  default_branch: string;
}

export interface CloudConnection {
  id: string;
  display_name: string;
  provider: string;
  account_id?: string | null;
  role_arn?: string | null;
  setup_state: string;
  authorized_regions?: string[];
  capabilities?: string[];
  verified_at?: string | null;
  deployment_permission?: string;
}

export interface ArchitectureComponent {
  name: string;
  service: string;
  purpose: string;
}

export interface PlanContent {
  summary: {
    selected_profile: string;
    why: string;
    status?: string;
  };
  application_analysis?: Record<string, unknown>;
  target?: Record<string, unknown>;
  resource_breakdown: ArchitectureComponent[];
  security: string[];
  observability?: Record<string, unknown>;
  cost_estimate?: Record<string, unknown> & {
    monthly_low?: number;
    monthly_high?: number;
    assumptions?: string[];
  };
  deployment_strategy?: Record<string, unknown>;
  risks_and_limitations?: string[];
  policy_findings?: unknown;
  [key: string]: unknown;
}

export interface CustomerPlanRevision {
  id: string;
  plan_id: string;
  project_id?: string;
  revision: number;
  state: PlanState | string;
  title?: string;
  creator_subject: string;
  content_digest: string;
  content: PlanContent;
  review_summary?: Record<string, unknown>;
  decision?: Record<string, unknown> | null;
  local_executions?: Array<Record<string, unknown>>;
  desired_state_publications?: Array<Record<string, unknown>>;
  terraform_plan_renders?: Array<Record<string, unknown>>;
  cloud_readiness_preflights?: Array<Record<string, unknown>>;
  terraform_plan_reviews?: Array<Record<string, unknown>>;
  cloud_execution_runs?: Array<Record<string, unknown>>;
  created_at?: string;
}

export interface PlanGenerationResult {
  id: string;
  plan_hash?: string;
  selected_architecture: {
    profile: string;
    components: ArchitectureComponent[];
    cost_estimate?: { monthly_low?: number; monthly_high?: number };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface WorkspaceMember {
  subject: string;
  email?: string;
  role: Role;
  state?: string;
}

export interface UsageSummary {
  [key: string]: unknown;
}

export interface Subscription {
  plan_name?: string;
  state?: string;
  limits?: Record<string, number>;
  [key: string]: unknown;
}
