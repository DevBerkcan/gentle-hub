import type { Metadata } from "next";
import Link from "next/link";
import { getLeadFinderData, getProspectsData } from "@/lib/data";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/page-header";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { LeadSearchForm } from "@/components/ai/leadfinder/lead-search-form";
import { LeadSearches } from "@/components/ai/leadfinder/lead-searches";
import { ProspectList } from "@/components/ai/leadfinder/prospect-list";
import { PROSPECT_STATUS_LABELS } from "@/lib/leadfinder";
import { IconUsers } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Lead-Finder" };

const STATUS_FILTERS = [
  { key: "", label: "Offen" },
  { key: "qualified", label: PROSPECT_STATUS_LABELS.qualified },
  { key: "contacted", label: PROSPECT_STATUS_LABELS.contacted },
  { key: "interested", label: PROSPECT_STATUS_LABELS.interested },
  { key: "not_interested", label: PROSPECT_STATUS_LABELS.not_interested },
  { key: "do_not_contact", label: PROSPECT_STATUS_LABELS.do_not_contact },
] as const;

type Params = { search?: string; status?: string; page?: string };

function hrefWith(params: Params, change: Partial<Params>) {
  const next = { ...params, ...change };
  const query = new URLSearchParams();
  if (next.search) query.set("search", next.search);
  if (next.status) query.set("status", next.status);
  if (next.page && next.page !== "1") query.set("page", next.page);
  const text = query.toString();
  return text ? `/ai/leads?${text}` : "/ai/leads";
}

export default async function LeadFinderPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const params: Params = {
    search: /^[0-9a-f-]{36}$/i.test(first(raw.search) ?? "") ? first(raw.search) : undefined,
    status: STATUS_FILTERS.some((f) => f.key && f.key === first(raw.status)) ? first(raw.status) : undefined,
    page: /^\d{1,4}$/.test(first(raw.page) ?? "") ? first(raw.page) : undefined,
  };

  const overview = await getLeadFinderData();
  const list = await getProspectsData({ searchId: params.search, status: params.status, page: params.page ? Number(params.page) : 1 });
  const pages = Math.max(1, Math.ceil(list.total / list.pageSize));
  const running = overview.searches.some((s) => s.status === "queued" || s.status === "running");
  const activeSearch = overview.searches.find((s) => s.id === params.search);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <AgentAvatar agentId="lead-finder" size={88} state={running ? "working" : "idle"} title="Arda · Lead-Finder" className="hidden sm:block" />
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="AI Operations"
            title="Lead-Finder"
            description="Arda sucht bei Google Maps Betriebe einer Branche im Umkreis, prüft deren Website und liest Ansprechpartner, Telefon und E-Mail aus dem Impressum. Kontaktiert wird niemand automatisch."
          />
        </div>
      </div>

      {!overview.configured && (
        <section className="card border-amber-300 bg-amber-50/70 p-4 text-[12px] leading-relaxed text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="font-semibold">Google Places ist noch nicht eingerichtet.</p>
          <p className="mt-1">
            In der Google Cloud Console ein Projekt anlegen, „Places API (New)“ aktivieren, einen API-Key erstellen und ihn auf die Places API
            beschränken. Der Key kommt serverseitig in die Secrets-Datei (<code>GooglePlaces:ApiKey</code>), nie in den Browser.
          </p>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <LeadSearchForm
          categories={overview.categories}
          disabled={!overview.configured ? "Erst den Google-API-Key einrichten." : running ? "Eine Suche läuft gerade." : null}
        />
        <LeadSearches
          searches={overview.searches}
          usage={overview.usage}
          pendingEnrichment={overview.counts.pendingEnrichment ?? 0}
          activeSearchId={params.search}
        />
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="prospects-heading">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="prospects-heading" className="text-[14px] font-semibold text-ink">
            Leads{activeSearch ? `: ${activeSearch.categories.join(", ")} um ${activeSearch.location}` : ""}
          </h2>
          <span className="text-[12px] text-muted">{list.total}</span>
          {activeSearch && (
            <Link href={hrefWith(params, { search: undefined, page: undefined })} className="text-[11.5px] text-muted underline">
              alle Suchen
            </Link>
          )}
          <nav className="ml-auto flex flex-wrap gap-1" aria-label="Status-Filter">
            {STATUS_FILTERS.map((filter) => {
              const active = (params.status ?? "") === filter.key;
              return (
                <Link
                  key={filter.key || "open"}
                  href={hrefWith(params, { status: filter.key || undefined, page: undefined })}
                  aria-current={active ? "page" : undefined}
                  className={cn("rounded-full px-2.5 py-1 text-[11.5px]", active ? "bg-ink text-surface" : "text-muted hover:text-ink")}
                >
                  {filter.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {list.items.length === 0 ? (
          <EmptyState
            icon={<IconUsers className="h-4 w-4" />}
            title="Noch keine Leads"
            description="Starte oben eine Suche. Betriebe ohne Website stehen in der Liste ganz oben, das sind die naheliegendsten Webdesign-Kunden."
          />
        ) : (
          <ProspectList items={list.items} liveDetails={list.liveDetails} />
        )}

        {pages > 1 && (
          <nav className="flex items-center justify-center gap-3 text-[12px]" aria-label="Seiten">
            {list.page > 1 && <Link href={hrefWith(params, { page: String(list.page - 1) })} className="btn btn-ghost h-8">Zurück</Link>}
            <span className="text-muted">
              Seite {list.page} von {pages}
            </span>
            {list.page < pages && <Link href={hrefWith(params, { page: String(list.page + 1) })} className="btn btn-ghost h-8">Weiter</Link>}
          </nav>
        )}

        <p className="text-[10.5px] leading-relaxed text-subtle">
          Datenschutz: Gespeichert werden nur die Google-Place-ID und die öffentlichen Angaben aus dem Impressum des Betriebs. Beim ersten Kontakt
          muss der Betrieb erfahren, woher die Daten stammen (Art. 14 DSGVO). Wer nicht kontaktiert werden möchte, auf „Gesperrt“ setzen. Dann werden
          die Kontaktdaten gelöscht und der Betrieb taucht nicht wieder auf. Werbe-E-Mails ohne Einwilligung sind nicht erlaubt (§ 7 UWG); Anruf
          bei Firmen und Brief sind der richtige erste Schritt.
        </p>
      </section>
    </div>
  );
}
