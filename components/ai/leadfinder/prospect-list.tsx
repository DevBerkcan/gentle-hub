"use client";

import { useState, useTransition } from "react";
import { updateProspectAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { PROSPECT_STATUS_LABELS } from "@/lib/leadfinder";
import type { Prospect, ProspectStatus } from "@/lib/types";
import { IconCheck, IconExternal, IconGlobe, IconLoader, IconPhone } from "@/components/ui/icons";

const EDITABLE: ProspectStatus[] = ["new", "qualified", "contacted", "interested", "not_interested", "do_not_contact"];

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "hot" | "warn" }) {
  return (
    <span
      className={cn(
        "rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold",
        tone === "hot" && "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100",
        tone === "warn" && "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
        tone === "neutral" && "bg-surface-2 text-muted",
      )}
    >
      {children}
    </span>
  );
}

/** Sales hooks from the website check: what Gentle Group could improve. */
function SiteBadges({ prospect }: { prospect: Prospect }) {
  const year = new Date().getFullYear();
  if (prospect.enrichStatus === "no_website") return <Badge tone="hot">Keine Website</Badge>;
  if (prospect.enrichStatus === "pending") return <Badge>wird geprüft …</Badge>;
  if (prospect.enrichStatus === "budget") return <Badge>wartet auf Kontingent</Badge>;
  if (prospect.enrichStatus === "failed") return <Badge tone="warn">{prospect.lastError ?? "nicht erreichbar"}</Badge>;
  const site = prospect.site;
  if (!site) return null;
  return (
    <>
      {!site.https && <Badge tone="warn">kein HTTPS</Badge>}
      {!site.mobileViewport && <Badge tone="hot">nicht mobil</Badge>}
      {site.copyrightYear && site.copyrightYear <= year - 3 && <Badge tone="hot">© {site.copyrightYear}</Badge>}
      {site.responseMs > 2500 && <Badge tone="warn">langsam</Badge>}
      {site.cms && <Badge>{site.cms}</Badge>}
    </>
  );
}

export function ProspectList({ items, liveDetails }: { items: Prospect[]; liveDetails: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {items.map((prospect) => (
          <ProspectItem key={prospect.id} initial={prospect} />
        ))}
      </ul>
      {liveDetails && items.some((p) => p.live) && (
        <p className="text-right text-[10.5px] text-subtle">Name, Adresse und Karte: Google Maps (nur angezeigt, nicht gespeichert)</p>
      )}
    </div>
  );
}

function ProspectItem({ initial }: { initial: Prospect }) {
  const [prospect, setProspect] = useState(initial);
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const name = prospect.live?.name ?? prospect.companyName ?? "Unbekannter Betrieb";
  const address = prospect.address ?? prospect.live?.address;

  function save(input: { status?: string; notes?: string | null }) {
    if (input.status === "do_not_contact" && !window.confirm("Lead sperren? Die gespeicherten Kontaktdaten werden gelöscht und der Betrieb wird nicht erneut aufgenommen.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateProspectAction(prospect.id, input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setProspect((current) => ({ ...result.prospect, live: current.live }));
      setNotes(result.prospect.notes ?? "");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <li className={cn("card flex flex-col gap-2 p-3.5", prospect.status === "do_not_contact" && "opacity-60")}>
      <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-semibold text-ink">{name}</span>
            <Badge>{prospect.categoryLabel}</Badge>
            <SiteBadges prospect={prospect} />
          </div>
          {address && <p className="mt-0.5 text-[11.5px] text-muted">{address}</p>}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px]">
            {prospect.contactName && <span className="text-ink">{prospect.contactName}</span>}
            {prospect.phone && (
              <a href={`tel:${prospect.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 text-ink underline-offset-2 hover:underline">
                <IconPhone className="h-3 w-3" />
                {prospect.phone}
              </a>
            )}
            {prospect.email && <span className="text-muted">{prospect.email}</span>}
            {prospect.websiteUrl && (
              <a href={prospect.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-ink">
                <IconGlobe className="h-3 w-3" />
                {prospect.websiteUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </a>
            )}
            {prospect.live?.mapsUrl && (
              <a href={prospect.live.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-ink">
                <IconExternal className="h-3 w-3" />
                Google Maps
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {pending ? <IconLoader className="h-3.5 w-3.5 text-muted" /> : saved ? <IconCheck className="h-3.5 w-3.5 text-emerald-600" /> : null}
          <select
            className="input h-8 w-auto py-0 text-[11.5px]"
            value={prospect.status}
            aria-label="Status"
            disabled={pending || prospect.status === "outside" || prospect.status === "closed"}
            onChange={(event) => save({ status: event.target.value })}
          >
            {(EDITABLE.includes(prospect.status) ? EDITABLE : [prospect.status, ...EDITABLE]).map((status) => (
              <option key={status} value={status}>
                {PROSPECT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-ghost h-8 px-2 text-[11.5px]" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            Notiz{prospect.notes ? " ✎" : ""}
          </button>
        </div>
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      {open && (
        <div className="flex flex-col gap-1.5">
          <textarea
            className="textarea min-h-16 text-[12px]"
            value={notes}
            maxLength={2000}
            placeholder="z. B. Inhaberin angerufen, Rückruf Dienstag; Interesse an Online-Terminbuchung"
            onChange={(event) => setNotes(event.target.value)}
          />
          <div className="flex justify-end">
            <button type="button" className="btn btn-primary h-8 text-[11.5px]" disabled={pending || notes === (prospect.notes ?? "")} onClick={() => save({ notes })}>
              Notiz speichern
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
