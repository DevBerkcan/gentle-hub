import type { Metadata } from "next";
import Link from "next/link";
import { getEmailConnectionsData, getEmailsData } from "@/lib/data";
import { IMPORTANCE } from "@/lib/ai-format";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/page-header";
import { EmailList } from "@/components/ai/email-list";
import { IconArrowRight } from "@/components/ui/icons";

export const metadata: Metadata = { title: "E-Mail Intelligence" };

type Search = { customer?: string | string[]; importance?: string | string[]; mailbox?: string | string[] };

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AiEmailsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const customerOnly = first(params.customer) === "1";
  const rawImportance = first(params.importance);
  const importance = rawImportance && rawImportance in IMPORTANCE ? rawImportance : undefined;
  const mailbox = first(params.mailbox) || undefined;

  const [emails, connections] = await Promise.all([
    getEmailsData(mailbox, customerOnly, importance),
    getEmailConnectionsData(),
  ]);

  function href(next: Partial<{ customer: boolean; importance: string | undefined; mailbox: string | undefined }>) {
    const query = new URLSearchParams();
    const c = next.customer ?? customerOnly;
    const i = "importance" in next ? next.importance : importance;
    const m = "mailbox" in next ? next.mailbox : mailbox;
    if (c) query.set("customer", "1");
    if (i) query.set("importance", i);
    if (m) query.set("mailbox", m);
    return query.size > 0 ? `/ai/emails?${query.toString()}` : "/ai/emails";
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Operations"
        title="E-Mail Intelligence"
        description="Eingegangene Nachrichten mit Einordnung, Zusammenfassung, Anforderungen und empfohlenen Maßnahmen."
        action={
          <Link href="/ai/connections" className="btn btn-ghost">
            Postfächer verwalten
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <nav className="flex flex-wrap items-center gap-1.5" aria-label="Filter">
        <Link href={href({ customer: !customerOnly })} className={cn("chip", customerOnly && "bg-navy text-white")} aria-pressed={customerOnly}>
          Nur Kundenanfragen
        </Link>
        <span className="mx-1 h-4 w-px bg-line" />
        <Link href={href({ importance: undefined })} className={cn("chip", !importance && "bg-navy text-white")}>
          Alle
        </Link>
        {(["urgent", "high", "normal", "low"] as const).map((key) => (
          <Link key={key} href={href({ importance: key })} className={cn("chip", importance === key && "bg-navy text-white")}>
            {IMPORTANCE[key].label}
          </Link>
        ))}
        {connections.items.length > 1 && (
          <>
            <span className="mx-1 h-4 w-px bg-line" />
            <Link href={href({ mailbox: undefined })} className={cn("chip", !mailbox && "bg-navy text-white")}>
              Alle Postfächer
            </Link>
            {connections.items.map((connection) => (
              <Link
                key={connection.id}
                href={href({ mailbox: connection.id })}
                className={cn("chip", mailbox === connection.id && "bg-navy text-white")}
              >
                {connection.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <EmailList
        emails={emails}
        emptyDescription={
          connections.items.length === 0 ? "Verbinde zuerst unter „Verbindungen“ ein Postfach." : undefined
        }
      />
    </div>
  );
}
