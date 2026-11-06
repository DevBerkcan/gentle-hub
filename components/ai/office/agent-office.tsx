"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { OfficeFlow, OfficeRoom } from "@/components/ai/office/office-scene";

const OfficeScene = dynamic(() => import("@/components/ai/office/office-scene").then((module) => module.OfficeScene), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-[12px] text-white/50">Büro wird eingerichtet …</div>
  ),
});

/**
 * Isometric 3D office: every department is a room, every agent a small robot that
 * walks around and sits down at its desk while it works. Light beams show how work
 * flows between rooms. Refreshes itself every 30 seconds.
 */
export function AgentOffice({
  rooms,
  flows,
  height = 480,
  showLegend = true,
}: {
  rooms: OfficeRoom[];
  flows: OfficeFlow[];
  height?: number | string;
  showLegend?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 30_000);
    return () => window.clearInterval(timer);
  }, [router]);

  const working = rooms.flatMap((room) => room.agents).filter((agent) => agent.working);

  return (
    <section
      aria-label="Agenten-Büro"
      className="relative overflow-hidden rounded-[16px] border border-[#1d2647] bg-[radial-gradient(ellipse_at_top,#18213f_0%,#0a0f1f_60%,#070b16_100%)] shadow-card"
      style={{ height }}
    >
      <OfficeScene rooms={rooms} flows={flows} />

      {showLegend && (
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1">
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10.5px] font-semibold text-white/80 backdrop-blur">
            {working.length > 0 ? `${working.length} ${working.length === 1 ? "Agent arbeitet" : "Agenten arbeiten"} gerade` : "Alle Agenten in Bereitschaft"}
          </span>
        </div>
      )}
      <p className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-white/35">Ziehen zum Drehen · Klick auf Raum oder Agent</p>

      {/* Text version for screen readers and as a fallback without WebGL. */}
      <ul className="sr-only">
        {rooms.map((room) => (
          <li key={room.key}>
            <Link href={room.href}>
              {room.title}: {room.subtitle}
            </Link>
            <ul>
              {room.agents.map((agent) => (
                <li key={agent.id} className={cn(agent.working && "font-semibold")}>
                  <Link href={agent.href}>
                    {agent.name}
                    {agent.working ? " (arbeitet gerade)" : agent.enabled ? "" : " (ausgeschaltet)"}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
