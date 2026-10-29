export type ProjectKind = "internal" | "customer" | "project";

export type ProjectStatus = "live" | "beta" | "development" | "paused" | "archived";

export type AssetType = "link" | "repo" | "hosting" | "database" | "account" | "secret";

export type AssetEnvironment = "production" | "staging" | "development";

export type Customer = {
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  companyWebsite: string | null;
};

export type Project = {
  id: string;
  kind: ProjectKind;
  name: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  primaryUrl: string | null;
  icon: string | null;
  accent: string | null;
  tags: string[];
  notes: string;
  customer: Customer | null;
  isFavorite: boolean;
  assetCount: number;
  secretCount: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
};

export type Asset = {
  id: string;
  projectId: string;
  type: AssetType;
  subtype: string | null;
  label: string;
  url: string | null;
  provider: string | null;
  environment: AssetEnvironment | null;
  username: string | null;
  hasSecret: boolean;
  details: string;
  notes: string;
  sortOrder: number;
  updatedAt: string;
  updatedBy: string | null;
};

export type ProjectDetail = {
  project: Project;
  assets: Asset[];
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  lastLoginAt: string | null;
};

export type LoginResponse = {
  token: string;
  expiresAt: string;
  user: User;
};

export type OverviewCounts = {
  internal: number;
  customers: number;
  projects: number;
  assets: number;
  secrets: number;
  favorites: number;
  repositories: number;
  hostings: number;
  databases: number;
  accounts: number;
};

export type Activity = {
  action: string;
  summary: string | null;
  userEmail: string | null;
  createdAt: string;
};

export type Overview = {
  counts: OverviewCounts;
  recentProjects: Project[];
  favorites: Project[];
  recentActivity: Activity[];
};

export type SearchResults = {
  projects: Project[];
  assets: { asset: Asset; project: Project }[];
};

export type Health = {
  status: "ok" | "degraded";
  database: "connected" | "error";
  schemaVersion?: number | null;
  projects?: number;
  environment?: string;
  message?: string;
  serverTimeUtc: string;
};

export type SecretReveal = {
  secret: string;
  label: string;
};

export type ProjectInput = {
  kind: ProjectKind;
  name: string;
  description: string;
  status: ProjectStatus;
  primaryUrl: string;
  icon: string;
  accent: string;
  tags: string[];
  notes: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyWebsite: string;
};

export type AssetInput = {
  type: AssetType;
  subtype: string;
  label: string;
  url: string;
  provider: string;
  environment: string;
  username: string;
  secret: string;
  details: string;
  notes: string;
  clearSecret?: boolean;
  sortOrder?: number;
};

// ---------------------------------------------------------------------------
// AI Operations
// ---------------------------------------------------------------------------

export type AgentPermissions = {
  readEmails: boolean;
  analyzeAttachments: boolean;
  readCrm: boolean;
  createDrafts: boolean;
  writeCrm: boolean;
  requiresApproval: boolean;
  sendNotifications: boolean;
};

export type AgentMonthStats = {
  runs: number;
  failedRuns: number;
  inputTokens: number;
  outputTokens: number;
  costEur: number;
  lastRunAt?: string | null;
};

export type Agent = {
  id: string;
  name: string;
  description: string;
  model: string;
  isEnabled: boolean;
  triggerType: string;
  allowedTools: string[];
  permissions: AgentPermissions;
  promptVersion: number;
  maxOutputTokens: number;
  timeoutSeconds: number;
  monthlyBudgetEur?: number | null;
  month: AgentMonthStats;
  updatedAt: string;
  updatedBy?: string | null;
};

export type AgentPrompt = {
  version: number;
  systemPrompt: string;
  changeNote?: string | null;
  createdAt: string;
  createdBy?: string | null;
};

export type AgentRunStatus = "running" | "succeeded" | "invalid_output" | "failed" | "blocked" | "abandoned";

export type AgentRun = {
  id: string;
  agentId: string;
  promptVersion: number;
  provider: string;
  model: string;
  status: AgentRunStatus;
  isDryRun: boolean;
  jobId?: string | null;
  workflowId?: string | null;
  inputSummary?: string | null;
  outputJson?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  costEur?: number | null;
  durationMs?: number | null;
  error?: string | null;
  startedAt: string;
  completedAt?: string | null;
};

export type AgentDetail = { agent: Agent; prompts: AgentPrompt[]; recentRuns: AgentRun[] };

export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "dead" | "cancelled";

export type AiJob = {
  id: string;
  type: string;
  status: JobStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  runAfter: string;
  workflowId?: string | null;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
};

export type AiSettings = {
  globalMonthlyBudgetEur: number;
  processingEnabled: boolean;
  provider: string;
  isDryRun: boolean;
};

export type BudgetStatus = {
  month: string;
  budgetEur: number;
  spentEur: number;
  reservedEur: number;
  remainingEur: number;
  isExhausted: boolean;
};

export type AiOverview = {
  settings: AiSettings;
  budget: BudgetStatus;
  agents: Agent[];
  jobs: Record<JobStatus, number>;
  recentRuns: AgentRun[];
  recentFailures: AgentRun[];
  pendingApprovals: number;
};

export type CostAgent = {
  agentId: string;
  model: string;
  actualEur: number;
  reservedEur: number;
  adjustmentEur: number;
  totalEur: number;
  inputTokens: number;
  outputTokens: number;
  monthlyBudgetEur?: number | null;
};

export type CostReport = {
  budget: BudgetStatus;
  agents: CostAgent[];
  daily: { day: string; amountEur: number }[];
};

export type AgentUpdateInput = {
  isEnabled?: boolean;
  model?: string;
  monthlyBudgetEur?: number | null;
  clearMonthlyBudget?: boolean;
  maxOutputTokens?: number;
  timeoutSeconds?: number;
  permissions?: AgentPermissions;
};

export type AiSettingsInput = { globalMonthlyBudgetEur?: number; processingEnabled?: boolean };
