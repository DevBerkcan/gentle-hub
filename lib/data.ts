import { cache } from "react";
import { api } from "@/lib/api";
import { requireAuth } from "@/lib/session";
import type { Health, Overview, ProjectDetail, ProjectKind, SearchResults } from "@/lib/types";

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
