export type ApplicationCategory = "saas" | "crm" | "internal" | "customer" | "tool";

export type ApplicationEnvironment = "production" | "staging" | "development";

export type Application = {
  /** Stable identifier. Used as the React key, for favorites and vault entries. */
  id: string;
  /** Display name shown on the card. */
  name: string;
  /** One short sentence describing what the application does. */
  description: string;
  /** Absolute URL the "Öffnen" button opens. Must be a valid http(s) URL. */
  url: string;
  /** Optional logo: a path under /public or an absolute https URL. Falls back to a monogram. */
  icon?: string;
  /** Category used for filtering. */
  category: ApplicationCategory;
  /** Optional free-form tags, searchable. */
  tags?: string[];
  /** Deployment environment. Only non-production environments are labelled on the card. */
  environment?: ApplicationEnvironment;
  /** Shared, unencrypted notes (ideas, hints). Secrets belong in the vault. */
  notes?: string;
  /** ISO timestamp and e-mail of the last change. */
  updatedAt?: string;
  updatedBy?: string | null;
  /** Disabled applications are shown but not clickable, and excluded from the command palette. */
  disabled?: boolean;
};

/** Editable fields of an application. */
export type ApplicationInput = Pick<Application, "name" | "description" | "url" | "icon" | "category" | "environment">;

/** A locally-stored reference to an application the user opened. */
export type RecentEntry = {
  applicationId: string;
  timestamp: number;
};
