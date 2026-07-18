"use client";

import { ChartNoAxesCombined } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ROOM_STATUS_COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];
const STATUS_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];
const MAINTENANCE_COLORS = ["#f59e0b", "#3b82f6", "#22c55e"];

const legendStyle = { fontSize: 12, color: "var(--panel-text-muted)" };
const tickStyle = { fill: "var(--panel-text-muted)", fontSize: 11 };
const tooltipStyle = {
  background: "var(--panel)",
  border: "1px solid var(--panel-border)",
  borderRadius: "12px",
  color: "var(--panel-text)",
  boxShadow: "0 12px 30px rgb(0 0 0 / 0.14)",
};

function ChartCard({ title, description, children, className = "" }: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-(--panel-border) bg-(--panel) p-5 shadow-sm sm:p-6 ${className}`}>
      <div className="mb-4"><h2 className="text-base font-semibold text-(--panel-text)">{title}</h2><p className="mt-1 text-xs text-(--panel-text-subtle)">{description}</p></div>
      <div className="dashboard-chart h-[260px]">{children}</div>
    </div>
  );
}

function EmptyChart({ description }: { description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-(--panel-border) bg-(--panel-inset)/45 px-6 text-center">
      <div className="mb-3 rounded-xl bg-indigo-500/10 p-3 text-indigo-500 dark:text-indigo-300"><ChartNoAxesCombined className="h-5 w-5" /></div>
      <p className="text-sm font-medium text-(--panel-text)">មិនទាន់មានទិន្នន័យ</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-(--panel-text-subtle)">{description}</p>
    </div>
  );
}

type ChartDatum = { name: string; value: number };
type ReportsChartData = {
  revenueByMonth: Array<{ month: string; revenue: number }>;
  roomStatus: ChartDatum[];
  billStatus: ChartDatum[];
  paymentStatus: ChartDatum[];
  maintenanceStatus: ChartDatum[];
};

const total = (data: ChartDatum[]) => data.reduce((sum, item) => sum + item.value, 0);

function StatusBarChart({ data, colors }: { data: ChartDatum[]; colors: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 14, right: 12, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} />
        <XAxis dataKey="name" tick={tickStyle} tickLine={false} axisLine={false} dy={8} />
        <YAxis hide allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--panel-hover)" }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
          {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReportsCharts({ charts }: { charts: ReportsChartData }) {
  const hasRevenue = charts.revenueByMonth.some((item) => item.revenue > 0);
  const hasRevenueTrend = hasRevenue && charts.revenueByMonth.length > 1;
  const totals = {
    rooms: total(charts.roomStatus),
    bills: total(charts.billStatus),
    payments: total(charts.paymentStatus),
    maintenance: total(charts.maintenanceStatus),
  };

  return (
    <div className="space-y-4">
      <ChartCard title="ចំណូលតាមខែ" description="ចំណូលពីវិក្កយបត្រដែលបានបង់រួច">
        {!hasRevenue ? <EmptyChart description="និន្នាការចំណូលនឹងបង្ហាញនៅពេលមានវិក្កយបត្រដែលបានបង់" /> : hasRevenueTrend ? (
          <ResponsiveContainer width="100%" height={250}><LineChart data={charts.revenueByMonth} margin={{ top: 15, right: 24, left: 4, bottom: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} /><XAxis dataKey="month" tick={tickStyle} tickLine={false} axisLine={false} dy={8} /><YAxis hide /><Tooltip formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "ចំណូល"]} contentStyle={tooltipStyle} /><Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={250}><BarChart data={charts.revenueByMonth} margin={{ top: 15, right: 24, left: 4, bottom: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} /><XAxis dataKey="month" tick={tickStyle} tickLine={false} axisLine={false} dy={8} /><YAxis hide /><Tooltip formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "ចំណូល"]} contentStyle={tooltipStyle} cursor={{ fill: "var(--panel-hover)" }} /><Bar dataKey="revenue" radius={[8, 8, 0, 0]} barSize={56} fill="#22c55e" /></BarChart></ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="ស្ថានភាពបន្ទប់" description="ទំនេរ មិនទំនេរ និងកំពុងជួសជុល">
          {totals.rooms === 0 ? <EmptyChart description="បន្ថែមបន្ទប់ដើម្បីមើលការបែងចែកស្ថានភាព" /> : <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={charts.roomStatus} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={4}>{charts.roomStatus.map((_, index) => <Cell key={index} fill={ROOM_STATUS_COLORS[index % ROOM_STATUS_COLORS.length]} stroke="var(--panel)" strokeWidth={3} />)}</Pie><text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" fill="var(--panel-text)" fontSize={24} fontWeight={700}>{totals.rooms}</text><text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fill="var(--panel-text-muted)" fontSize={11}>បន្ទប់សរុប</text><Tooltip contentStyle={tooltipStyle} /><Legend iconType="circle" wrapperStyle={legendStyle} /></PieChart></ResponsiveContainer>}
        </ChartCard>
        <ChartCard title="ស្ថានភាពវិក្កយបត្រ" description="បានបង់ មិនទាន់បង់ និងហួសកំណត់">
          {totals.bills === 0 ? <EmptyChart description="ស្ថានភាពនឹងបង្ហាញនៅពេលមានវិក្កយបត្រ" /> : <StatusBarChart data={charts.billStatus} colors={STATUS_COLORS} />}
        </ChartCard>
        <ChartCard title="ស្ថានភាពការទូទាត់" description="រង់ចាំ អនុម័ត និងបដិសេធ">
          {totals.payments === 0 ? <EmptyChart description="ស្ថានភាពនឹងបង្ហាញនៅពេលមានការទូទាត់" /> : <StatusBarChart data={charts.paymentStatus} colors={STATUS_COLORS} />}
        </ChartCard>
        <ChartCard title="ស្ថានភាពសំណើជួសជុល" description="រង់ចាំ កំពុងធ្វើ និងរួចរាល់">
          {totals.maintenance === 0 ? <EmptyChart description="ស្ថានភាពនឹងបង្ហាញនៅពេលមានសំណើជួសជុល" /> : <StatusBarChart data={charts.maintenanceStatus} colors={MAINTENANCE_COLORS} />}
        </ChartCard>
      </div>
    </div>
  );
}
