"use client";

import { BarChart3 } from "lucide-react";
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

const ROOM_COLORS = ["#22c55e", "#6366f1", "#f59e0b"];
const STATUS_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

// These use the same --panel-* theme tokens as the rest of the app (see
// globals.css) instead of hardcoded hex, so the charts actually follow
// light/dark mode instead of always rendering with dark-theme colors.
const tickStyle = {
  fill: "var(--panel-text-muted)",
  fontSize: 10,
  fontFamily: "var(--font-khmer), Inter, system-ui, sans-serif",
};

const tooltipStyle = {
  background: "var(--panel)",
  border: "1px solid var(--panel-border)",
  borderRadius: "10px",
  color: "var(--panel-text)",
};

const legendStyle = {
  color: "var(--panel-text-muted)",
  fontSize: "11px",
  fontFamily: "var(--font-khmer), Inter, system-ui, sans-serif",
};

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-(--panel-text)">{title}</h2>
        <p className="text-xs text-(--panel-text-subtle) mt-1">{description}</p>
      </div>

      <div className="dashboard-chart h-[260px] w-full">{children}</div>
    </div>
  );
}

function EmptyChart({ description }: { description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-(--panel-border) bg-(--panel-inset)/45 px-6 text-center">
      <div className="mb-3 rounded-xl bg-indigo-500/10 p-3 text-indigo-500 dark:text-indigo-300">
        <BarChart3 className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-(--panel-text)">
        មិនទាន់មានទិន្នន័យ
      </p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-(--panel-text-subtle)">
        {description}
      </p>
    </div>
  );
}

export function AdminDashboardCharts({
  roomStatus,
  billStatus,
  paymentStatus,
  revenueByMonth,
}: {
  roomStatus: { name: string; value: number }[];
  billStatus: { name: string; value: number }[];
  paymentStatus: { name: string; value: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}) {
  const totalRooms = roomStatus.reduce((sum, item) => sum + item.value, 0);
  const totalBills = billStatus.reduce((sum, item) => sum + item.value, 0);
  const totalPayments = paymentStatus.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const hasRevenueData = revenueByMonth.some((item) => item.revenue > 0);
  // A line needs 2+ points to draw an actual line — with only one month of
  // history, `<LineChart>` renders a single floating dot with nothing
  // connecting it, which reads as broken rather than "not much data yet".
  // A bar reads as a complete, deliberate chart even with just one value.
  const hasTrendData = hasRevenueData && revenueByMonth.length >= 2;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard title="ចំណូលតាមខែ" description="ចំណូលពីវិក្កយបត្រដែលបានបង់">
        {!hasRevenueData ? (
          <EmptyChart description="ចំណូលនឹងបង្ហាញនៅពេលវិក្កយបត្រត្រូវបានបង់" />
        ) : hasTrendData ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={revenueByMonth}
              margin={{ top: 20, right: 24, left: 4, bottom: 10 }}
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
                dy={8}
              />

              <YAxis hide />

              <Tooltip
                formatter={(value) => [
                  `$${Number(value ?? 0).toFixed(2)}`,
                  "ចំណូល",
                ]}
                labelStyle={{ color: "var(--panel-text)" }}
                contentStyle={tooltipStyle}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={revenueByMonth}
                margin={{ top: 20, right: 24, left: 4, bottom: 10 }}
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
                  dy={8}
                />

                <YAxis hide />

                <Tooltip
                  formatter={(value) => [
                    `$${Number(value ?? 0).toFixed(2)}`,
                    "ចំណូល",
                  ]}
                  labelStyle={{ color: "var(--panel-text)" }}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "var(--panel-hover)" }}
                />

                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} barSize={56} fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>

            <p className="text-center text-xs text-(--panel-text-subtle) -mt-2">
              និន្នាការនឹងបង្ហាញនៅពេលមានទិន្នន័យលើសពី ១ ខែ
            </p>
          </div>
        )}
      </ChartCard>
      <ChartCard title="ស្ថានភាពបន្ទប់" description="ទំនេរ / មិនទំនេរ / ជួសជុល">
        {totalRooms === 0 ? (
          <EmptyChart description="បន្ថែមបន្ទប់ដើម្បីមើលសមាមាត្រការកាន់កាប់" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roomStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={64}
                outerRadius={92}
                paddingAngle={4}
                labelLine={false}
              >
                {roomStatus.map((_, index) => (
                  <Cell
                    key={index}
                    fill={ROOM_COLORS[index % ROOM_COLORS.length]}
                    stroke="var(--panel)"
                    strokeWidth={3}
                  />
                ))}
              </Pie>

              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--panel-text)"
                fontSize={24}
                fontWeight={700}
              >
                {totalRooms}
              </text>

              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--panel-text-muted)"
                fontSize={11}
              >
                បន្ទប់សរុប
              </text>

              <Tooltip contentStyle={tooltipStyle} />

              <Legend iconType="circle" wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      <ChartCard title="ស្ថានភាពវិក្កយបត្រ" description="បង់ / មិនបង់ / ហួស">
        {totalBills === 0 ? (
          <EmptyChart description="ស្ថានភាពនឹងបង្ហាញនៅពេលមានវិក្កយបត្រ" />
        ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={billStatus}
            margin={{ top: 20, right: 18, left: -18, bottom: 10 }}
          >
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
              dy={8}
            />

            <YAxis
              tick={tickStyle}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={28}
            />

            <Tooltip
              cursor={{ fill: "var(--panel-hover)" }}
              contentStyle={tooltipStyle}
            />

            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={34}>
              {billStatus.map((_, index) => (
                <Cell
                  key={index}
                  fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        title="ស្ថានភាពការទូទាត់"
        description="រង់ចាំ / អនុម័ត / បដិសេធ"
      >
        {totalPayments === 0 ? (
          <EmptyChart description="ស្ថានភាពនឹងបង្ហាញនៅពេលមានការទូទាត់" />
        ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={paymentStatus}
            margin={{ top: 20, right: 18, left: -18, bottom: 10 }}
          >
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
              dy={8}
            />

            <YAxis
              tick={tickStyle}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={28}
            />

            <Tooltip
              cursor={{ fill: "var(--panel-hover)" }}
              contentStyle={tooltipStyle}
            />

            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={38}>
              {paymentStatus.map((_, index) => (
                <Cell
                  key={index}
                  fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
