import { applications } from "@/data/applications";
import { HubShell } from "@/components/hub/hub-shell";

export default function Home() {
  return <HubShell applications={applications} />;
}
