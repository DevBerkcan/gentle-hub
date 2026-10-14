export type ApplicationCategory = "saas" | "crm" | "internal" | "customer" | "tool";

export type ApplicationEnvironment = "production" | "staging" | "development";

export type Application = {
  /** Stable, url-safe identifier. Used as the React key and for localStorage entries. */
  id: string;
  /** Display name shown on the card. */
  name: string;
  /** One short sentence describing what the application does. */
  description: string;
  /** Absolute URL the application opens at. Must be a valid http(s) URL. */
  url: string;
  /** Optional logo: a path under /public (e.g. "/apps/gentlebook.svg") or an absolute https URL. Falls back to a monogram. */
  icon?: string;
  /** Category used for filtering. */
  category: ApplicationCategory;
  /** Optional free-form tags, searchable. */
  tags?: string[];
  /** Deployment environment. Only non-production environments are labelled on the card. */
  environment?: ApplicationEnvironment;
  /** Default favorite — applies until the user has set favorites of their own. */
  isFavorite?: boolean;
  /** Disabled applications are shown but not clickable, and excluded from the command palette. */
  disabled?: boolean;
};

/** A locally-stored reference to an application the user opened. */
export type RecentEntry = {
  applicationId: string;
  timestamp: number;
};
