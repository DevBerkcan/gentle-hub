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
  credentials: number;
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
  credentials?: Credential[];
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
// Password vault
// ---------------------------------------------------------------------------

export type CredentialCategory = "email" | "hosting" | "domain" | "website" | "software" | "other";

export type Credential = {
  id: string;
  category: CredentialCategory;
  label: string;
  url: string | null;
  username: string | null;
  provider: string | null;
  hasPassword: boolean;
  notes: string;
  isFavorite: boolean;
  sortOrder: number;
  tags?: string[];
  updatedAt: string;
  updatedBy: string | null;
};

export type CredentialInput = {
  category: CredentialCategory;
  label: string;
  url: string;
  username: string;
  password: string;
  provider: string;
  notes: string;
  clearPassword?: boolean;
  isFavorite?: boolean;
  sortOrder?: number;
  tags?: string[];
};

export type CredentialImportItem = {
  category: CredentialCategory;
  label: string;
  url: string;
  username: string;
  password: string;
  provider: string;
  notes: string;
};

export type CredentialImportResult = {
  created: number;
  skipped: number;
  total: number;
};

export type VaultStats = {
  total: number;
  byCategory: Record<string, number>;
  byTag?: Record<string, number>;
};

export type CredentialList = {
  items: Credential[];
  stats: VaultStats;
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

// ---------------------------------------------------------------------------
// Mailboxes & E-Mail Intelligence
// ---------------------------------------------------------------------------

export type MailSecurity = "ssl" | "starttls";

export type EmailConnection = {
  id: string;
  label: string;
  emailAddress: string;
  username: string;
  imapHost: string;
  imapPort: number;
  imapSecurity: MailSecurity;
  smtpHost: string;
  smtpPort: number;
  smtpSecurity: MailSecurity;
  folder: string;
  isEnabled: boolean;
  analysisEnabled: boolean;
  hasPassword: boolean;
  lastSyncAt?: string | null;
  lastSyncStatus?: "ok" | "error" | null;
  lastError?: string | null;
  consecutiveFailures: number;
  lastUid?: number | null;
  messageCount: number;
  updatedAt: string;
  updatedBy?: string | null;
};

export type EmailConnectionEvent = { kind: string; message: string; createdAt: string };

export type EmailConnectionInput = {
  label: string;
  emailAddress: string;
  username: string;
  password: string;
  imapHost: string;
  imapPort: number;
  imapSecurity: MailSecurity;
  smtpHost: string;
  smtpPort: number;
  smtpSecurity: MailSecurity;
  folder: string;
  isEnabled: boolean;
  analysisEnabled: boolean;
};

export type ConnectionTestResult = {
  imapOk: boolean;
  smtpOk: boolean;
  imapMessage?: string | null;
  smtpMessage?: string | null;
  messageCount?: number | null;
};

export type EmailImportance = "low" | "normal" | "high" | "urgent";

export type EmailListItem = {
  id: string;
  connectionId: string;
  connectionLabel: string;
  fromAddress?: string | null;
  fromName?: string | null;
  subject?: string | null;
  receivedAt: string;
  status: "new" | "queued" | "analyzed" | "skipped" | "failed";
  attachmentCount: number;
  importance?: EmailImportance | null;
  requestType?: string | null;
  isCustomerRequest?: boolean | null;
  summary?: string | null;
  injectionSuspected: boolean;
};

export type EmailAttachment = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  verdict: "allowed" | "blocked" | "dangerous";
  reason?: string | null;
};

export type EmailAnalysis = {
  id: string;
  agentRunId?: string | null;
  workflowId?: string | null;
  importance: EmailImportance;
  requestType: string;
  isCustomerRequest: boolean;
  summary: string;
  resultJson: string;
  injectionSuspected: boolean;
  createdAt: string;
};

export type EmailDetail = {
  id: string;
  connectionId: string;
  connectionLabel: string;
  fromAddress?: string | null;
  fromName?: string | null;
  toAddresses?: string | null;
  ccAddresses?: string | null;
  subject?: string | null;
  receivedAt: string;
  status: EmailListItem["status"];
  bodyText?: string | null;
  bodyTruncated: boolean;
  bodyPurged: boolean;
  hadHtml: boolean;
  attachments: EmailAttachment[];
  threadKey?: string | null;
  analysis?: EmailAnalysis | null;
  thread: EmailListItem[];
};

export type EmailIntelligenceResult = {
  importance?: string;
  requestType?: string;
  isCustomerRequest?: boolean;
  summary?: string;
  requirements?: string[];
  openQuestions?: string[];
  deadlines?: { description?: string | null; date?: string | null }[];
  recommendedActions?: string[];
  projectHint?: string | null;
};

// ---------------------------------------------------------------------------
// Messenger (Telegram, WhatsApp later)
// ---------------------------------------------------------------------------

export type NotificationPreferences = {
  customerRequests: boolean;
  importantEmails: boolean;
  approvals: boolean;
  failures: boolean;
  dailyDigest: boolean;
};

export type MessengerLink = {
  id: string;
  channel: "telegram" | "whatsapp";
  externalName?: string | null;
  preferences: NotificationPreferences;
  quietFrom?: string | null;
  quietTo?: string | null;
  linkedAt: string;
};

export type NotificationItem = {
  kind: string;
  title: string;
  status: "queued" | "sent" | "failed" | "suppressed";
  error?: string | null;
  createdAt: string;
  sentAt?: string | null;
};

export type MessengerStatus = {
  telegramConfigured: boolean;
  telegramBotUsername?: string | null;
  telegramMode: "webhook" | "polling";
  whatsAppConfigured: boolean;
  links: MessengerLink[];
  recent: NotificationItem[];
};

export type PairingCode = { code: string; deepLink: string; expiresAt: string };

// ---------------------------------------------------------------------------
// GentleSuite CRM references
// ---------------------------------------------------------------------------

export type CrmLinkStatus = "matched" | "proposed" | "ambiguous" | "unknown" | "confirmed";

export type CrmCandidate = { id: string; companyName: string; customerNumber?: string | null; status: string; matchedBy: string };

export type CrmLink = {
  status: CrmLinkStatus;
  matchedBy: string;
  confidence: number;
  customerId?: string | null;
  customerName?: string | null;
  contactName?: string | null;
  customerUrl?: string | null;
  candidates: CrmCandidate[];
  reason?: string | null;
  decidedBy?: string | null;
  createdAt: string;
};

export type CrmCustomerMatch = {
  id: string;
  companyName: string;
  customerNumber?: string | null;
  status: string;
  website?: string | null;
  matchedBy: string;
};

export type CrmStatus = { configured: boolean; reachable: boolean; frontendUrl?: string | null };

// ---------------------------------------------------------------------------
// Notes, estimates and approvals
// ---------------------------------------------------------------------------

export type EstimateRole = "pm" | "design" | "dev" | "qa";

export type EstimateRisk = { description?: string | null; impactHours?: number | null };

export type EstimateContent = {
  currentState: string;
  planning: string;
  plannedMeasures: string[];
  scope: string;
  assumptions: string[];
  dependencies: string[];
  exclusions: string[];
  risks: EstimateRisk[];
};

export type EstimateItem = {
  id: string;
  sortOrder: number;
  title: string;
  description?: string | null;
  role: EstimateRole;
  hours: number;
  rateEur: number;
  /** Flat package price; null only for legacy hourly items. */
  priceEur?: number | null;
  amountEur: number;
  rationale?: string | null;
};

export type EstimateTotals = {
  baseHours: number;
  bufferPercent: number;
  bufferHours: number;
  totalHours: number;
  baseNetEur: number;
  totalNetEur: number;
  isFlat: boolean;
};

export type EstimateStatus = "pending_approval" | "approved" | "rejected" | "superseded";

export type Estimate = {
  id: string;
  title: string;
  status: EstimateStatus;
  emailMessageId?: string | null;
  noteId?: string | null;
  approvalId?: string | null;
  workflowId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  content: EstimateContent;
  items: EstimateItem[];
  totals: EstimateTotals;
  offerDraftJson?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
};

export type ProjectNote = {
  id: string;
  emailMessageId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  title: string;
  contentJson: string;
  createdAt: string;
};

export type ProjectNoteContent = {
  projectDescription?: string;
  businessRequirements?: string[];
  technicalRequirements?: string[];
  decisions?: string[];
  tasks?: { title?: string; description?: string }[];
  openQuestions?: string[];
  risks?: string[];
  sources?: string[];
};

export type ApprovalStatus = "pending" | "approved" | "executed" | "rejected" | "expired" | "superseded";

export type ApprovalListItem = {
  id: string;
  kind: string;
  status: ApprovalStatus;
  version: number;
  title: string;
  summary?: string | null;
  agentId?: string | null;
  customerName?: string | null;
  nextAction?: string | null;
  estimateId?: string | null;
  emailMessageId?: string | null;
  totalHours?: number | null;
  totalNetEur?: number | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  decidedBy?: string | null;
  decidedAt?: string | null;
};

export type ApprovalDetail = {
  approval: ApprovalListItem;
  contentHash: string;
  decisionNote?: string | null;
  executedAt?: string | null;
  estimate?: Estimate | null;
  note?: ProjectNote | null;
  emailSubject?: string | null;
  emailFrom?: string | null;
  counterOffers: CounterOffer[];
};

export type CounterOffer = {
  id: string;
  estimateId: string;
  agentTotalEur: number;
  targetTotalEur?: number | null;
  note?: string | null;
  resultEstimateId?: string | null;
  createdBy: string;
  createdAt: string;
};

export type PriceCatalogEntry = { title: string; description?: string | null; priceEur: number };

export type EmailWork = { note?: ProjectNote | null; estimate?: Estimate | null };

export type EstimateSettings = { rates: Record<EstimateRole, number>; bufferPercent: number; catalog: PriceCatalogEntry[] };

export type EstimateItemInput = {
  title: string;
  description?: string | null;
  role?: EstimateRole;
  hours?: number;
  rateEur?: number;
  priceEur?: number;
  rationale?: string | null;
};

export type EstimateUpdateInput = {
  expectedApprovalVersion: number;
  title: string;
  bufferPercent: number;
  content: EstimateContent;
  items: EstimateItemInput[];
};
