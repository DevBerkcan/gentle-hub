import type { Metadata } from "next";
import Link from "next/link";
import { getVoiceNotesData } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { VoiceNoteCard } from "@/components/ai/voice-note-card";
import { IconMail } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Sprachnotizen" };

export default async function VoiceNotesPage({ searchParams }: { searchParams: Promise<{ note?: string | string[] }> }) {
  const params = await searchParams;
  const highlight = Array.isArray(params.note) ? params.note[0] : params.note;
  const notes = await getVoiceNotesData();
  const open = notes.filter((note) => !note.isDone).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <AgentAvatar
          agentId="voice-notes"
          size={88}
          state={notes.some((note) => note.status === "processing") ? "working" : "idle"}
          title="Deniz · Sprachnotizen"
          className="hidden sm:block"
        />
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="AI Operations"
            title="Sprachnotizen"
            description={`Sprich nach einem Termin einfach eine Sprachnachricht an den GentleHub-Bot in Telegram (oder tippe eine Notiz). Deniz schreibt sie ab, ordnet sie dem Projekt zu und macht Aufgaben, Entscheidungen und offene Fragen daraus. ${open} offen.`}
          />
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<IconMail className="h-4 w-4" />}
          title="Noch keine Notizen"
          description="Telegram muss unter Verbindungen gekoppelt sein. Dann einfach eine Sprachnachricht an den Bot schicken."
          action={
            <Link href="/ai/connections" className="btn btn-secondary">
              Zu den Verbindungen
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <VoiceNoteCard key={note.id} note={note} highlight={note.id === highlight} />
          ))}
        </div>
      )}
    </div>
  );
}
