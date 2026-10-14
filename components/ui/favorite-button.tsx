"use client";

import { cn } from "@/lib/utils";

export function FavoriteButton({
  active,
  onToggle,
  appName,
  className,
}: {
  active: boolean;
  onToggle: () => void;
  appName: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? `${appName} aus Favoriten entfernen` : `${appName} zu Favoriten hinzufügen`}
      title={active ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      className={cn(
        "focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-fg-subtle transition-[opacity,color,background-color] duration-[var(--duration-fast)] hover:bg-surface-muted hover:text-fg",
        // Always reachable on touch devices; revealed on hover/focus from md up.
        "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 md:group-focus-within:opacity-100",
        active && "md:opacity-100",
        className
      )}
    >
      <svg
        key={active ? "on" : "off"}
        viewBox="0 0 24 24"
        className={cn("h-[18px] w-[18px]", active && "animate-[pop_240ms_var(--ease-hub)]")}
        fill={active ? "var(--accent)" : "none"}
        stroke={active ? "var(--accent-fg)" : "currentColor"}
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          d="M12 4.5l2.2 4.94 5.3.5-4 3.62 1.16 5.24L12 16.1l-4.66 2.7 1.16-5.24-4-3.62 5.3-.5L12 4.5Z"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
