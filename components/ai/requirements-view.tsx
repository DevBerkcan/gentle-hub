import type { RequirementsContent } from "@/lib/types";

/** Defne's requirements: description, user stories, scope and the classic lists. Renders on the server. */
export function RequirementsView({ content, compact = false }: { content: RequirementsContent; compact?: boolean }) {
  const stories = (content.userStories ?? []).filter((story) => story.goal?.trim());
  return (
    <div className="flex flex-col gap-3">
      {content.projectDescription && <p className="text-[12px] leading-relaxed text-ink">{content.projectDescription}</p>}

      {stories.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-subtle">User Stories</h3>
          <ul className="mt-1 flex flex-col gap-2">
            {stories.map((story, index) => (
              <li key={index} className="rounded-lg border border-line bg-surface-2/50 px-3 py-2 text-[11.5px] leading-relaxed text-ink">
                <p>
                  Als <strong>{strip(story.role, /^als\s+/i) || "Nutzer:in"}</strong> möchte ich {strip(story.goal, /^(?:ich\s+)?möchte\s+(?:ich\s+)?/i)}
                  {story.benefit ? <>, damit {strip(story.benefit, /^,?\s*damit\s+/i)}</> : null}.
                </p>
                {!compact && (story.acceptanceCriteria ?? []).length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-[11px] text-muted">
                    {story.acceptanceCriteria!.map((criterion, i) => (
                      <li key={i}>{criterion}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={compact ? "flex flex-col gap-3" : "grid gap-3 sm:grid-cols-2"}>
        <RequirementList title="Gehört dazu" items={content.inScope} />
        <RequirementList title="Gehört nicht dazu" items={content.outOfScope} />
        <RequirementList title="Seiten" items={content.pages} />
        <RequirementList title="Anbindungen" items={content.integrations} />
        <RequirementList title="Fachliche Anforderungen" items={content.businessRequirements} />
        <RequirementList title="Technische Anforderungen" items={content.technicalRequirements} />
        <RequirementList title="Offene Fragen" items={content.openQuestions} />
        <RequirementList title="Risiken" items={content.risks} />
      </div>
      <RequirementList title="Aufgaben" items={content.tasks?.map((task) => task.title ?? "")} />
    </div>
  );
}

/** The model sometimes repeats the sentence frame ("Als …", "möchte ich …", "damit …") inside the fields. */
function strip(value: string | undefined, prefix: RegExp) {
  return (value ?? "").trim().replace(prefix, "").replace(/[.\s]+$/, "");
}

export function RequirementList({ title, items }: { title: string; items?: (string | undefined)[] }) {
  const values = (items ?? []).filter((item): item is string => Boolean(item?.trim()));
  if (values.length === 0) return null;
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-subtle">{title}</h3>
      <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4 text-[11.5px] leading-relaxed text-ink">
        {values.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ul>
    </div>
  );
}
