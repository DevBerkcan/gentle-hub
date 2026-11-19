import { getAgentNames, getOverviewData } from "@/lib/data";
import { requireAuth } from "@/lib/session";
import { AppShell } from "@/components/shell/app-shell";
import { AgentNamesProvider } from "@/components/ai/agent-names-provider";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = await requireAuth();
  const [overview, names] = await Promise.all([getOverviewData(), getAgentNames(token)]);

  return (
    <AgentNamesProvider names={names}>
      <AppShell user={user} counts={overview.counts}>
        {children}
      </AppShell>
    </AgentNamesProvider>
  );
}
