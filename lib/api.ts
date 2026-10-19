import { API_URL } from "@/lib/constants";
import type {
  Asset,
  AssetInput,
  Health,
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
};
