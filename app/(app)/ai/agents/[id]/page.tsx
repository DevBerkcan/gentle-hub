import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getAiAgentData } from "@/lib/data";
import { formatEur, formatTokens, TRIGGER_LABELS } from "@/lib/ai-format";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { AgentSettingsForm } from "@/components/ai/agent-settings-form";
import { PromptEditor } from "@/components/ai/prompt-editor";
import { RunList } from "@/components/ai/run-list";
import { TestRunButton } from "@/components/ai/ai-buttons";
import { IconChevronLeft } from "@/components/ui/icons";

type PageParams = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  try {
    const { agent } = await getAiAgentData(id);
    return { title: agent.name };
  } catch {
    return { title: "Agent" };
  }
}

export default async function AiAgentPage({ params }: PageParams) {
  const { id } = await params;
  let detail;
  try {
    detail = await getAiAgentData(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { agent, prompts, recentRuns } = detail;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/ai/agents" className="inline-flex w-fit items-center gap-1 text-[11.5px] font-semibold text-muted hover:text-ink">
        <IconChevronLeft className="h-3.5 w-3.5" />
        Alle Agenten
      </Link>
      <div className="flex items-start gap-4">
        <AgentAvatar agentId={agent.id} size={88} state={agent.isEnabled ? "idle" : "off"} title={agent.name} className="hidden sm:block" />
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow={`Agent · ${agent.id}`}
            title={agent.name}
            description={agent.description}
            action={<TestRunButton agentId={agent.id} />}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <AgentSettingsForm agent={agent} />
          <PromptEditor agentId={agent.id} currentVersion={agent.promptVersion} prompts={prompts} />
        </div>

        <aside className="flex flex-col gap-5">
          <section className="card p-4">
            <h2 className="text-[12.5px] font-semibold text-ink">Dieser Monat</h2>
            <dl className="mt-3 flex flex-col gap-2 text-[12px]">
              <Row label="Ausführungen">{agent.month.runs}</Row>
              <Row label="Fehlgeschlagen">{agent.month.failedRuns}</Row>
              <Row label="Tokens Ein/Aus">
                {formatTokens(agent.month.inputTokens)} / {formatTokens(agent.month.outputTokens)}
              </Row>
              <Row label="Kosten">{formatEur(agent.month.costEur)}</Row>
              <Row label="Budget">{agent.monthlyBudgetEur == null ? "nur global" : formatEur(agent.monthlyBudgetEur)}</Row>
            </dl>
          </section>
          <section className="card p-4">
            <h2 className="text-[12.5px] font-semibold text-ink">Auslöser & Werkzeuge</h2>
            <p className="mt-2 text-[11.5px] text-muted">{TRIGGER_LABELS[agent.triggerType] ?? agent.triggerType}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {agent.allowedTools.map((tool) => (
                <li key={tool} className="rounded-[5px] bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-2">
                  {tool}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10.5px] text-subtle">
              Zuletzt geändert {formatDateTime(agent.updatedAt)} · {agent.updatedBy ?? "–"}
            </p>
          </section>
        </aside>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="agent-runs-heading">
        <h2 id="agent-runs-heading" className="text-[14px] font-semibold text-ink">
          Ausführungshistorie
        </h2>
        <RunList runs={recentRuns} showAgent={false} emptyTitle="Dieser Agent ist noch nicht gelaufen" />
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium tabular-nums text-ink">{children}</dd>
    </div>
  );
}
