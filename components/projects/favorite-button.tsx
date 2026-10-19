"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setFavoriteAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { IconStar, IconStarFilled } from "@/components/ui/icons";

export function FavoriteButton({
  slug,
  initial,
  className,
  size = "md",
}: {
  slug: string;
  initial: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const [favorite, setFavorite] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const next = !favorite;
    setFavorite(next);

    startTransition(async () => {
      const result = await setFavoriteAction(slug, next);
      if (!result.ok) {
        setFavorite(!next);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorite}
      aria-label={favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      title={favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[9px] transition",
        size === "sm" ? "h-7 w-7" : "h-8 w-8",
        favorite
          ? "text-amber-500 hover:bg-amber-50"
          : "text-subtle/60 hover:bg-[#f3f0f8] hover:text-amber-500",
        className,
      )}
    >
      {favorite ? <IconStarFilled className="h-4 w-4" /> : <IconStar className="h-4 w-4" />}
    </button>
  );
}
