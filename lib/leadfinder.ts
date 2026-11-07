import type { ProspectStatus } from "@/lib/types";

/** Shared by the server page and the client list. */
export const PROSPECT_STATUS_LABELS: Record<ProspectStatus, string> = {
  new: "Neu",
  qualified: "Passt",
  contacted: "Kontaktiert",
  interested: "Interessiert",
  not_interested: "Kein Interesse",
  do_not_contact: "Gesperrt",
  outside: "Außerhalb",
  closed: "Geschlossen",
};
