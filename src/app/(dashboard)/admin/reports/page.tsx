import {
  AlertTriangle,
  BarChart3,
  Building2,
  DollarSign,
  FileText,
  Percent,
  Wrench,
} from "lucide-react";

import { getReportsData } from "@/actions/reports";
import { ReportsCharts } from "@/components/report/report-charts";

function ReportCard({
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
  tone: "emerald" | "amber" | "blue" | "red" | "indigo";
}) {
  const styles = {
    emerald: { accent: "bg-emerald-500", icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
    amber: { accent: "bg-amber-500", icon: "bg-amber-500/10 text-amber-600 dark:text-amber-300" },
    blue: { accent: "bg-blue-500", icon: "bg-blue-500/10 text-blue-600 dark:text-blue-300" },
    red: { accent: "bg-red-500", icon: "bg-red-500/10 text-red-600 dark:text-red-300" },
    indigo: { accent: "bg-indigo-500", icon: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300" },
  }[tone];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-(--panel-border) bg-(--panel) p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5 dark:hover:shadow-black/20">
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-(--panel-text-muted)">{title}</p>
          <p className="mt-1.5 text-lg font-bold leading-none tracking-tight text-(--panel-text)">{value}</p>
        </div>
        <div className={`shrink-0 rounded-lg p-1.5 ${styles.icon}`}>{icon}</div>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-(--panel-text-subtle)">{subtitle}</p>
    </div>
  );
}

export default async function AdminReportsPage() {
  const data = await getReportsData();

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-300">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">របាយការណ៍</h1>
          <p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">
            សង្ខេបចំណូល វិក្កយបត្រ បន្ទប់ ការទូទាត់ និងសំណើជួសជុល
          </p>
        </div>
      </div>

      <section>
        <div className="mb-3"><h2 className="text-lg font-semibold">ទិដ្ឋភាពសង្ខេប</h2><p className="mt-1 text-xs text-(--panel-text-subtle)">សូចនាករសំខាន់ៗសម្រាប់ការគ្រប់គ្រងប្រព័ន្ធ</p></div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <ReportCard
          title="ចំណូលសរុប"
          value={`$${data.summary.totalRevenue.toFixed(2)}`}
          subtitle="ពីវិក្កយបត្រដែលបានបង់"
          icon={<DollarSign size={16} />}
          tone="emerald"
        />

        <ReportCard
          title="ទឹកប្រាក់មិនទាន់បង់"
          value={`$${data.summary.unpaidAmount.toFixed(2)}`}
          subtitle={`${data.summary.unpaidBills} វិក្កយបត្រ`}
          icon={<AlertTriangle size={16} />}
          tone="amber"
        />

        <ReportCard
          title="អត្រាបន្ទប់មានអ្នកជួល"
          value={`${data.summary.occupancyRate}%`}
          subtitle={`${data.summary.totalRooms} បន្ទប់សរុប`}
          icon={<Percent size={16} />}
          tone="blue"
        />

        <ReportCard
          title="សំណើជួសជុលរង់ចាំ"
          value={data.summary.pendingMaintenance}
          subtitle="ត្រូវការតាមដាន"
          icon={<Wrench size={16} />}
          tone="red"
        />

        <ReportCard
          title="វិក្កយបត្របានបង់"
          value={data.summary.paidBills}
          subtitle="វិក្កយបត្រដែលបានបង់រួច"
          icon={<FileText size={16} />}
          tone="emerald"
        />

        <ReportCard
          title="វិក្កយបត្រហួសកំណត់"
          value={data.summary.overdueBills}
          subtitle="វិក្កយបត្រហួសកាលកំណត់"
          icon={<AlertTriangle size={16} />}
          tone="red"
        />

        <ReportCard
          title="ការទូទាត់សរុប"
          value={data.summary.totalPayments}
          subtitle="កំណត់ត្រាការទូទាត់"
          icon={<BarChart3 size={16} />}
          tone="indigo"
        />

        <ReportCard
          title="បន្ទប់សរុប"
          value={data.summary.totalRooms}
          subtitle="បន្ទប់ទាំងអស់"
          icon={<Building2 size={16} />}
          tone="blue"
        />
        </div>
      </section>

      <section>
        <div className="mb-3"><h2 className="text-lg font-semibold">ទិន្នន័យវិភាគ</h2><p className="mt-1 text-xs text-(--panel-text-subtle)">និន្នាការចំណូល និងការបែងចែកស្ថានភាពប្រតិបត្តិការ</p></div>
        <ReportsCharts charts={data.charts} />
      </section>
    </div>
  );
}
