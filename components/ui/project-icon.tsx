import Image from "next/image";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

type ProjectIconProps = {
  name: string;
  icon?: string | null;
  accent?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "h-8 w-8 rounded-[8px] text-[10px]",
  md: "h-10 w-10 rounded-[10px] text-[11px]",
  lg: "h-12 w-12 rounded-[11px] text-[13px]",
  xl: "h-16 w-16 rounded-[14px] text-[17px]",
};

export function ProjectIcon({ name, icon, size = "md", className }: ProjectIconProps) {
  const isImage = Boolean(icon && (icon.startsWith("/") || icon.startsWith("http")));

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-white",
        "shadow-[0_1px_2px_rgb(16_24_40/0.04)]",
        sizes[size],
        className,
      )}
    >
      {isImage ? (
        <Image
          src={icon!}
          alt=""
          width={128}
          height={128}
          unoptimized
          className="h-full w-full object-contain p-[8%]"
        />
      ) : (
        <span className="font-display font-bold tracking-[-0.03em] text-[#475467]">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
