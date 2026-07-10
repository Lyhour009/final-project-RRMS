import { AlertTriangle, CreditCard, FileText, Wrench } from "lucide-react";

type Tone = "amber" | "red" | "blue" | "purple";

const TONE_STYLES: Record<
  Tone,
  {
    border: string;
    bg: string;
    iconBg: string;
    iconText: string;
    valueText: string;
    glow: string;
  }
> = {
  amber: {
    border: "border-amber-200 dark:border-amber-500/20",
    bg: "bg-amber-50 dark:bg-amber-500/5",
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-600 dark:text-amber-400",
    valueText: "text-amber-700 dark:text-amber-300",
    glow: "#f59e0b",
  },
  red: {
    border: "border-red-200 dark:border-red-500/20",
    bg: "bg-red-50 dark:bg-red-500/5",
    iconBg: "bg-red-500/15",
    iconText: "text-red-600 dark:text-red-400",
    valueText: "text-red-700 dark:text-red-300",
    glow: "#ef4444",
  },
  blue: {
    border: "border-blue-200 dark:border-blue-500/20",
    bg: "bg-blue-50 dark:bg-blue-500/5",
    iconBg: "bg-blue-500/15",
    iconText: "text-blue-600 dark:text-blue-400",
    valueText: "text-blue-700 dark:text-blue-300",
    glow: "#3b82f6",
  },
  purple: {
    border: "border-purple-200 dark:border-purple-500/20",
    bg: "bg-purple-50 dark:bg-purple-500/5",
    iconBg: "bg-purple-500/15",
    iconText: "text-purple-600 dark:text-purple-400",
    valueText: "text-purple-700 dark:text-purple-300",
    glow: "#a855f7",
  },
};

function ActionCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  tone: Tone;
}) {
  const s = TONE_STYLES[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${s.border} ${s.bg} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at top right, ${s.glow}14 0%, transparent 65%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-(--panel-text-muted)">
            {title}
          </p>
          <p className={`mt-2 text-3xl font-black ${s.valueText}`}>{value}</p>
        </div>
        <div className={`shrink-0 rounded-xl ${s.iconBg} ${s.iconText} p-2.5`}>
          {icon}
        </div>
      </div>

      <p className="relative mt-3 text-xs text-(--panel-text-muted)">
        {description}
      </p>
    </div>
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
    <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
      <h2 className="text-lg font-semibold text-(--panel-text) mb-4">
        ការងារត្រូវតាមដាន
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <ActionCard
          title="ការទូទាត់រង់ចាំ"
          value={cards.pendingPayments}
          description="Admin ត្រូវពិនិត្យ និងអនុម័ត"
          icon={<CreditCard size={20} />}
          tone="amber"
        />

        <ActionCard
          title="វិក្កយបត្រមិនទាន់បង់"
          value={cards.unpaidBills}
          description={`ទឹកប្រាក់សរុប $${cards.unpaidAmount.toFixed(2)}`}
          icon={<AlertTriangle size={20} />}
          tone="red"
        />

        <ActionCard
          title="កិច្ចសន្យាជិតផុត"
          value={cards.contractsEndingSoon}
          description="កិច្ចសន្យាដែលនឹងផុតក្នុង 30 ថ្ងៃ"
          icon={<FileText size={20} />}
          tone="blue"
        />

        <ActionCard
          title="សំណើជួសជុល"
          value={cards.maintenancePending}
          description="សំណើដែលកំពុងរង់ចាំ"
          icon={<Wrench size={20} />}
          tone="purple"
        />
      </div>
    </div>
  );
}
