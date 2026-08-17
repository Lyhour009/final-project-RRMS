"use client";

import { BarChart3 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

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
  contentClassName,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-(--panel-text)">{title}</h2>
        <p className="text-xs text-(--panel-text-subtle) mt-1">{description}</p>
      </div>

      <div className={cn("dashboard-chart w-full", contentClassName || "h-52")}>
        {children}
      </div>
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
  // Explicit axis max instead of Recharts' default "nice" auto-domain,
  // which rounds up (an actual max of 3 becomes an axis max of 4-5) and
  // leaves every bar looking shorter than it is.
  const billStatusMax = Math.max(1, ...billStatus.map((item) => item.value));
  const paymentStatusMax = Math.max(1, ...paymentStatus.map((item) => item.value));
  const hasRevenueData = revenueByMonth.some((item) => item.revenue > 0);
  // An area/line needs 2+ points to draw an actual shape — with only one
  // month of history, `<AreaChart>` renders a single floating dot with
  // nothing connecting it, which reads as broken rather than "not much
  // data yet". A bar reads as complete and deliberate even with one value.
  const hasTrendData = hasRevenueData && revenueByMonth.length >= 2;

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <ChartCard title="ចំណូលតាមខែ" description="ចំណូលពីវិក្កយបត្រដែលបានបង់">
        {!hasRevenueData ? (
          <EmptyChart description="ចំណូលនឹងបង្ហាញនៅពេលវិក្កយបត្រត្រូវបានបង់" />
        ) : hasTrendData ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
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
                cursor={{ stroke: "var(--panel-border)", strokeWidth: 1 }}
              />

              {/* Flat solid fill at low opacity instead of a gradient def —
                  gives the trend line visual weight without an actual
                  gradient, matching the flat-color design used elsewhere. */}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={3}
                fill="#22c55e"
                fillOpacity={0.12}
                dot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "var(--panel)" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--panel)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col">
            <ResponsiveContainer width="100%" height={170}>
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

                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} barSize={44} fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>

            <p className="text-center text-xs text-(--panel-text-subtle) -mt-2">
              និន្នាការនឹងបង្ហាញនៅពេលមានទិន្នន័យលើសពី ១ ខែ
            </p>
          </div>
        )}
      </ChartCard>
      <ChartCard
        title="ស្ថានភាពបន្ទប់"
        description="ទំនេរ / មិនទំនេរ / ជួសជុល"
        contentClassName={totalRooms === 0 ? "h-52" : "h-60"}
      >
        {totalRooms === 0 ? (
          <EmptyChart description="បន្ថែមបន្ទប់ដើម្បីមើលសមាមាត្រការកាន់កាប់" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roomStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={72}
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
                fontSize={19}
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
                fontSize={10}
              >
                បន្ទប់សរុប
              </text>

              <Tooltip contentStyle={tooltipStyle} />

              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ ...legendStyle, paddingTop: 10, lineHeight: "20px" }}
                formatter={(value: string) => {
                  const entry = roomStatus.find((item) => item.name === value);
                  const pct = totalRooms > 0 ? Math.round(((entry?.value ?? 0) / totalRooms) * 100) : 0;
                  return `${value} (${pct}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      <ChartCard
        title="ស្ថានភាពវិក្កយបត្រ"
        description="បង់ / មិនបង់ / ហួស"
        contentClassName="h-37"
      >
        {totalBills === 0 ? (
          <EmptyChart description="ស្ថានភាពនឹងបង្ហាញនៅពេលមានវិក្កយបត្រ" />
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={billStatus}
            layout="vertical"
            margin={{ top: 4, right: 28, left: 0, bottom: 4 }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--panel-border)"
              horizontal={false}
            />

            {/* Recharts' default "nice" auto-domain rounds the max up
                (e.g. an actual max of 3 becomes an axis max of 4-5), which
                left short bars looking stranded under empty headroom.
                Scaling to the real max instead means the longest bar
                always reaches the end of the chart. */}
            <XAxis type="number" hide domain={[0, billStatusMax]} />

            <YAxis
              type="category"
              dataKey="name"
              tick={tickStyle}
              tickLine={false}
              axisLine={false}
              width={64}
            />

            <Tooltip
              cursor={{ fill: "var(--panel-hover)" }}
              contentStyle={tooltipStyle}
            />

            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
              {billStatus.map((_, index) => (
                <Cell
                  key={index}
                  fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                fill="var(--panel-text)"
                fontSize={11}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        title="ស្ថានភាពការទូទាត់"
        description="រង់ចាំ / អនុម័ត / បដិសេធ"
        contentClassName="h-37"
      >
        {totalPayments === 0 ? (
          <EmptyChart description="ស្ថានភាពនឹងបង្ហាញនៅពេលមានការទូទាត់" />
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={paymentStatus}
            layout="vertical"
            margin={{ top: 4, right: 28, left: 0, bottom: 4 }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--panel-border)"
              horizontal={false}
            />

            <XAxis type="number" hide domain={[0, paymentStatusMax]} />

            <YAxis
              type="category"
              dataKey="name"
              tick={tickStyle}
              tickLine={false}
              axisLine={false}
              width={64}
            />

            <Tooltip
              cursor={{ fill: "var(--panel-hover)" }}
              contentStyle={tooltipStyle}
            />

            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
              {paymentStatus.map((_, index) => (
                <Cell
                  key={index}
                  fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                fill="var(--panel-text)"
                fontSize={11}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
