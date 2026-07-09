"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#22c55e", "#6366f1", "#f59e0b", "#ef4444"];
const STATUS_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

// Uses the same --panel-* theme tokens as the rest of the app (see
// globals.css) instead of hardcoded hex, so these charts follow light/dark
// mode instead of always rendering with dark-theme colors.
const tickStyle = {
  fill: "var(--panel-text-muted)",
  fontSize: 11,
};

const tooltipStyle = {
  background: "var(--panel)",
  border: "1px solid var(--panel-border)",
  borderRadius: "10px",
  color: "var(--panel-text)",
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
      <h2 className="text-base font-semibold text-(--panel-text) mb-4">{title}</h2>
      <div className="dashboard-chart h-[280px]">{children}</div>
    </div>
  );
}

export function ReportsCharts({ charts }: { charts: any }) {
  return (
    <div className="space-y-6">
      <ChartCard title="ចំណូលតាមខែ">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={charts.revenueByMonth}
            margin={{ top: 15, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--panel-border)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={tickStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value) => [
                `$${Number(value ?? 0).toFixed(2)}`,
                "ចំណូល",
              ]}
              contentStyle={tooltipStyle}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard title="ស្ថានភាពបន្ទប់">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={charts.roomStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {charts.roomStatus.map((_: any, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ស្ថានភាពវិក្កយបត្រ">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.billStatus}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--panel-border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={tickStyle}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={36}>
                {charts.billStatus.map((_: any, index: number) => (
                  <Cell
                    key={index}
                    fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ស្ថានភាពការទូទាត់">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.paymentStatus}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--panel-border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={tickStyle}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={36}>
                {charts.paymentStatus.map((_: any, index: number) => (
                  <Cell
                    key={index}
                    fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
