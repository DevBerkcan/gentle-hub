import { cache } from "react";
import { api } from "@/lib/api";
import { requireAuth } from "@/lib/session";
import { buildOffice } from "@/lib/office";
import type {
  AgentDetail,
  AiOverview,
  ApprovalDetail,
  CostReport,
  CredentialList,
  CrmLink,
  CrmStatus,
  EmailDetail,
  EmailWork,
  EstimateSettings,
  Health,
  JobStatus,
  MessengerStatus,
  Overview,
  ProjectDetail,
  ProjectKind,
  ReplyDraft,
  ReplySettings,
  MonitorOverview,
  SupportTicket,
  SearchResults,
} from "@/lib/types";

export const getOverviewData = cache(async (): Promise<Overview> => {
  const { token } = await requireAuth();
  return api.overview(token);
});

export const getProjectsData = cache(async (kind?: ProjectKind) => {
  const { token } = await requireAuth();
  const response = await api.projects(token, kind);
  return response.items;
});

export const getProjectData = cache(async (key: string): Promise<ProjectDetail> => {
  const { token } = await requireAuth();
  return api.project(token, key);
});

export const getSearchData = cache(async (query: string): Promise<SearchResults> => {
  const { token } = await requireAuth();
  return api.search(token, query);
});

export const getCredentialsData = cache(async (category?: string, query?: string, tag?: string): Promise<CredentialList> => {
  const { token } = await requireAuth();
  return api.credentials(token, category, query, tag);
});

export const getHealth = cache(async (): Promise<Health | null> => {
  try {
    return await api.health();
  } catch {
    return null;
  }
});

export const getAiOverviewData = cache(async (): Promise<AiOverview> => {
  const { token } = await requireAuth();
  return api.aiOverview(token);
});

export const getAiAgentsData = cache(async () => {
  const { token } = await requireAuth();
  const response = await api.aiAgents(token);
  return response.items;
});

export const getAiAgentData = cache(async (id: string): Promise<AgentDetail> => {
  const { token } = await requireAuth();
  return api.aiAgent(token, id);
});

export const getAiRunsData = cache(async (agentId?: string, status?: string) => {
  const { token } = await requireAuth();
  const response = await api.aiRuns(token, { agentId, status, take: 100 });
  return response.items;
});

export const getAiJobsData = cache(async (status?: JobStatus) => {
  const { token } = await requireAuth();
  const response = await api.aiJobs(token, status, 100);
  return response.items;
});

export const getAiCostsData = cache(async (month?: string): Promise<CostReport> => {
  const { token } = await requireAuth();
  return api.aiCosts(token, month);
});

export const getEmailConnectionsData = cache(async () => {
  const { token } = await requireAuth();
  return api.emailConnections(token);
});

export const getEmailConnectionEventsData = cache(async (id: string) => {
  const { token } = await requireAuth();
  const response = await api.emailConnectionEvents(token, id);
  return response.items;
});

export const getEmailsData = cache(async (connectionId?: string, customerOnly?: boolean, importance?: string) => {
  const { token } = await requireAuth();
  const response = await api.emails(token, { connectionId, customerOnly, importance });
  return response.items;
});

export const getEmailData = cache(async (id: string): Promise<EmailDetail> => {
  const { token } = await requireAuth();
  return api.email(token, id);
});

export const getMessengerData = cache(async (): Promise<MessengerStatus> => {
  const { token } = await requireAuth();
  return api.messenger(token);
});

export const getCrmStatusData = cache(async (): Promise<CrmStatus | null> => {
  const { token } = await requireAuth();
  try {
    return await api.crmStatus(token);
  } catch {
    return null;
  }
});

export const getEmailCrmLinkData = cache(async (emailId: string): Promise<CrmLink | null> => {
  const { token } = await requireAuth();
  const response = await api.emailCrmLink(token, emailId);
  return response.link ?? null;
});

export const getApprovalsData = cache(async (status?: "open" | "done") => {
  const { token } = await requireAuth();
  const response = await api.approvals(token, status);
  return response.items;
});

export const getApprovalData = cache(async (id: string): Promise<ApprovalDetail> => {
  const { token } = await requireAuth();
  return api.approval(token, id);
});

export const getEmailWorkData = cache(async (emailId: string): Promise<EmailWork> => {
  const { token } = await requireAuth();
  return api.emailWork(token, emailId);
});

export const getEmailRepliesData = cache(async (emailId: string): Promise<ReplyDraft[]> => {
  const { token } = await requireAuth();
  const response = await api.emailReplies(token, emailId);
  return response.items;
});

export const getBriefingData = cache(async () => {
  const { token } = await requireAuth();
  const response = await api.briefing(token);
  return response.briefing ?? null;
});

export const getVoiceNotesData = cache(async () => {
  const { token } = await requireAuth();
  const response = await api.voiceNotes(token);
  return response.items;
});

export const getReportsData = cache(async () => {
  const { token } = await requireAuth();
  return api.reports(token);
});

export const getLeadCheckData = cache(async (emailId: string) => {
  const { token } = await requireAuth();
  const response = await api.leadCheck(token, emailId);
  return response.check ?? null;
});

export const getSupportData = cache(async (status?: string) => {
  const { token } = await requireAuth();
  return api.supportTickets(token, status);
});

export const getSupportForEmailData = cache(async (emailId: string): Promise<SupportTicket | null> => {
  const { token } = await requireAuth();
  const response = await api.supportForEmail(token, emailId);
  return response.ticket ?? null;
});

export const getOfficeData = cache(async () => {
  const [overview, approvals, support, monitoring] = await Promise.all([
    getAiOverviewData(),
    getApprovalsData("open"),
    getSupportData("active"),
    getMonitoringData(),
  ]);
  return buildOffice(overview, approvals, support, monitoring);
});

export const getMonitoringData = cache(async (): Promise<MonitorOverview> => {
  const { token } = await requireAuth();
  return api.monitoring(token);
});

export const getReplySettingsData = cache(async (): Promise<ReplySettings> => {
  const { token } = await requireAuth();
  return api.replySettings(token);
});

export const getEstimateSettingsData = cache(async (): Promise<EstimateSettings> => {
  const { token } = await requireAuth();
  return api.estimateSettings(token);
});
