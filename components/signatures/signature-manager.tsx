"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteEmployeeSignatureAction, previewEmployeeSignatureAction, saveEmployeeSignatureAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import type { FieldErrors } from "@/lib/action-types";
import type { EmployeeSignature, EmployeeSignatureInput, EmployeeSignatureList } from "@/lib/types";
import { FormError } from "@/components/ui/field";
import { IconCheck, IconCopy, IconLoader, IconPlus, IconTrash } from "@/components/ui/icons";

const EMPTY: EmployeeSignatureInput = {
  name: "",
  role: "",
  email: "",
  phone: "",
  mobile: "",
  includeGreeting: true,
  animatedLogo: true,
};

const FIELDS: { key: "name" | "role" | "email" | "phone" | "mobile"; label: string; max: number; placeholder: string; type?: string }[] = [
  { key: "name", label: "Name", max: 100, placeholder: "Vorname Nachname" },
  { key: "role", label: "Rolle", max: 100, placeholder: "z. B. Projektleitung" },
  { key: "email", label: "E-Mail", max: 120, placeholder: "name@gentlegroup.de", type: "email" },
  { key: "phone", label: "Telefon (optional)", max: 40, placeholder: "+49 202 …" },
  { key: "mobile", label: "Mobil (optional)", max: 40, placeholder: "+49 170 …" },
];

type Draft = { key: string; id: string | null; values: EmployeeSignatureInput; saved?: EmployeeSignature };

function toInput(signature: EmployeeSignature): EmployeeSignatureInput {
  const { name, role, email, phone, mobile, includeGreeting, animatedLogo } = signature;
  return { name, role, email, phone, mobile, includeGreeting, animatedLogo };
}

/** Team signatures: one card per person, live preview and copy buttons for the mail client. */
export function SignatureManager({ initial }: { initial: EmployeeSignatureList }) {
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    initial.items.map((item) => ({ key: item.id, id: item.id, values: toInput(item), saved: item })),
  );

  function add() {
    setDrafts((current) => [{ key: `new-${Date.now()}`, id: null, values: { ...EMPTY } }, ...current]);
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="card flex flex-wrap items-center gap-3 p-4">
        <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-muted">
          Firma, Zusatzzeile, Website, Logo und rechtliche Angaben kommen zentral aus der{" "}
          <Link href="/ai/settings" className="font-medium text-ink underline underline-offset-2">
            Marken-Signatur
          </Link>
          . Ändert sich dort etwas, sind alle Signaturen hier sofort aktualisiert. Danach einmal neu kopieren.
          {!initial.brandActive && " (Die Marken-Signatur ist für die Agenten gerade nicht aktiv; für die Signaturen hier gilt sie trotzdem.)"}
        </p>
        <button type="button" onClick={add} className="btn btn-primary">
          <IconPlus className="h-3.5 w-3.5" />
          Neue Signatur
        </button>
      </section>

      {drafts.length === 0 && (
        <section className="card p-6 text-center text-[12.5px] text-muted">
          Noch keine Signaturen. Lege mit „Neue Signatur“ die erste an, zum Beispiel deine eigene.
        </section>
      )}

      {drafts.map((draft) => (
        <SignatureCard
          key={draft.key}
          draft={draft}
          onSaved={(saved) =>
            setDrafts((current) =>
              current.map((d) => (d.key === draft.key ? { ...d, id: saved.id, values: toInput(saved), saved } : d)),
            )
          }
          onRemoved={() => setDrafts((current) => current.filter((d) => d.key !== draft.key))}
        />
      ))}

      <HowToInsert />
    </div>
  );
}

function SignatureCard({
  draft,
  onSaved,
  onRemoved,
}: {
  draft: Draft;
  onSaved: (signature: EmployeeSignature) => void;
  onRemoved: () => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState<EmployeeSignatureInput>(draft.values);
  const [preview, setPreview] = useState<EmployeeSignature | null>(draft.saved ?? null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = !draft.saved || JSON.stringify(values) !== JSON.stringify(toInput(draft.saved));

  // Live preview while editing; the saved version is shown as long as nothing changed.
  useEffect(() => {
    if (!dirty) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await previewEmployeeSignatureAction(values);
      if (cancelled) return;
      if (result.ok) {
        setPreview(result.signature);
        setErrors({});
      } else {
        setErrors(result.errors ?? {});
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [values, dirty]);

  function set<K extends keyof EmployeeSignatureInput>(key: K, value: EmployeeSignatureInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveEmployeeSignatureAction(draft.id, values);
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      setErrors({});
      setPreview(result.signature);
      onSaved(result.signature);
      router.refresh();
    });
  }

  function remove() {
    if (!draft.id) {
      onRemoved();
      return;
    }
    if (!window.confirm(`Signatur für ${draft.saved?.name ?? "diese Person"} wirklich löschen?`)) return;
    startTransition(async () => {
      const result = await deleteEmployeeSignatureAction(draft.id!);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onRemoved();
      router.refresh();
    });
  }

  async function copy(kind: "rich" | "html" | "text") {
    if (!preview) return;
    try {
      if (kind === "rich" && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([preview.html], { type: "text/html" }),
            "text/plain": new Blob([preview.text], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(kind === "text" ? preview.text : preview.html);
      }
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Kopieren hat nicht geklappt. Bitte erlaube den Zugriff auf die Zwischenablage oder kopiere den HTML-Code.");
    }
  }

  const title = values.name.trim() || "Neue Signatur";

  return (
    <section className="card grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]" aria-label={`Signatur ${title}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{title}</h2>
          {dirty && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">ungespeichert</span>}
        </div>
        <FormError message={error} />
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <label key={field.key} className={cn("flex flex-col gap-1", field.key === "email" && "sm:col-span-2")}>
              <span className="label">{field.label}</span>
              <input
                className="input"
                type={field.type ?? "text"}
                value={values[field.key]}
                maxLength={field.max}
                placeholder={field.placeholder}
                aria-invalid={Boolean(errors[field.key])}
                onChange={(event) => set(field.key, event.target.value)}
              />
              {errors[field.key] && <span className="text-[10.5px] text-rose-600">{errors[field.key]}</span>}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-ink">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-3.5 w-3.5" checked={values.includeGreeting} onChange={(e) => set("includeGreeting", e.target.checked)} />
            Grußformel aufnehmen
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-3.5 w-3.5" checked={values.animatedLogo} onChange={(e) => set("animatedLogo", e.target.checked)} />
            Animiertes Logo
          </label>
        </div>
        <div className="mt-auto flex flex-wrap justify-between gap-2 pt-1">
          <button type="button" onClick={remove} disabled={pending} className="btn btn-ghost text-rose-600">
            <IconTrash className="h-3.5 w-3.5" />
            {draft.id ? "Löschen" : "Verwerfen"}
          </button>
          <button type="button" onClick={save} disabled={pending || !dirty} className="btn btn-primary">
            {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
            {draft.id ? "Speichern" : "Anlegen"}
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <iframe
          title={`Vorschau ${title}`}
          // No allow-scripts: nothing in the frame can run. Same origin only so the logo loads.
          sandbox="allow-same-origin"
          srcDoc={
            preview
              ? `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:16px;background:#ffffff;">${preview.html}</body></html>`
              : ""
          }
          className="h-[340px] w-full rounded-[10px] border border-line bg-white"
        />
        <div className="flex flex-wrap gap-2">
          <CopyButton label="Signatur kopieren" done={copied === "rich"} onClick={() => copy("rich")} primary disabled={!preview} />
          <CopyButton label="HTML-Code" done={copied === "html"} onClick={() => copy("html")} disabled={!preview} />
          <CopyButton label="Text" done={copied === "text"} onClick={() => copy("text")} disabled={!preview} />
        </div>
        <p className="text-[10.5px] text-subtle">
          „Signatur kopieren“ = formatiert, zum Einfügen in Gmail, Outlook oder Apple Mail.
          {dirty && preview && " Zeigt die ungespeicherten Änderungen; kopieren geht auch ohne Speichern."}
        </p>
      </div>
    </section>
  );
}

function CopyButton({
  label,
  done,
  primary,
  disabled,
  onClick,
}: {
  label: string;
  done: boolean;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn("btn h-8 text-[11.5px]", primary ? "btn-primary" : "btn-ghost")}>
      {done ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
      {done ? "Kopiert" : label}
    </button>
  );
}

function HowToInsert() {
  const steps: [string, string][] = [
    ["Gmail", "Einstellungen (Zahnrad) → Alle Einstellungen → Allgemein → Signatur → Neu erstellen → mit Strg+V einfügen → unten „Änderungen speichern“."],
    ["Outlook (neu / Web)", "Einstellungen → Konten → Signaturen → Neue Signatur → mit Strg+V einfügen → Speichern; als Standard für neue Mails und Antworten wählen."],
    ["Outlook (klassisch)", "Datei → Optionen → E-Mail → Signaturen → Neu → in das Editorfeld mit Strg+V einfügen → OK."],
    ["Apple Mail", "Mail → Einstellungen → Signaturen → + → einfügen; „Immer meiner Standardschrift entsprechen“ abwählen, damit das Layout bleibt."],
    ["iPhone", "Einstellungen → Apps → Mail → Signatur → einfügen. iOS übernimmt nur einfache Formatierung; das Logo fehlt dort meist."],
  ];

  return (
    <section className="card p-5" aria-labelledby="howto-heading">
      <h2 id="howto-heading" className="text-[13px] font-semibold text-ink">
        So kommt die Signatur ins Mailprogramm
      </h2>
      <p className="mt-1 text-[11.5px] text-muted">
        „Signatur kopieren“ legt die fertige, formatierte Signatur in die Zwischenablage. Dann im Mailprogramm einfügen:
      </p>
      <dl className="mt-3 grid gap-2.5 text-[12px] sm:grid-cols-2">
        {steps.map(([client, text]) => (
          <div key={client} className="rounded-[10px] border border-line p-3">
            <dt className="font-semibold text-ink">{client}</dt>
            <dd className="mt-0.5 leading-relaxed text-muted">{text}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[10.5px] text-subtle">
        Das Logo wird von gentle-hub.vercel.app geladen. Manche Empfänger sehen es erst nach „Bilder anzeigen“. Den HTML-Code brauchst du nur für
        Programme, die HTML-Signaturen direkt annehmen (z. B. Thunderbird).
      </p>
    </section>
  );
}
