import { cache } from "react";
import { api } from "@/lib/api";
import { requireAuth } from "@/lib/session";
import type {
  AgentDetail,
  AiOverview,
  CostReport,
  Health,
  JobStatus,
  Overview,
  ProjectDetail,
  ProjectKind,
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
