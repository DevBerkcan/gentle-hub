"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signaturePreviewAction, updateReplySettingsAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import type { FieldErrors } from "@/lib/action-types";
import type { ReplySettings, SignatureMode, SignaturePreview, SignatureProfile } from "@/lib/types";
import { FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconLoader, IconMoon, IconSun } from "@/components/ui/icons";

const PREVIEW_AGENTS = [
  { id: "reply-drafter", label: "Zeynep · Antwort" },
  { id: "follow-up", label: "Burak · Nachfassen" },
  { id: "customer-report", label: "Aylin · Bericht" },
] as const;

const BRAND_FIELDS: { key: keyof SignatureProfile; label: string; max: number; placeholder?: string; hint?: string }[] = [
  { key: "greeting", label: "Grußformel", max: 80 },
  { key: "company", label: "Firma", max: 80 },
  { key: "tagline", label: "Zusatzzeile", max: 120, placeholder: "Webdesign · Softwareentwicklung · KI-Lösungen" },
  { key: "contactEmail", label: "Kontakt-E-Mail", max: 120, placeholder: "leer = Adresse des sendenden Postfachs" },
  { key: "website", label: "Website", max: 120, placeholder: "https://www.gentlegroup.de" },
  { key: "phone", label: "Telefon (optional)", max: 40 },
];

/**
 * Sender name and signature for agent mails. Two modes: the original free text, or the brand
 * signature from structured fields (plain text + HTML with logo, rendered by the server).
 */
export function ReplySettingsForm({ settings }: { settings: ReplySettings }) {
  const router = useRouter();
  const [fromName, setFromName] = useState(settings.fromName);
  const [signature, setSignature] = useState(settings.signature);
  const [mode, setMode] = useState<SignatureMode>(settings.signatureMode ?? "text");
  const [brand, setBrand] = useState<SignatureProfile>(settings.brand);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof SignatureProfile>(key: K, value: SignatureProfile[K]) {
    setBrand((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setErrors({});
    setMessage(null);
    startTransition(async () => {
      const result = await updateReplySettingsAction({ fromName: fromName.trim(), signature, signatureMode: mode, brand });
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      setMessage("Gespeichert. Gilt für alle neuen Entwürfe; bereits vorbereitete Entwürfe bleiben unverändert.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-5" aria-labelledby="reply-settings-heading">
      <div>
        <h2 id="reply-settings-heading" className="text-[13px] font-semibold text-ink">
          Antworten an Kunden
        </h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          Absendername und Signatur für Mails von Zeynep, Burak und Aylin. Gesendet wird immer über das passende Postfach und
          nur nach deiner Freigabe.
        </p>
      </div>
      <FormError message={error} />
      <SuccessNote message={message} />

      <label className="flex flex-col gap-1 sm:max-w-sm">
        <span className="label">Absendername</span>
        <input className="input" value={fromName} maxLength={100} onChange={(event) => setFromName(event.target.value)} />
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="label mb-1">Signatur</legend>
        <div className="inline-flex w-fit rounded-[10px] border border-line bg-surface-2 p-0.5" role="radiogroup" aria-label="Signaturtyp">
          {(
            [
              ["brand", "Marken-Signatur mit Logo"],
              ["text", "Freitext"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                "rounded-[8px] px-3 py-1.5 text-[11.5px] font-medium transition",
                mode === value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {mode === "text" ? (
        <label className="flex flex-col gap-1">
          <span className="label">Signatur (Text)</span>
          <textarea
            className="textarea min-h-24 text-[12.5px] leading-relaxed"
            value={signature}
            maxLength={400}
            onChange={(event) => setSignature(event.target.value)}
            placeholder={"Viele Grüße\nBerk-Can Atesoglu\nGentle Group · gentlegroup.de"}
          />
          <span className="text-[10.5px] text-subtle">{signature.length}/400 Zeichen · wird als reiner Text gesendet</span>
        </label>
      ) : (
        <BrandEditor brand={brand} errors={errors} update={update} />
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          Speichern
        </button>
      </div>
    </form>
  );
}

function BrandEditor({
  brand,
  errors,
  update,
}: {
  brand: SignatureProfile;
  errors: FieldErrors;
  update: <K extends keyof SignatureProfile>(key: K, value: SignatureProfile[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {BRAND_FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col gap-1">
            <span className="label">{field.label}</span>
            <input
              className="input"
              value={brand[field.key] as string}
              maxLength={field.max}
              placeholder={field.placeholder}
              aria-invalid={Boolean(errors[`brand.${field.key}`])}
              onChange={(event) => update(field.key, event.target.value as never)}
            />
            {errors[`brand.${field.key}`] && <span className="text-[10.5px] text-rose-600">{errors[`brand.${field.key}`]}</span>}
          </label>
        ))}
      </div>

      <label className="flex flex-col gap-1">
        <span className="label">Rechtliche Angaben</span>
        <textarea
          className="textarea min-h-16 text-[12px] leading-relaxed"
          value={brand.legal}
          maxLength={400}
          placeholder="z. B. Firmierung, Inhaber, Anschrift, USt-IdNr. – nur bestätigte Angaben aus dem Impressum"
          aria-invalid={Boolean(errors["brand.legal"])}
          onChange={(event) => update("legal", event.target.value)}
        />
        <span className={cn("text-[10.5px]", errors["brand.legal"] ? "text-rose-600" : "text-subtle")}>
          {errors["brand.legal"] ?? `${brand.legal.length}/400 Zeichen · kleingedruckt unter dem Logo`}
        </span>
      </label>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-ink">
        <Check label="Agentennamen zeigen (z. B. „Zeynep · Digitaler Kundenservice“)" checked={brand.showAgent} onChange={(v) => update("showAgent", v)} />
        <Check label="HTML-Signatur mit Logo" checked={brand.html} onChange={(v) => update("html", v)} />
        <Check label="Animiertes Logo" checked={brand.animatedLogo} disabled={!brand.html} onChange={(v) => update("animatedLogo", v)} />
      </div>

      <SignaturePreviewPanel brand={brand} />
    </div>
  );
}

function Check({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className={cn("flex items-center gap-2", disabled && "opacity-50")}>
      <input type="checkbox" className="h-3.5 w-3.5 accent-current" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

/** Live preview of the unsaved settings, rendered by the server in a sandboxed frame (no scripts). */
function SignaturePreviewPanel({ brand }: { brand: SignatureProfile }) {
  const [agentId, setAgentId] = useState<string>(PREVIEW_AGENTS[0].id);
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const [dark, setDark] = useState(false);
  const [preview, setPreview] = useState<SignaturePreview | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await signaturePreviewAction(agentId, brand);
      if (cancelled) return;
      if (result.ok) {
        setPreview(result.preview);
        setProblem(null);
      } else {
        setProblem(result.error);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [agentId, brand]);

  // Force the chosen theme regardless of the app's own colour scheme.
  const html = preview
    ? preview.html
        .replace("@media (prefers-color-scheme: dark)", dark ? "@media all" : "@media not all")
        .replace('<body style="margin:0;padding:0;">', `<body style="margin:0;padding:16px;background:${dark ? "#1c1c1e" : "#ffffff"};">`)
    : "";

  return (
    <section className="flex flex-col gap-2 rounded-[12px] border border-line bg-surface-2/50 p-3" aria-label="Vorschau der Signatur">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle">Vorschau</span>
        <select className="input h-7 w-auto py-0 text-[11.5px]" value={agentId} onChange={(event) => setAgentId(event.target.value)} aria-label="Agent">
          {PREVIEW_AGENTS.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.label}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-1">
          {(["desktop", "mobile"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setWidth(value)}
              aria-pressed={width === value}
              className={cn("btn h-7 px-2 text-[11px]", width === value ? "btn-primary" : "btn-ghost")}
            >
              {value === "desktop" ? "Desktop" : "Mobil"}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDark((v) => !v)}
            aria-pressed={dark}
            aria-label={dark ? "Hellen Modus zeigen" : "Dunklen Modus zeigen"}
            className="btn btn-ghost btn-icon h-7 w-7"
          >
            {dark ? <IconSun className="h-3.5 w-3.5" /> : <IconMoon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {problem && <p className="text-[11px] text-rose-600">{problem}</p>}

      {brand.html ? (
        <div className="overflow-x-auto">
          <iframe
            title="Signatur-Vorschau"
            // No allow-scripts: nothing in the frame can run. Same origin only so the logo loads.
            sandbox="allow-same-origin"
            srcDoc={html}
            className="mx-auto block rounded-[8px] border border-line bg-white"
            style={{ width: width === "desktop" ? 620 : 360, maxWidth: "100%", height: 430 }}
          />
        </div>
      ) : (
        <p className="text-[11px] text-muted">HTML ist aus: Die Mail geht als reiner Text mit der Signatur unten.</p>
      )}

      {preview && (
        <details className="text-[11px]">
          <summary className="cursor-pointer text-muted">Klartext-Version (für Programme ohne HTML)</summary>
          <pre className="mt-1.5 whitespace-pre-wrap rounded-[8px] bg-surface p-2 font-mono text-[11px] text-ink">{preview.text}</pre>
        </details>
      )}
      {preview && brand.html && (
        <p className="text-[10.5px] text-subtle">
          Logo: {brand.animatedLogo ? "animiert (GIF, spielt einmal ab; Outlook zeigt das erste Bild)" : "statisch (PNG)"} · gesendet von{" "}
          {preview.mailbox}
        </p>
      )}
    </section>
  );
}
