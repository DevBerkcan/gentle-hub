import { HubShell } from "@/components/hub/hub-shell";
import { requireUser } from "@/lib/session";
import { getVault, listApplications, listFavoriteIds } from "@/lib/repo";

export default async function Home() {
  const user = await requireUser();
  const [applications, favorites, vault] = await Promise.all([
    listApplications(),
    listFavoriteIds(user.id),
    getVault(),
  ]);

  return <HubShell applications={applications} favorites={favorites} vault={vault} user={{ email: user.email }} />;
}
