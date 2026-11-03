import type { Metadata } from "next";
import Link from "next/link";
import { getApprovalsData } from "@/lib/data";
import { APPROVAL_STATUS, formatEur } from "@/lib/ai-format";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { IconCheck, IconChevronRight } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Freigaben" };

export default async function AiApprovalsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const params = await searchParams;
  const raw = Array.isArray(params.status) ? params.status[0] : params.status;
  const status = raw === "done" ? "done" : raw === "all" ? undefined : "open";
  const items = await getApprovalsData(status);

  const tabs = [
    { key: "open", label: "Offen" },
    { key: "done", label: "Erledigt" },
    { key: "all", label: "Alle" },
  ];
  const active = raw === "done" || raw === "all" ? raw : "open";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Operations"
        title="Freigaben"
        description="Alles, was Agenten vorbereitet haben und auf deine Entscheidung wartet. Nichts geht ohne deine Freigabe nach außen."
      />

      <nav className="flex gap-1" aria-label="Filter">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "open" ? "/ai/approvals" : `/ai/approvals?status=${tab.key}`}
            aria-current={active === tab.key ? "page" : undefined}
            className={cn("chip", active === tab.key && "bg-navy text-white")}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconCheck className="h-4 w-4" />}
          title={active === "open" ? "Keine offenen Freigaben" : "Noch nichts entschieden"}
          description="Sobald der Schätz-Agent eine Kundenanfrage bearbeitet hat, erscheint sie hier. Telegram meldet sich zusätzlich."
        />
      ) : (
        <ul className="card divide-y divide-line">
          {items.map((item) => {
            const meta = APPROVAL_STATUS[item.status] ?? APPROVAL_STATUS.pending;
            return (
              <li key={item.id}>
                <Link href={`/ai/approvals/${item.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2/60">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold", meta.className)}>{meta.label}</span>
                      <span className="truncate text-[13px] font-semibold text-ink">{item.title}</span>
                    </div>
                    <p className="mt-1 text-[11.5px] text-muted">
                      {item.customerName ?? "Kunde noch nicht zugeordnet"}
                      {item.totalHours != null && ` · ${item.totalHours.toLocaleString("de-DE")} h · ${formatEur(item.totalNetEur)}`}
                      {" · "}
                      <time dateTime={item.createdAt} title={formatDateTime(item.createdAt)}>
                        {formatRelative(item.createdAt)}
                      </time>
                      {item.decidedBy && ` · entschieden von ${item.decidedBy}`}
                    </p>
                  </div>
                  <IconChevronRight className="h-4 w-4 shrink-0 text-subtle" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
