import type { Metadata } from "next";
import Link from "next/link";
import { getBriefingData } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { BriefingCard } from "@/components/ai/briefing-card";

export const metadata: Metadata = { title: "Tagesbriefing" };

export default async function BriefingPage() {
  const briefing = await getBriefingData();
  const items = briefing?.facts.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Operations"
        title="Tagesbriefing"
        description="Leyla schaut jeden Morgen auf alles, was Aufmerksamkeit braucht, und sagt dir, womit du anfangen solltest. Das Briefing kommt auch per Telegram (Einstellung „Morgendliche Zusammenfassung“)."
      />
      <BriefingCard briefing={briefing} />

      {items.length > 0 && (
        <section className="flex flex-col gap-2" aria-labelledby="all-items">
          <h2 id="all-items" className="text-[13px] font-semibold text-ink">
            Alles, was Leyla gesehen hat
          </h2>
          <ul className="card divide-y divide-line overflow-hidden">
            {items.map((item) => (
              <li key={item.key}>
                <Link href={item.link} className="flex items-center gap-3 px-4 py-2.5 text-[12px] transition hover:bg-surface-2">
                  <span className="w-20 shrink-0 text-[10.5px] font-semibold uppercase tracking-wide text-subtle">{item.category}</span>
                  <span className="min-w-0 flex-1 truncate font-medium text-ink">{item.title}</span>
                  <span className="shrink-0 text-[11px] text-muted">{item.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
