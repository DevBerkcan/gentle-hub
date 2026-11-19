"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveTenderSettingsAction } from "@/app/actions";
import type { TenderSettings } from "@/lib/types";
import { agentName } from "@/lib/agent-personas";

const list = (value: string) =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const REGION_HINT = "DE = ganz Deutschland, DEA = NRW, DEA1 = Düsseldorf, DEA2 = Köln, DE1 = Baden-Württemberg, DE2 = Bayern, DE3 = Berlin";

/** What Nora looks for and how she describes Gentle Group. */
export function TenderSettingsForm({
  settings,
  mailboxes,
}: {
  settings: TenderSettings;
  mailboxes: { id: string; label: string; emailAddress: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    enabled: settings.enabled,
    cpv: settings.cpv.join(", "),
    regions: settings.regions.join(", "),
    keywords: settings.keywords.join(", "),
    excludeKeywords: settings.excludeKeywords.join(", "),
    minValueEur: settings.minValueEur?.toString() ?? "",
    maxValueEur: settings.maxValueEur?.toString() ?? "",
    maxScoresPerRun: String(settings.maxScoresPerRun),
    profile: settings.profile,
    mailboxConnectionId: settings.mailboxConnectionId ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setErrors({});
    setSaved(false);
    startTransition(async () => {
      const result = await saveTenderSettingsAction({
        enabled: form.enabled,
        cpv: list(form.cpv),
        regions: list(form.regions),
        keywords: list(form.keywords),
        excludeKeywords: list(form.excludeKeywords),
        minValueEur: form.minValueEur ? Number(form.minValueEur) : null,
        maxValueEur: form.maxValueEur ? Number(form.maxValueEur) : null,
        maxScoresPerRun: Number(form.maxScoresPerRun) || 15,
        profile: form.profile,
        mailboxConnectionId: form.mailboxConnectionId || null,
      });
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  const input = (key: keyof typeof form, label: string, hint?: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="flex flex-col gap-1 text-[11.5px]">
      <span className="font-semibold text-ink">{label}</span>
      <input className="input" value={form[key] as string} onChange={(event) => set(key, event.target.value as never)} {...props} />
      {hint && <span className="text-[10.5px] text-muted">{hint}</span>}
      {errors[key] && <span className="text-rose-600">{errors[key]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-[12px] font-semibold text-ink">
        <input type="checkbox" checked={form.enabled} onChange={(event) => set("enabled", event.target.checked)} />
        {agentName("tender-scout")} sucht automatisch
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {input("cpv", "CPV-Codes", "72413000 Website-Gestaltung, 72420000 Internet-Entwicklung, 72415000 Webhosting, 72422000 Webanwendungen")}
        {input("regions", "Regionen (NUTS)", REGION_HINT)}
        {input("keywords", "Suchwörter (optional)", "Leer = alles aus den CPV-Codes. Sonst muss eines vorkommen, z. B. Relaunch, Website, Buchung.")}
        {input("excludeKeywords", "Ausschlusswörter", "z. B. TikTok, SAP, 24/7")}
        {input("minValueEur", "Mindestwert (€ netto)", undefined, { inputMode: "decimal" })}
        {input("maxValueEur", "Höchstwert (€ netto)", "Darüber ist es für ein kleines Team meist zu groß.", { inputMode: "decimal" })}
        {input("maxScoresPerRun", "Höchstens bewerten pro Suche", "Begrenzt die KI-Kosten.", { inputMode: "numeric" })}
        <label className="flex flex-col gap-1 text-[11.5px]">
          <span className="font-semibold text-ink">Ausschreibungs-Postfach</span>
          <select className="input" value={form.mailboxConnectionId} onChange={(event) => set("mailboxConnectionId", event.target.value)}>
            <option value="">Keins</option>
            {mailboxes.map((mailbox) => (
              <option key={mailbox.id} value={mailbox.id}>
                {mailbox.label} ({mailbox.emailAddress})
              </option>
            ))}
          </select>
          <span className="text-[10.5px] text-muted">Mails aus diesem Postfach liest nur {agentName("tender-scout")} (Suchalarme der Portale), nicht {agentName("email-intelligence")}.</span>
          {errors.mailboxConnectionId && <span className="text-rose-600">{errors.mailboxConnectionId}</span>}
        </label>
      </div>
      <label className="flex flex-col gap-1 text-[11.5px]">
        <span className="font-semibold text-ink">Profil von Gentle Group</span>
        <textarea className="input min-h-28" maxLength={3000} value={form.profile} onChange={(event) => set("profile", event.target.value)} />
        <span className="text-[10.5px] text-muted">
          Daran misst {agentName("tender-scout")} die Passung. Referenzen, Zertifikate und Grenzen hier eintragen, {agentName("tender-scout")} erfindet nichts dazu.
        </span>
        {errors.profile && <span className="text-rose-600">{errors.profile}</span>}
      </label>
      {error && <p className="text-[11.5px] text-rose-600">{error}</p>}
      {saved && <p className="text-[11.5px] text-emerald-700">Gespeichert.</p>}
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          Speichern
        </button>
      </div>
    </form>
  );
}
