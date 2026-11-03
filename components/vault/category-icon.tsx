import { cn } from "@/lib/cn";
import type { CredentialCategory } from "@/lib/types";
import {
  IconApps,
  IconGlobe,
  IconKey,
  IconLink,
  IconMail,
  IconServer,
} from "@/components/ui/icons";

const META = {
  email: { icon: IconMail },
  hosting: { icon: IconServer },
  domain: { icon: IconGlobe },
  website: { icon: IconLink },
  software: { icon: IconApps },
  other: { icon: IconKey },
} as const;

export function CategoryIcon({
  category,
  className,
}: {
  category: CredentialCategory;
  className?: string;
}) {
  const entry = META[category] ?? META.other;
  const Icon = entry.icon;

  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-line bg-surface-2 text-muted",
        className,
      )}
      aria-hidden="true"
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}
