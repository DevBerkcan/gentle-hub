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
