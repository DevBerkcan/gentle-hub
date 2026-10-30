"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchCrmCustomersAction, setEmailCrmLinkAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import type { CrmCustomerMatch, CrmLink, CrmLinkStatus } from "@/lib/types";
import { FormError } from "@/components/ui/field";
import { IconCheck, IconExternal, IconLoader, IconSearch } from "@/components/ui/icons";

const STATUS: Record<CrmLinkStatus, { label: string; className: string }> = {
  matched: { label: "Automatisch zugeordnet", className: "bg-emerald-50 text-emerald-700" },
  confirmed: { label: "Bestätigt", className: "bg-emerald-50 text-emerald-700" },
  proposed: { label: "Vorschlag – bitte bestätigen", className: "bg-amber-50 text-amber-800" },
  ambiguous: { label: "Mehrdeutig – bitte wählen", className: "bg-amber-50 text-amber-800" },
  unknown: { label: "Nicht im CRM", className: "bg-slate-100 text-slate-700" },
};

export function CrmLinkCard({ emailId, link, crmConfigured }: { emailId: string; link: CrmLink | null; crmConfigured: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CrmCustomerMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function search(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await searchCrmCustomersAction(query);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setResults(result.items);
    });
  }

  function assign(customerId: string) {
    setError(null);
    startTransition(async () => {
      const result = await setEmailCrmLinkAction(emailId, customerId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setResults(null);
      setQuery("");
      router.refresh();
    });
  }

  if (!crmConfigured) {
    return (
      <section className="card p-4 text-[11.5px] text-muted">
        <h2 className="text-[12.5px] font-semibold text-ink">Kunde (GentleSuite)</h2>
        <p className="mt-1.5">Die GentleSuite-Anbindung ist auf dem Server noch nicht konfiguriert.</p>
      </section>
    );
  }

  const status = link ? STATUS[link.status] : null;
  const needsDecision = !link || link.status === "proposed" || link.status === "ambiguous" || link.status === "unknown";

  return (
    <section className="card flex flex-col gap-3 p-4" aria-labelledby="crm-heading">
      <div className="flex items-center justify-between gap-2">
        <h2 id="crm-heading" className="text-[12.5px] font-semibold text-ink">
          Kunde (GentleSuite)
        </h2>
        {status && <span className={cn("rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold", status.className)}>{status.label}</span>}
      </div>

      {!link ? (
        <p className="text-[11.5px] text-muted">Die Zuordnung läuft nach der Analyse automatisch.</p>
      ) : (
        <>
          {link.customerName && (
            <p className="text-[13px] font-semibold text-ink">
              {link.customerName}
              {link.contactName && <span className="font-normal text-muted"> · {link.contactName}</span>}
            </p>
          )}
          {link.reason && <p className="text-[11px] text-muted">{link.reason}</p>}
          <div className="flex flex-wrap gap-2">
            {link.customerUrl && (
              <a href={link.customerUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-8 px-2 text-[11.5px]">
                <IconExternal className="h-3.5 w-3.5" />
                In GentleSuite öffnen
              </a>
            )}
            {link.status === "proposed" && link.customerId && (
              <button type="button" disabled={pending} onClick={() => assign(link.customerId!)} className="btn btn-primary h-8 text-[11.5px]">
                {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
                Zuordnung bestätigen
              </button>
            )}
          </div>
          {link.status === "ambiguous" && link.candidates.length > 0 && (
            <ul className="flex flex-col gap-1">
              {link.candidates.map((candidate) => (
                <li key={candidate.id}>
                  <button type="button" disabled={pending} onClick={() => assign(candidate.id)} className="btn btn-ghost h-8 w-full justify-start text-[11.5px]">
                    {candidate.companyName}
                    {candidate.customerNumber && <span className="text-muted">({candidate.customerNumber})</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {needsDecision && (
        <form onSubmit={search} className="flex flex-col gap-2 border-t border-line pt-3">
          <label htmlFor="crm-search" className="text-[11px] font-semibold text-ink">
            Anderen Kunden zuordnen
          </label>
          <div className="flex gap-2">
            <input
              id="crm-search"
              className="input h-8 flex-1 text-[12px]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Firmenname oder Kundennummer"
              minLength={2}
            />
            <button type="submit" disabled={pending || query.trim().length < 2} className="btn btn-secondary h-8 px-2.5" aria-label="Suchen">
              {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconSearch className="h-3.5 w-3.5" />}
            </button>
          </div>
          {results && (
            <ul className="flex flex-col gap-1">
              {results.length === 0 && <li className="text-[11px] text-muted">Keine Treffer.</li>}
              {results.map((customer) => (
                <li key={customer.id}>
                  <button type="button" disabled={pending} onClick={() => assign(customer.id)} className="btn btn-ghost h-8 w-full justify-start text-[11.5px]">
                    {customer.companyName}
                    <span className="text-muted">{customer.customerNumber ? `(${customer.customerNumber})` : ""} · {customer.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[10.5px] text-subtle">
            Die Zuordnung wird nur in GentleHub gespeichert. Neue Leads in GentleSuite entstehen erst nach Freigabe.
          </p>
        </form>
      )}
      <FormError message={error} />
    </section>
  );
}
