import { cn } from "@/lib/utils";

export type StatTone = "indigo" | "sky" | "blue" | "violet" | "emerald" | "amber" | "red";

const STAT_TONES: Record<StatTone, { accent: string; icon: string; iconHero: string; value: string }> = {
  indigo: { accent: "bg-indigo-500", icon: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300", iconHero: "bg-indigo-600 text-white", value: "text-indigo-700 dark:text-indigo-200" },
  sky: { accent: "bg-sky-500", icon: "bg-sky-500/10 text-sky-600 dark:text-sky-300", iconHero: "bg-sky-600 text-white", value: "text-sky-700 dark:text-sky-200" },
  blue: { accent: "bg-blue-500", icon: "bg-blue-500/10 text-blue-600 dark:text-blue-300", iconHero: "bg-blue-600 text-white", value: "text-blue-700 dark:text-blue-200" },
  violet: { accent: "bg-violet-500", icon: "bg-violet-500/10 text-violet-600 dark:text-violet-300", iconHero: "bg-violet-600 text-white", value: "text-violet-700 dark:text-violet-200" },
  emerald: { accent: "bg-emerald-500", icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", iconHero: "bg-emerald-600 text-white", value: "text-emerald-700 dark:text-emerald-200" },
  amber: { accent: "bg-amber-500", icon: "bg-amber-500/10 text-amber-600 dark:text-amber-300", iconHero: "bg-amber-600 text-white", value: "text-amber-700 dark:text-amber-200" },
  red: { accent: "bg-red-500", icon: "bg-red-500/10 text-red-600 dark:text-red-300", iconHero: "bg-red-600 text-white", value: "text-red-700 dark:text-red-200" },
};

// Shared shell for every "stat tile" in the app (top-of-page metric cards on
// every admin table, the admin dashboard, and every tenant page). Before
// this was extracted, 8 files each defined a structurally identical local
// StatCard. `size="hero"` and `tintValue` support the admin dashboard's two
// larger, tone-tinted cards; `missingCount`/`onFilterClick`/`isFilterActive`
// support the tenants page's click-to-filter subtitle.
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone,
  size = "default",
  tintValue = false,
  missingCount,
  onFilterClick,
  isFilterActive,
}: {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  tone: StatTone;
  size?: "default" | "hero";
  tintValue?: boolean;
  missingCount?: number;
  onFilterClick?: () => void;
  isFilterActive?: boolean;
}) {
  const styles = STAT_TONES[tone];
  const isHero = size === "hero";
  const canFilter = Boolean(onFilterClick) && (missingCount ?? 0) > 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-(--panel) shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5 dark:hover:shadow-black/20",
        isHero ? "p-4" : "p-3.5",
        isFilterActive ? "border-indigo-500/50 ring-1 ring-indigo-500/30" : "border-(--panel-border) hover:border-indigo-500/25",
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", styles.accent)} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("font-medium text-(--panel-text-muted)", isHero ? "text-sm" : "text-xs")}>{title}</p>
          <div
            className={cn(
              "font-bold leading-none tracking-tight",
              isHero ? "mt-2 text-[30px]" : "mt-1.5 text-lg",
              tintValue && styles.value,
            )}
          >
            {value}
          </div>
        </div>
        <div className={cn("shrink-0 rounded-lg", isHero ? "p-2.5" : "p-1.5", isHero ? styles.iconHero : styles.icon)}>
          {icon}
        </div>
      </div>

      {subtitle != null && (
        canFilter ? (
          <button
            type="button"
            onClick={onFilterClick}
            className={cn(
              "mt-1.5 inline-flex items-center gap-1 rounded-lg px-1.5 py-1 -ml-1.5 text-xs font-medium underline-offset-2 transition hover:bg-(--panel-hover) hover:underline",
              isFilterActive ? "text-indigo-600 dark:text-indigo-300" : "text-(--panel-text-subtle)",
            )}
          >
            {subtitle}
          </button>
        ) : (
          <p className={cn("text-(--panel-text-subtle)", isHero ? "mt-2 text-xs leading-5" : "mt-1.5 text-xs leading-5")}>
            {subtitle}
          </p>
        )
      )}
    </div>
  );
}
