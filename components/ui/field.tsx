import { cn } from "@/lib/cn";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-[12px] border border-rose-200 bg-rose-50 px-3.5 py-3 text-[13px] leading-relaxed text-rose-800"
    >
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-200 text-[10px] font-bold text-rose-900">
        !
      </span>
      {message}
    </div>
  );
}

export function SuccessNote({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-[12px] border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[13px] font-medium text-emerald-800"
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-200 text-[10px] font-bold text-emerald-900">
        âœ“
      </span>
      {message}
    </div>
  );
}
