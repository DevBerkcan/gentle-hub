import { cn } from "@/lib/cn";
import type { AssetType } from "@/lib/types";
import {
  IconDatabase,
  IconKey,
  IconLink,
  IconLock,
  IconRepo,
  IconServer,
} from "@/components/ui/icons";

const meta = {
  link: { icon: IconLink },
  repo: { icon: IconRepo },
  hosting: { icon: IconServer },
  database: { icon: IconDatabase },
  account: { icon: IconKey },
  secret: { icon: IconLock },
} as const;

export function AssetTypeIcon({
  type,
  className,
}: {
  type: AssetType;
  className?: string;
}) {
  const entry = meta[type] ?? meta.link;
  const Icon = entry.icon;

  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-line bg-surface-2 text-[#475467]",
        className,
      )}
      aria-hidden="true"
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}
