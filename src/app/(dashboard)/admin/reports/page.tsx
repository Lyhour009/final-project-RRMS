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
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <div className={color}>{icon}</div>
      </div>

      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
    </div>
  );
}

export default async function AdminReportsPage() {
  const data = await getReportsData();

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">📊 របាយការណ៍</h1>
        <p className="text-sm text-zinc-500 mt-1">
          សង្ខេបចំណូល វិក្កយបត្រ បន្ទប់ ការទូទាត់ និងសំណើជួសជុល
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <ReportCard
          title="ចំណូលសរុប"
          value={`$${data.summary.totalRevenue.toFixed(2)}`}
          subtitle="ពីវិក្កយបត្រដែលបានបង់"
          icon={<DollarSign size={22} />}
          color="text-emerald-400"
        />

        <ReportCard
          title="ទឹកប្រាក់មិនទាន់បង់"
          value={`$${data.summary.unpaidAmount.toFixed(2)}`}
          subtitle={`${data.summary.unpaidBills} វិក្កយបត្រ`}
          icon={<AlertTriangle size={22} />}
          color="text-amber-400"
        />

        <ReportCard
          title="អត្រាបន្ទប់មានអ្នកជួល"
          value={`${data.summary.occupancyRate}%`}
          subtitle={`${data.summary.totalRooms} បន្ទប់សរុប`}
          icon={<Percent size={22} />}
          color="text-blue-400"
        />

        <ReportCard
          title="សំណើជួសជុលរង់ចាំ"
          value={data.summary.pendingMaintenance}
          subtitle="ត្រូវការតាមដាន"
          icon={<Wrench size={22} />}
          color="text-red-400"
        />

        <ReportCard
          title="វិក្កយបត្របានបង់"
          value={data.summary.paidBills}
          subtitle="Paid bills"
          icon={<FileText size={22} />}
          color="text-emerald-400"
        />

        <ReportCard
          title="វិក្កយបត្រហួសកំណត់"
          value={data.summary.overdueBills}
          subtitle="Overdue bills"
          icon={<AlertTriangle size={22} />}
          color="text-red-400"
        />

        <ReportCard
          title="ការទូទាត់សរុប"
          value={data.summary.totalPayments}
          subtitle="Payment records"
          icon={<BarChart3 size={22} />}
          color="text-indigo-400"
        />

        <ReportCard
          title="បន្ទប់សរុប"
          value={data.summary.totalRooms}
          subtitle="All rooms"
          icon={<Building2 size={22} />}
          color="text-blue-400"
        />
      </div>

      <ReportsCharts charts={data.charts} />
    </div>
  );
}
