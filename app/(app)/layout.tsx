import { getOverviewData } from "@/lib/data";
import { requireAuth } from "@/lib/session";
import { AppShell } from "@/components/shell/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAuth();
  const overview = await getOverviewData();

  return (
    <AppShell user={user} counts={overview.counts}>
      {children}
    </AppShell>
  );
}
