import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CreditCard,
  DollarSign,
  FileText,
  Gauge,
  Plus,
  Users,
} from "lucide-react";

import { getDashboardStats } from "@/actions/dashboard";
import { AdminDashboardCharts } from "@/components/dashboard/admin-dashboard-chart";
import { DashboardActionCards } from "@/components/dashboard/admin-dashboard-action-card";
import {
  RecentDashboardTables,
  type RecentData,
} from "@/components/dashboard/recent-dashboard-tables";
import { cn } from "@/lib/utils";

type StatTone = "indigo" | "sky" | "emerald" | "amber" | "violet";

const STAT_TONES: Record<
  StatTone,
  { icon: string; value: string; glow: string }
> = {
  indigo: {
    icon: "bg-indigo-500/12 text-indigo-500 dark:text-indigo-300",
    value: "text-indigo-700 dark:text-indigo-200",
    glow: "from-indigo-500/12",
  },
  sky: {
    icon: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
    value: "text-sky-700 dark:text-sky-200",
    glow: "from-sky-500/12",
  },
  emerald: {
    icon: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    value: "text-emerald-700 dark:text-emerald-200",
    glow: "from-emerald-500/12",
  },
  amber: {
    icon: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
    value: "text-amber-700 dark:text-amber-200",
    glow: "from-amber-500/12",
  },
  violet: {
    icon: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
    value: "text-violet-700 dark:text-violet-200",
    glow: "from-violet-500/12",
  },
};

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  tone: StatTone;
}) {
  const styles = STAT_TONES[tone];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel) p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-500/25 hover:shadow-lg hover:shadow-slate-950/5 dark:hover:shadow-black/20">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b to-transparent opacity-70",
          styles.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-(--panel-text-muted)">
            {title}
          </p>
          <p
            className={cn(
              "mt-2 text-[30px] font-bold leading-none tracking-tight",
              styles.value,
            )}
          >
            {value}
          </p>
        </div>
        <div className={cn("rounded-xl p-2.5", styles.icon)}>{icon}</div>
      </div>
      <p className="relative mt-3 text-xs leading-5 text-(--panel-text-subtle)">
        {subtitle}
      </p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const occupancyRate = stats.cards.totalRooms
    ? Math.round(
        (stats.cards.occupiedRooms / stats.cards.totalRooms) * 100,
      )
    : 0;

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-6 p-4 text-(--panel-text) sm:p-6 lg:p-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/15 bg-indigo-500/8 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            ប្រព័ន្ធកំពុងដំណើរការ
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            ផ្ទាំងគ្រប់គ្រង
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-(--panel-text-muted)">
            មើលស្ថិតិ សកម្មភាព និងការងារសំខាន់ៗក្នុងប្រព័ន្ធ RRMS
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/rooms"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-(--panel-border) bg-(--panel) px-4 text-sm font-medium text-(--panel-text) shadow-sm transition hover:border-indigo-500/30 hover:bg-(--panel-hover)"
          >
            <Building2 className="h-4 w-4 text-indigo-400" />
            គ្រប់គ្រងបន្ទប់
          </Link>
          <Link
            href="/admin/tenants"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            បន្ថែមអ្នកជួល
          </Link>
        </div>
      </section>

      <section aria-label="ស្ថិតិសង្ខេប" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="ចំណូលខែនេះ"
          value={`$${stats.cards.monthlyRevenue.toFixed(2)}`}
          subtitle="ពីវិក្កយបត្រដែលបានបង់រួច"
          icon={<DollarSign size={20} />}
          tone="emerald"
        />
        <StatCard
          title="អត្រាកាន់កាប់"
          value={`${occupancyRate}%`}
          subtitle={`${stats.cards.occupiedRooms} ក្នុងចំណោម ${stats.cards.totalRooms} បន្ទប់`}
          icon={<Gauge size={20} />}
          tone="sky"
        />
        <StatCard
          title="អ្នកជួលសរុប"
          value={stats.cards.totalTenants}
          subtitle="អ្នកជួលដែលមានក្នុងប្រព័ន្ធ"
          icon={<Users size={20} />}
          tone="indigo"
        />
        <StatCard
          title="បន្ទប់សរុប"
          value={stats.cards.totalRooms}
          subtitle={`${stats.cards.availableRooms} ទំនេរ · ${stats.cards.maintenanceRooms} ជួសជុល`}
          icon={<Building2 size={20} />}
          tone="violet"
        />
        <StatCard
          title="កិច្ចសន្យាសកម្ម"
          value={stats.cards.activeContracts}
          subtitle="កិច្ចសន្យាដែលកំពុងដំណើរការ"
          icon={<FileText size={20} />}
          tone="emerald"
        />
        <StatCard
          title="ការទូទាត់រង់ចាំ"
          value={stats.cards.pendingPayments}
          subtitle="ត្រូវពិនិត្យ និងអនុម័ត"
          icon={<CreditCard size={20} />}
          tone="amber"
        />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">ការងារត្រូវតាមដាន</h2>
            <p className="mt-1 text-xs text-(--panel-text-subtle)">
              បញ្ហា និងសកម្មភាពដែលត្រូវការការយកចិត្តទុកដាក់
            </p>
          </div>
          <Link
            href="/admin/reports"
            className="hidden items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-400 sm:inline-flex"
          >
            មើលរបាយការណ៍
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <DashboardActionCards cards={stats.cards} />
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold">ទិដ្ឋភាពវិភាគ</h2>
          <p className="mt-1 text-xs text-(--panel-text-subtle)">
            ទិន្នន័យចំណូល បន្ទប់ វិក្កយបត្រ និងការទូទាត់
          </p>
        </div>
        <AdminDashboardCharts
          roomStatus={stats.charts.roomStatus}
          billStatus={stats.charts.billStatus}
          paymentStatus={stats.charts.paymentStatus}
          revenueByMonth={stats.charts.revenueByMonth}
        />
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold">សកម្មភាពថ្មីៗ</h2>
          <p className="mt-1 text-xs text-(--panel-text-subtle)">
            ទិន្នន័យដែលទើបតែបញ្ចូល ឬកែប្រែក្នុងប្រព័ន្ធ
          </p>
        </div>
        <RecentDashboardTables recent={stats.recent as RecentData} />
      </section>
    </div>
  );
}
