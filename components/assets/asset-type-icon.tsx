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
  link: { icon: IconLink, tone: "bg-[#e6fff7] text-[#008a5c]" },
  repo: { icon: IconRepo, tone: "bg-[#f0e9ff] text-[#6b3fc4]" },
  hosting: { icon: IconServer, tone: "bg-[#e8efff] text-[#2c58b8]" },
  database: { icon: IconDatabase, tone: "bg-[#e2fbf8] text-[#00756b]" },
  account: { icon: IconKey, tone: "bg-[#fff3dd] text-[#8d5a00]" },
  secret: { icon: IconLock, tone: "bg-[#ffe8ee] text-[#a52545]" },
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
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ring-1 ring-inset ring-black/[0.03]",
        entry.tone,
        className,
      )}
      aria-hidden="true"
    >
      <Icon className="h-[17px] w-[17px]" />
    </span>
  );
}
