"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEstimateAction } from "@/app/actions";
import { formatEur } from "@/lib/ai-format";
import type { Estimate, EstimateContent, EstimateItemInput, EstimateRole } from "@/lib/types";
import { FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconLoader, IconPlus, IconTrash } from "@/components/ui/icons";

const ROLES: { value: EstimateRole; label: string }[] = [
  { value: "pm", label: "Projektleitung" },
  { value: "design", label: "Design" },
  { value: "dev", label: "Entwicklung" },
  { value: "qa", label: "QS" },
];

const hoursFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });

function toLines(values: string[]) {
  return values.join("\n");
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Edit hours, rates and texts of an open estimate. Every save creates a new
 * approval version; amounts are always recalculated by the server.
 */
export function EstimateEditor({
  estimate,
  approvalVersion,
  editable,
}: {
  estimate: Estimate;
  approvalVersion: number;
  editable: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(estimate.title);
  const [items, setItems] = useState<EstimateItemInput[]>(
    estimate.items.map((item) => ({
      title: item.title,
      description: item.description,
      role: item.role,
      hours: item.hours,
      rateEur: item.rateEur,
      rationale: item.rationale,
    })),
  );
  const [buffer, setBuffer] = useState(estimate.totals.bufferPercent);
  const [content, setContent] = useState<EstimateContent>(estimate.content);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const baseHours = items.reduce((sum, item) => sum + (Number(item.hours) || 0), 0);
    const baseNet = items.reduce((sum, item) => sum + (Number(item.hours) || 0) * (Number(item.rateEur) || 0), 0);
    const factor = 1 + (Number(buffer) || 0) / 100;
    return { baseHours, baseNet, totalHours: baseHours * factor, totalNet: baseNet * factor };
  }, [items, buffer]);

  function updateItem(index: number, patch: Partial<EstimateItemInput>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function save() {
    setError(null);
    setMessage(null);
    if (items.some((item) => !item.title.trim() || !(Number(item.hours) > 0))) {
      setError("Jede Position braucht einen Titel und Stunden über 0.");
      return;
    }

    startTransition(async () => {
      const result = await updateEstimateAction(estimate.id, {
        expectedApprovalVersion: approvalVersion,
        title,
        bufferPercent: Number(buffer),
        content,
        items: items.map((item) => ({ ...item, hours: Number(item.hours), rateEur: Number(item.rateEur) })),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(`Gespeichert. Die Freigabe bezieht sich jetzt auf Version ${result.approvalVersion}.`);
      router.refresh();
    });
  }

  return (
    <section className="card flex flex-col gap-5 p-5" aria-labelledby="estimate-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="estimate-heading" className="text-[14px] font-semibold text-ink">
          Aufwandsschätzung
        </h2>
        {editable && (
          <button type="button" onClick={save} disabled={pending} className="btn btn-secondary h-8 text-[11.5px]">
            {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
            Änderungen speichern
          </button>
        )}
      </div>
      <FormError message={error} />
      <SuccessNote message={message} />

      <label className="flex flex-col gap-1">
        <span className="label">Titel</span>
        <input className="input" value={title} disabled={!editable} onChange={(event) => setTitle(event.target.value)} maxLength={300} />
      </label>

      <TextBlock label="1. Ist-Zustand" value={content.currentState} editable={editable} onChange={(v) => setContent({ ...content, currentState: v })} />
      <TextBlock label="2. Planung" value={content.planning} editable={editable} onChange={(v) => setContent({ ...content, planning: v })} />
      <TextBlock
        label="3. Geplante Maßnahmen (eine pro Zeile)"
        value={toLines(content.plannedMeasures)}
        editable={editable}
        onChange={(v) => setContent({ ...content, plannedMeasures: fromLines(v) })}
      />
      <TextBlock label="4. Umfang der Umsetzung" value={content.scope} editable={editable} onChange={(v) => setContent({ ...content, scope: v })} />

      <div className="flex flex-col gap-2">
        <span className="label">5./6. Leistungskomponenten und Personenstunden</span>
        <div className="overflow-x-auto rounded-[10px] border border-line">
          <table className="w-full min-w-[640px] text-left text-[12px]">
            <thead className="bg-surface-2 text-[10px] font-semibold uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-3 py-2">Position</th>
                <th className="w-32 px-2 py-2">Rolle</th>
                <th className="w-20 px-2 py-2 text-right">Std.</th>
                <th className="w-24 px-2 py-2 text-right">Satz €</th>
                <th className="w-24 px-2 py-2 text-right">Betrag</th>
                {editable && <th className="w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item, index) => (
                <tr key={index} className="align-top">
                  <td className="px-3 py-2">
                    <input
                      className="input h-8 text-[12px] font-medium"
                      value={item.title}
                      disabled={!editable}
                      onChange={(event) => updateItem(index, { title: event.target.value })}
                      aria-label="Titel der Position"
                    />
                    {item.rationale && <p className="mt-1 text-[10.5px] leading-relaxed text-muted">{item.rationale}</p>}
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className="select h-8 text-[12px]"
                      value={item.role}
                      disabled={!editable}
                      onChange={(event) => updateItem(index, { role: event.target.value as EstimateRole })}
                      aria-label="Rolle"
                    >
                      {ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      className="input h-8 text-right text-[12px] tabular-nums"
                      value={item.hours}
                      disabled={!editable}
                      onChange={(event) => updateItem(index, { hours: Number(event.target.value) })}
                      aria-label="Stunden"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className="input h-8 text-right text-[12px] tabular-nums"
                      value={item.rateEur}
                      disabled={!editable}
                      onChange={(event) => updateItem(index, { rateEur: Number(event.target.value) })}
                      aria-label="Stundensatz"
                    />
                  </td>
                  <td className="px-2 py-2 pt-3.5 text-right tabular-nums text-ink">{formatEur((Number(item.hours) || 0) * (Number(item.rateEur) || 0))}</td>
                  {editable && (
                    <td className="py-2 pr-2">
                      <button
                        type="button"
                        onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                        className="btn btn-ghost btn-icon h-8 w-8 text-rose-600"
                        aria-label="Position entfernen"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editable && (
          <button
            type="button"
            onClick={() => setItems((current) => [...current, { title: "", role: "dev", hours: 1, rateEur: current[0]?.rateEur ?? 85 }])}
            className="btn btn-ghost h-8 w-fit text-[11.5px]"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Position hinzufügen
          </button>
        )}
      </div>

      <div className="grid gap-3 rounded-[10px] bg-surface-2 p-4 text-[12px] sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-1">
          <span className="label">7. Gesamtsumme</span>
          <p className="text-muted">
            Ohne Puffer: {hoursFormat.format(totals.baseHours)} h · {formatEur(totals.baseNet)}
          </p>
          <label className="inline-flex items-center gap-2 text-muted">
            Puffer
            <input
              type="number"
              min="0"
              max="100"
              className="input h-8 w-20 text-right text-[12px]"
              value={buffer}
              disabled={!editable}
              onChange={(event) => setBuffer(Number(event.target.value))}
            />
            %
          </label>
        </div>
        <p className="self-end text-right">
          <span className="block font-display text-[22px] font-semibold tabular-nums text-ink">{formatEur(totals.totalNet)}</span>
          <span className="text-muted">{hoursFormat.format(totals.totalHours)} h netto inkl. Puffer</span>
        </p>
      </div>

      <TextBlock
        label="8. Annahmen (eine pro Zeile)"
        value={toLines(content.assumptions)}
        editable={editable}
        onChange={(v) => setContent({ ...content, assumptions: fromLines(v) })}
      />
      <TextBlock
        label="8. Abhängigkeiten (eine pro Zeile)"
        value={toLines(content.dependencies)}
        editable={editable}
        onChange={(v) => setContent({ ...content, dependencies: fromLines(v) })}
      />
      <TextBlock
        label="9. Nicht enthaltene Leistungen (eine pro Zeile)"
        value={toLines(content.exclusions)}
        editable={editable}
        onChange={(v) => setContent({ ...content, exclusions: fromLines(v) })}
      />
      <TextBlock
        label="10. Risiken (eine pro Zeile)"
        value={toLines(content.risks.map((risk) => risk.description ?? "").filter(Boolean))}
        editable={editable}
        onChange={(v) => setContent({ ...content, risks: fromLines(v).map((description) => ({ description })) })}
      />
    </section>
  );
}

function TextBlock({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label">{label}</span>
      {editable ? (
        <textarea className="textarea min-h-16 text-[12.5px] leading-relaxed" value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">{value || "–"}</p>
      )}
    </label>
  );
}
