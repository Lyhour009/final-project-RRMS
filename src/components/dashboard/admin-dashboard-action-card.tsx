import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  FileText,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "amber" | "red" | "blue" | "purple";

const TONE_STYLES: Record<
  Tone,
  { border: string; accent: string; bg: string; icon: string; value: string }
> = {
  amber: {
    border: "border-amber-500/20 hover:border-amber-500/35",
    accent: "bg-amber-500",
    bg: "bg-amber-500/6",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    value: "text-amber-700 dark:text-amber-200",
  },
  red: {
    border: "border-red-500/20 hover:border-red-500/35",
    accent: "bg-red-500",
    bg: "bg-red-500/6",
    icon: "bg-red-500/15 text-red-600 dark:text-red-300",
    value: "text-red-700 dark:text-red-200",
  },
  blue: {
    border: "border-blue-500/20 hover:border-blue-500/35",
    accent: "bg-blue-500",
    bg: "bg-blue-500/6",
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
    value: "text-blue-700 dark:text-blue-200",
  },
  purple: {
    border: "border-purple-500/20 hover:border-purple-500/35",
    accent: "bg-purple-500",
    bg: "bg-purple-500/6",
    icon: "bg-purple-500/15 text-purple-600 dark:text-purple-300",
    value: "text-purple-700 dark:text-purple-200",
  },
};

function ActionCard({
  title,
  value,
  description,
  href,
  icon,
  tone,
}: {
  title: string;
  value: number | string;
  description: string;
  href: string;
  icon: React.ReactNode;
  tone: Tone;
}) {
  const styles = TONE_STYLES[tone];
  // The "red" card is the one genuinely urgent item here (unpaid bills) — a
  // thicker top accent plus a stronger tint makes it read as "act on this"
  // at a glance instead of sitting at equal weight next to the other three,
  // less time-sensitive follow-ups.
  const isUrgent = tone === "red";

  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5 dark:hover:shadow-black/20",
        styles.border,
        isUrgent ? "bg-red-500/10 dark:bg-red-500/15" : styles.bg,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0",
          isUrgent ? "h-1.5" : "h-1",
          styles.accent,
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-(--panel-text-muted)">
            {title}
          </p>
          <p className={`mt-1.5 text-lg font-bold leading-none tracking-tight ${styles.value}`}>
            {value}
          </p>
        </div>
        <div className={`shrink-0 rounded-lg p-1.5 ${styles.icon}`}>{icon}</div>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-3">
        <p className="text-xs leading-5 text-(--panel-text-subtle)">
          {description}
        </p>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-(--panel-text-subtle) transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--panel-text)" />
      </div>
    </Link>
  );
}

interface DashboardActionCardsData {
  pendingPayments: number;
  unpaidBills: number;
  unpaidAmount: number;
  contractsEndingSoon: number;
  maintenancePending: number;
}

export function DashboardActionCards({
  cards,
}: {
  cards: DashboardActionCardsData;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ActionCard
        title="ការទូទាត់រង់ចាំ"
        value={cards.pendingPayments}
        description="ពិនិត្យ និងអនុម័តការទូទាត់"
        href="/admin/payments"
        icon={<CreditCard size={16} />}
        tone="amber"
      />
      <ActionCard
        title="វិក្កយបត្រមិនទាន់បង់"
        value={cards.unpaidBills}
        description={`ទឹកប្រាក់សរុប $${cards.unpaidAmount.toFixed(2)}`}
        href="/admin/billing"
        icon={<AlertTriangle size={16} />}
        tone="red"
      />
      <ActionCard
        title="កិច្ចសន្យាជិតផុត"
        value={cards.contractsEndingSoon}
        description="នឹងផុតកំណត់ក្នុងរយៈពេល 30 ថ្ងៃ"
        href="/admin/contracts"
        icon={<FileText size={16} />}
        tone="blue"
      />
      <ActionCard
        title="សំណើជួសជុល"
        value={cards.maintenancePending}
        description="សំណើដែលកំពុងរង់ចាំដោះស្រាយ"
        href="/admin/maintenance"
        icon={<Wrench size={16} />}
        tone="purple"
      />
    </div>
  );
}
