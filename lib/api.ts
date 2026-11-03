import { API_URL } from "@/lib/constants";
import type {
  Agent,
  AgentDetail,
  AgentRun,
  AgentUpdateInput,
  AiJob,
  AiOverview,
  AiSettings,
  AiSettingsInput,
  ApprovalDetail,
  ApprovalListItem,
  Asset,
  AssetInput,
  ConnectionTestResult,
  CostReport,
  Credential,
  CredentialImportItem,
  CredentialImportResult,
  CredentialInput,
  CredentialList,
  CrmCustomerMatch,
  CrmLink,
  CrmStatus,
  EmailConnection,
  EmailConnectionEvent,
  EmailConnectionInput,
  EmailDetail,
  EmailListItem,
  EmailWork,
  Estimate,
  EstimateSettings,
  EstimateUpdateInput,
  PriceCatalogEntry,
  Health,
  JobStatus,
  MessengerStatus,
  NotificationPreferences,
  PairingCode,
  LoginResponse,
  Overview,
  Project,
  ProjectDetail,
  ProjectInput,
  ProjectKind,
  SearchResults,
  SecretReveal,
  User,
} from "@/lib/types";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly errors?: Record<string, string>;

  constructor(status: number, message: string, code?: string, errors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  timeoutMs?: number;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(options.timeoutMs ?? 15_000),
    });
  } catch {
    throw new ApiError(0, "Backend nicht erreichbar. Bitte später erneut versuchen.", "network_error");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const problem = data as
      | { message?: string; code?: string; errors?: Record<string, string> }
      | null;
    throw new ApiError(
      response.status,
      problem?.message ?? `Anfrage fehlgeschlagen (${response.status}).`,
      problem?.code,
      problem?.errors,
    );
  }

  return data as T;
}

export const api = {
  health: () => request<Health>("/api/health", { timeoutMs: 8_000 }),

  login: (email: string, password: string) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password },
      timeoutMs: 20_000,
    }),

  me: (token: string) => request<User>("/api/auth/me", { token }),

  logout: (token: string) => request<void>("/api/auth/logout", { method: "POST", token }),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    request<{ ok: boolean; message: string }>("/api/auth/change-password", {
      method: "POST",
      token,
      body: { currentPassword, newPassword },
      timeoutMs: 20_000,
    }),

  overview: (token: string) => request<Overview>("/api/overview", { token }),

  projects: (token: string, kind?: ProjectKind) =>
    request<{ items: Project[] }>(
      `/api/projects${kind ? `?kind=${encodeURIComponent(kind)}` : ""}`,
      { token },
    ),

  project: (token: string, key: string) =>
    request<ProjectDetail>(`/api/projects/${encodeURIComponent(key)}`, { token }),

  search: (token: string, query: string) =>
    request<SearchResults>(`/api/search?q=${encodeURIComponent(query)}`, { token }),

  createProject: (token: string, input: ProjectInput) =>
    request<{ id: string; slug: string }>("/api/projects", { method: "POST", token, body: input }),

  updateProject: (token: string, key: string, input: ProjectInput) =>
    request<{ ok: boolean }>(`/api/projects/${encodeURIComponent(key)}`, {
      method: "PUT",
      token,
      body: input,
    }),

  deleteProject: (token: string, key: string) =>
    request<void>(`/api/projects/${encodeURIComponent(key)}`, { method: "DELETE", token }),

  setFavorite: (token: string, key: string, favorite: boolean) =>
    request<{ favorite: boolean }>(`/api/projects/${encodeURIComponent(key)}/favorite`, {
      method: "POST",
      token,
      body: { favorite },
    }),

  updateNotes: (token: string, key: string, notes: string) =>
    request<{ ok: boolean }>(`/api/projects/${encodeURIComponent(key)}/notes`, {
      method: "PUT",
      token,
      body: { notes },
    }),

  createAsset: (token: string, projectKey: string, input: AssetInput) =>
    request<Asset>(`/api/projects/${encodeURIComponent(projectKey)}/assets`, {
      method: "POST",
      token,
      body: input,
    }),

  updateAsset: (token: string, id: string, input: AssetInput) =>
    request<Asset>(`/api/assets/${encodeURIComponent(id)}`, { method: "PUT", token, body: input }),

  deleteAsset: (token: string, id: string) =>
    request<void>(`/api/assets/${encodeURIComponent(id)}`, { method: "DELETE", token }),

  revealAsset: (token: string, id: string) =>
    request<SecretReveal>(`/api/assets/${encodeURIComponent(id)}/reveal`, {
      method: "POST",
      token,
      body: {},
      timeoutMs: 20_000,
    }),

  // Password vault
  credentials: (token: string, category?: string) =>
    request<CredentialList>(
      `/api/credentials${category ? `?category=${encodeURIComponent(category)}` : ""}`,
      { token },
    ),

  createCredential: (token: string, input: CredentialInput) =>
    request<Credential>("/api/credentials", { method: "POST", token, body: input }),

  updateCredential: (token: string, id: string, input: CredentialInput) =>
    request<Credential>(`/api/credentials/${encodeURIComponent(id)}`, {
      method: "PUT",
      token,
      body: input,
    }),

  deleteCredential: (token: string, id: string) =>
    request<void>(`/api/credentials/${encodeURIComponent(id)}`, { method: "DELETE", token }),

  revealCredential: (token: string, id: string) =>
    request<SecretReveal>(`/api/credentials/${encodeURIComponent(id)}/reveal`, {
      method: "POST",
      token,
      body: {},
      timeoutMs: 20_000,
    }),

  importCredentials: (token: string, items: CredentialImportItem[]) =>
    request<CredentialImportResult>("/api/credentials/import", {
      method: "POST",
      token,
      body: { items },
      timeoutMs: 90_000,
    }),

  // AI Operations
  aiOverview: (token: string) => request<AiOverview>("/api/ai/overview", { token }),

  aiAgents: (token: string) => request<{ items: Agent[] }>("/api/ai/agents", { token }),

  aiAgent: (token: string, id: string) =>
    request<AgentDetail>(`/api/ai/agents/${encodeURIComponent(id)}`, { token }),

  updateAiAgent: (token: string, id: string, input: AgentUpdateInput) =>
    request<Agent>(`/api/ai/agents/${encodeURIComponent(id)}`, { method: "PUT", token, body: input }),

  addAiAgentPrompt: (token: string, id: string, systemPrompt: string, changeNote: string) =>
    request<{ version: number }>(`/api/ai/agents/${encodeURIComponent(id)}/prompts`, {
      method: "POST",
      token,
      body: { systemPrompt, changeNote },
    }),

  testRunAiAgent: (token: string, id: string) =>
    request<{ jobId: string }>(`/api/ai/agents/${encodeURIComponent(id)}/test-run`, {
      method: "POST",
      token,
      body: {},
    }),

  aiRuns: (token: string, filter: { agentId?: string; status?: string; take?: number } = {}) => {
    const params = new URLSearchParams();
    if (filter.agentId) params.set("agentId", filter.agentId);
    if (filter.status) params.set("status", filter.status);
    if (filter.take) params.set("take", String(filter.take));
    const query = params.toString();
    return request<{ items: AgentRun[] }>(`/api/ai/runs${query ? `?${query}` : ""}`, { token });
  },

  aiJobs: (token: string, status?: JobStatus, take = 50) => {
    const params = new URLSearchParams({ take: String(take) });
    if (status) params.set("status", status);
    return request<{ items: AiJob[] }>(`/api/ai/jobs?${params.toString()}`, { token });
  },

  retryAiJob: (token: string, id: string) =>
    request<{ ok: boolean }>(`/api/ai/jobs/${encodeURIComponent(id)}/retry`, {
      method: "POST",
      token,
      body: {},
    }),

  cancelAiJob: (token: string, id: string) =>
    request<{ ok: boolean }>(`/api/ai/jobs/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      token,
      body: {},
    }),

  aiCosts: (token: string, month?: string) =>
    request<CostReport>(`/api/ai/costs${month ? `?month=${encodeURIComponent(month)}` : ""}`, { token }),

  updateAiSettings: (token: string, input: AiSettingsInput) =>
    request<AiSettings>("/api/ai/settings", { method: "PUT", token, body: input }),

  // Mailboxes & E-Mail Intelligence
  emailConnections: (token: string) =>
    request<{ items: EmailConnection[]; encryptionConfigured: boolean }>("/api/ai/connections/email", { token }),

  createEmailConnection: (token: string, input: EmailConnectionInput) =>
    request<EmailConnection>("/api/ai/connections/email", { method: "POST", token, body: input }),

  updateEmailConnection: (token: string, id: string, input: EmailConnectionInput) =>
    request<EmailConnection>(`/api/ai/connections/email/${encodeURIComponent(id)}`, { method: "PUT", token, body: input }),

  testEmailConnection: (token: string, id: string) =>
    request<ConnectionTestResult>(`/api/ai/connections/email/${encodeURIComponent(id)}/test`, {
      method: "POST",
      token,
      body: {},
      timeoutMs: 75_000,
    }),

  syncEmailConnection: (token: string, id: string) =>
    request<{ jobId: string }>(`/api/ai/connections/email/${encodeURIComponent(id)}/sync`, { method: "POST", token, body: {} }),

  emailConnectionEvents: (token: string, id: string) =>
    request<{ items: EmailConnectionEvent[] }>(`/api/ai/connections/email/${encodeURIComponent(id)}/events?take=20`, { token }),

  emails: (token: string, filter: { connectionId?: string; customerOnly?: boolean; importance?: string } = {}) => {
    const params = new URLSearchParams({ take: "100" });
    if (filter.connectionId) params.set("connectionId", filter.connectionId);
    if (filter.customerOnly) params.set("customerOnly", "true");
    if (filter.importance) params.set("importance", filter.importance);
    return request<{ items: EmailListItem[] }>(`/api/ai/emails?${params.toString()}`, { token });
  },

  email: (token: string, id: string) => request<EmailDetail>(`/api/ai/emails/${encodeURIComponent(id)}`, { token }),

  reanalyzeEmail: (token: string, id: string) =>
    request<{ jobId: string }>(`/api/ai/emails/${encodeURIComponent(id)}/reanalyze`, { method: "POST", token, body: {} }),

  // Messenger
  messenger: (token: string) => request<MessengerStatus>("/api/ai/messenger", { token }),

  pairTelegram: (token: string) =>
    request<PairingCode>("/api/ai/messenger/telegram/pair", { method: "POST", token, body: {} }),

  updateMessengerPreferences: (token: string, id: string, preferences: NotificationPreferences, quietFrom: string, quietTo: string) =>
    request<{ ok: boolean }>(`/api/ai/messenger/${encodeURIComponent(id)}`, {
      method: "PUT",
      token,
      body: { preferences, quietFrom, quietTo },
    }),

  revokeMessenger: (token: string, id: string) =>
    request<{ ok: boolean }>(`/api/ai/messenger/${encodeURIComponent(id)}`, { method: "DELETE", token }),

  sendTelegramTest: (token: string) =>
    request<{ ok: boolean }>("/api/ai/messenger/telegram/test", { method: "POST", token, body: {} }),

  // GentleSuite CRM
  crmStatus: (token: string) => request<CrmStatus>("/api/ai/crm/status", { token }),

  searchCrmCustomers: (token: string, query: string) =>
    request<{ items: CrmCustomerMatch[] }>(`/api/ai/crm/search?q=${encodeURIComponent(query)}`, { token }),

  emailCrmLink: (token: string, emailId: string) =>
    request<{ link?: CrmLink | null }>(`/api/ai/emails/${encodeURIComponent(emailId)}/crm-link`, { token }),

  setEmailCrmLink: (token: string, emailId: string, customerId: string | null) =>
    request<{ link: CrmLink }>(`/api/ai/emails/${encodeURIComponent(emailId)}/crm-link`, {
      method: "PUT",
      token,
      body: { customerId },
    }),

  // Approvals & estimates
  approvals: (token: string, status?: "open" | "done") =>
    request<{ items: ApprovalListItem[] }>(`/api/ai/approvals${status ? `?status=${status}` : ""}`, { token }),

  approval: (token: string, id: string) => request<ApprovalDetail>(`/api/ai/approvals/${encodeURIComponent(id)}`, { token }),

  decideApproval: (token: string, id: string, body: { approve: boolean; version: number; contentHash: string; note: string }) =>
    request<ApprovalDetail>(`/api/ai/approvals/${encodeURIComponent(id)}/decision`, { method: "POST", token, body }),

  updateEstimate: (token: string, id: string, input: EstimateUpdateInput) =>
    request<{ estimate: Estimate; approvalVersion: number }>(`/api/ai/estimates/${encodeURIComponent(id)}`, {
      method: "PUT",
      token,
      body: input,
    }),

  regenerateEstimate: (token: string, id: string) =>
    request<{ jobId: string }>(`/api/ai/estimates/${encodeURIComponent(id)}/regenerate`, { method: "POST", token, body: {} }),

  counterOffer: (token: string, id: string, input: { targetTotalEur?: number | null; note?: string | null }) =>
    request<{ jobId: string }>(`/api/ai/estimates/${encodeURIComponent(id)}/counter-offer`, { method: "POST", token, body: input }),

  emailWork: (token: string, emailId: string) => request<EmailWork>(`/api/ai/emails/${encodeURIComponent(emailId)}/work`, { token }),

  startEstimateForEmail: (token: string, emailId: string) =>
    request<{ jobId: string }>(`/api/ai/emails/${encodeURIComponent(emailId)}/estimate`, { method: "POST", token, body: {} }),

  estimateSettings: (token: string) => request<EstimateSettings>("/api/ai/settings/estimate", { token }),

  updateEstimateSettings: (token: string, bufferPercent: number, catalog: PriceCatalogEntry[]) =>
    request<EstimateSettings>("/api/ai/settings/estimate", { method: "PUT", token, body: { bufferPercent, catalog } }),
};
