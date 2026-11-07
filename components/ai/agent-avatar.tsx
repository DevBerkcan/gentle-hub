"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type Palette = { light: string; base: string; dark: string; eye: string };

type Persona = {
  palette: Palette;
  /** Glyph on the chest plate, drawn in a 20×20 box centred on (60, 88). */
  glyph: React.ReactNode;
  accessory?: "headset" | "pencil" | "radar" | "glasses";
};

const stroke = { fill: "none", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const PERSONAS: Record<string, Persona> = {
  "email-intelligence": {
    palette: { light: "#a5d8ff", base: "#3b82f6", dark: "#1e3a8a", eye: "#7df9ff" },
    glyph: (
      <g {...stroke}>
        <rect x="52" y="82" width="16" height="11" rx="2" />
        <path d="m52.5 83 7.5 6 7.5-6" />
      </g>
    ),
  },
  "crm-matching": {
    palette: { light: "#d8c4ff", base: "#8b5cf6", dark: "#4c1d95", eye: "#c4f1ff" },
    glyph: (
      <g {...stroke}>
        <circle cx="56" cy="88" r="4" />
        <circle cx="64" cy="88" r="4" />
      </g>
    ),
    accessory: "glasses",
  },
  "project-notes": {
    palette: { light: "#ffe08a", base: "#f59e0b", dark: "#92400e", eye: "#fff7c2" },
    glyph: (
      <g {...stroke}>
        <path d="M54 83h12M54 88h12M54 93h7" />
      </g>
    ),
    accessory: "pencil",
  },
  estimation: {
    palette: { light: "#a7f3d0", base: "#10b981", dark: "#065f46", eye: "#d6fff1" },
    glyph: (
      <g {...stroke}>
        <path d="M66 83.5a6 6 0 1 0 0 9M52.5 86.5h9M52.5 89.5h9" />
      </g>
    ),
  },
  "reply-drafter": {
    palette: { light: "#fecdd3", base: "#f43f5e", dark: "#881337", eye: "#ffe4ea" },
    glyph: (
      <g {...stroke}>
        <path d="M52 83.5h16v8.5h-9l-4 3v-3h-3z" />
      </g>
    ),
  },
  "support-triage": {
    palette: { light: "#fed7aa", base: "#f97316", dark: "#7c2d12", eye: "#fff1df" },
    glyph: (
      <g {...stroke}>
        <path d="M60 81v8M60 94v.5" />
      </g>
    ),
    accessory: "headset",
  },
  "follow-up": {
    palette: { light: "#c7d2fe", base: "#6366f1", dark: "#312e81", eye: "#e0e7ff" },
    glyph: (
      <g {...stroke}>
        <circle cx="60" cy="88" r="6.5" />
        <path d="M60 84.5V88l2.5 2" />
      </g>
    ),
  },
  "daily-briefing": {
    palette: { light: "#fef08a", base: "#eab308", dark: "#713f12", eye: "#fefce8" },
    glyph: (
      <g {...stroke}>
        <circle cx="60" cy="88" r="3.5" />
        <path d="M60 80.5v2M60 93.5v2M52.5 88h2M65.5 88h2M54.7 82.7l1.4 1.4M63.9 91.9l1.4 1.4M54.7 93.3l1.4-1.4M63.9 84.1l1.4-1.4" />
      </g>
    ),
  },
  "draft-review": {
    palette: { light: "#99f6e4", base: "#14b8a6", dark: "#134e4a", eye: "#f0fdfa" },
    glyph: (
      <g {...stroke}>
        <path d="m54 88.5 4 4 8-9" />
      </g>
    ),
    accessory: "glasses",
  },
  "voice-notes": {
    palette: { light: "#bae6fd", base: "#0ea5e9", dark: "#0c4a6e", eye: "#e0f2fe" },
    glyph: (
      <g {...stroke}>
        <rect x="57" y="81" width="6" height="9" rx="3" />
        <path d="M54 87.5a6 6 0 0 0 12 0M60 93.5v1.5" />
      </g>
    ),
    accessory: "headset",
  },
  "customer-report": {
    palette: { light: "#f5d0fe", base: "#d946ef", dark: "#701a75", eye: "#fdf4ff" },
    glyph: (
      <g {...stroke}>
        <path d="M53 94V88M58 94V84M63 94V86M68 94V82" />
      </g>
    ),
    accessory: "pencil",
  },
  "lead-check": {
    palette: { light: "#d9f99d", base: "#84cc16", dark: "#365314", eye: "#f7fee7" },
    glyph: (
      <g {...stroke}>
        <circle cx="58.5" cy="86.5" r="5" />
        <path d="m62.3 90.3 4.2 4.2" />
      </g>
    ),
    accessory: "glasses",
  },
  "website-monitor": {
    palette: { light: "#a5f3fc", base: "#06b6d4", dark: "#164e63", eye: "#e0fdff" },
    glyph: (
      <g {...stroke}>
        <path d="M51 88h4l2.5-5 4 10 2.5-5H69" />
      </g>
    ),
    accessory: "radar",
  },
  outreach: {
    palette: { light: "#bbf7d0", base: "#22c55e", dark: "#14532d", eye: "#f0fdf4" },
    glyph: (
      <g {...stroke}>
        <path d="M52 84h16v10H52z" />
        <path d="m52 84 8 6 8-6" />
      </g>
    ),
    accessory: "headset",
  },
  "lead-finder": {
    palette: { light: "#fde68a", base: "#f59e0b", dark: "#78350f", eye: "#fffbeb" },
    glyph: (
      <g {...stroke}>
        <path d="M60 95s-6-6.2-6-10.5a6 6 0 0 1 12 0C66 88.8 60 95 60 95z" />
        <circle cx="60" cy="84.5" r="2" />
      </g>
    ),
    accessory: "radar",
  },
};

const FALLBACK: Persona = {
  palette: { light: "#d1d5db", base: "#64748b", dark: "#1e293b", eye: "#e2e8f0" },
  glyph: (
    <g {...stroke}>
      <path d="M60 82l1.8 4.2 4.2 1.8-4.2 1.8L60 94l-1.8-4.2L54 88l4.2-1.8z" />
    </g>
  ),
};

function delayFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return `${-(Math.abs(hash) % 3000)}ms`;
}

/**
 * Small animated robot with a soft 3D look (lit gradients, glass visor, ground
 * shadow). It floats, blinks and its antenna glows; "working" speeds it up,
 * "off" greys it out. Pure SVG + CSS, so dozens can be on one page.
 */
export function AgentAvatar({
  agentId,
  size = 48,
  state = "idle",
  className,
  title,
}: {
  agentId: string;
  size?: number;
  state?: "idle" | "working" | "off" | "alert";
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const persona = PERSONAS[agentId] ?? FALLBACK;
  const { light, base, dark, eye } = persona.palette;
  const eyeColor = state === "alert" ? "#ff6b6b" : eye;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? "Agent"}
      className={cn("agent-avatar shrink-0 overflow-visible", `agent-avatar--${state}`, className)}
      style={{ ["--avatar-delay" as string]: delayFor(agentId) }}
    >
      <defs>
        <radialGradient id={`h${uid}`} cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor={light} />
          <stop offset="0.55" stopColor={base} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
        <radialGradient id={`b${uid}`} cx="35%" cy="20%" r="90%">
          <stop offset="0" stopColor={light} />
          <stop offset="0.6" stopColor={base} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
        <linearGradient id={`v${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2a44" />
          <stop offset="1" stopColor="#070b16" />
        </linearGradient>
        <radialGradient id={`e${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor={eyeColor} />
          <stop offset="1" stopColor={eyeColor} stopOpacity="0.6" />
        </radialGradient>
        <filter id={`g${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      <ellipse className="avatar-shadow" cx="60" cy="112" rx="24" ry="4.5" fill="#000" opacity="0.2" />

      <g className="avatar-bob">
        {/* antenna */}
        <path d="M60 22V11" stroke={dark} strokeWidth="3" strokeLinecap="round" />
        <circle className="avatar-antenna" cx="60" cy="9" r="7" fill={eyeColor} filter={`url(#g${uid})`} />
        <circle cx="60" cy="9" r="4.2" fill={`url(#e${uid})`} />

        {persona.accessory === "radar" && (
          <g className="avatar-radar" stroke={eyeColor} fill="none" strokeWidth="2" strokeLinecap="round" opacity="0.8">
            <path d="M68 6a10 10 0 0 1 0 8" />
            <path d="M72 3a15 15 0 0 1 0 14" />
          </g>
        )}

        {/* arms */}
        <rect className="avatar-arm-left" x="25" y="76" width="11" height="22" rx="5.5" fill={`url(#b${uid})`} />
        <rect className="avatar-arm-right" x="84" y="76" width="11" height="22" rx="5.5" fill={`url(#b${uid})`} />

        {/* body */}
        <rect x="53" y="66" width="14" height="8" rx="3" fill={dark} />
        <rect x="36" y="71" width="48" height="33" rx="14" fill={`url(#b${uid})`} />
        <ellipse cx="48" cy="77" rx="8" ry="3" fill="#fff" opacity="0.28" />
        <circle cx="60" cy="88" r="11" fill="#fff" opacity="0.92" />
        <g stroke={dark} color={dark}>{persona.glyph}</g>

        {/* head */}
        <circle cx="25" cy="45" r="7" fill={dark} />
        <circle cx="95" cy="45" r="7" fill={dark} />
        <rect x="25" y="19" width="70" height="52" rx="24" fill={`url(#h${uid})`} />
        <ellipse cx="44" cy="27" rx="13" ry="5" fill="#fff" opacity="0.35" transform="rotate(-12 44 27)" />

        {persona.accessory === "headset" && (
          <g>
            <path d="M24 42a36 30 0 0 1 72 0" stroke={dark} strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x="17" y="37" width="10" height="17" rx="5" fill={dark} />
            <rect x="93" y="37" width="10" height="17" rx="5" fill={dark} />
            <path d="M22 54c0 9 8 14 18 14" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="41" cy="68" r="3" fill={dark} />
          </g>
        )}
        {persona.accessory === "pencil" && (
          <g transform="rotate(35 92 24)">
            <rect x="88" y="10" width="7" height="24" rx="2" fill="#fbbf24" stroke={dark} strokeWidth="1.2" />
            <path d="M88 34h7l-3.5 6z" fill="#fde68a" stroke={dark} strokeWidth="1.2" strokeLinejoin="round" />
          </g>
        )}

        {/* visor */}
        <rect x="33" y="31" width="54" height="29" rx="14" fill={`url(#v${uid})`} />
        <path d="M39 37c6-3 16-4 24-3" stroke="#fff" strokeOpacity="0.22" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        <g className="avatar-eyes">
          <ellipse className="avatar-eye" cx="49" cy="46" rx="5" ry="6" fill={`url(#e${uid})`} />
          <ellipse className="avatar-eye" cx="71" cy="46" rx="5" ry="6" fill={`url(#e${uid})`} />
          <ellipse cx="49" cy="46" rx="7" ry="8" fill={eyeColor} opacity="0.25" filter={`url(#g${uid})`} />
          <ellipse cx="71" cy="46" rx="7" ry="8" fill={eyeColor} opacity="0.25" filter={`url(#g${uid})`} />
        </g>
        <path d="M55 54.5q5 3 10 0" stroke={eyeColor} strokeOpacity="0.7" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {persona.accessory === "glasses" && (
          <g stroke={light} strokeWidth="2" fill="none" opacity="0.9">
            <circle cx="49" cy="46" r="9" />
            <circle cx="71" cy="46" r="9" />
            <path d="M58 46h4" />
          </g>
        )}
      </g>
    </svg>
  );
}
