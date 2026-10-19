"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { IconMoon, IconSun } from "@/components/ui/icons";

const STORAGE_KEY = "gentlehub-theme";
const THEME_CHANGE_EVENT = "gentlehub-theme-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle({
  withLabel = false,
  className,
}: {
  withLabel?: boolean;
  className?: string;
}) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Private browsing may block storage; the current session still works.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Zu hellem Design wechseln" : "Zu dunklem Design wechseln"}
      title={dark ? "Hell" : "Dunkel"}
      aria-pressed={dark}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-[8px] border border-line bg-surface text-muted transition hover:bg-surface-2 hover:text-ink",
        withLabel ? "px-2.5 text-[11.5px] font-semibold" : "w-9",
        className,
      )}
    >
      <IconMoon className="h-4 w-4 dark:hidden" />
      <IconSun className="hidden h-4 w-4 dark:block" />
      {withLabel && (
        <span className="hidden sm:inline">{dark ? "Dunkel" : "Hell"}</span>
      )}
    </button>
  );
}
