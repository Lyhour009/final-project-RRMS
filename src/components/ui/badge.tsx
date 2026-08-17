import { cn } from "@/lib/utils";

export type BadgeTone = "green" | "amber" | "red" | "blue" | "gray";

const BADGE_TONES: Record<BadgeTone, { className: string; dot: string }> = {
  green: { className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
  amber: { className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
  red: { className: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300", dot: "bg-red-500" },
  blue: { className: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
  gray: { className: "border-zinc-500/20 bg-zinc-500/10 text-(--panel-text-muted)", dot: "bg-zinc-400" },
};

// Shared shell for every status/priority pill in the app. Each domain
// (room, tenant, contract, bill, payment, maintenance) keeps its own small
// status -> tone/label mapping locally, since that mapping is genuinely
// domain-specific — only the pill markup itself (dot + border + text) was
// duplicated across every table before this was extracted.
export function Badge({
  tone,
  children,
  icon,
  dot = true,
  className,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  const styles = BADGE_TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        styles.className,
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", styles.dot)} />}
      {icon}
      {children}
    </span>
  );
}
