"use client";

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

const tickStyle = {
  fill: "#a1a1aa",
  fontSize: 10,
  fontFamily: "var(--font-khmer), Inter, system-ui, sans-serif",
};

const tooltipStyle = {
  background: "#0b0d19",
  border: "1px solid #27272a",
  borderRadius: "10px",
  color: "#fff",
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
    <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </div>

      <div className="dashboard-chart h-[300px] w-full">{children}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center text-sm text-zinc-500">
      មិនទាន់មានទិន្នន័យ
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
  const hasRevenueData = revenueByMonth.some((item) => item.revenue > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <ChartCard title="ចំណូលតាមខែ" description="ចំណូលពីវិក្កយបត្រដែលបានបង់">
        {!hasRevenueData ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={revenueByMonth}
              margin={{ top: 20, right: 24, left: 4, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
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
                formatter={(value: number) => [
                  `$${Number(value).toFixed(2)}`,
                  "ចំណូល",
                ]}
                labelStyle={{ color: "#fff" }}
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
        )}
      </ChartCard>
      <ChartCard title="ស្ថានភាពបន្ទប់" description="ទំនេរ / មិនទំនេរ / ជួសជុល">
        {totalRooms === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
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
                    stroke="#131626"
                    strokeWidth={3}
                  />
                ))}
              </Pie>

              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
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
                fill="#a1a1aa"
                fontSize={11}
              >
                បន្ទប់សរុប
              </text>

              <Tooltip contentStyle={tooltipStyle} />

              <Legend
                iconType="circle"
                wrapperStyle={{
                  color: "#a1a1aa",
                  fontSize: "11px",
                  fontFamily: "var(--font-khmer), Inter, system-ui, sans-serif",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      <ChartCard title="ស្ថានភាពវិក្កយបត្រ" description="បង់ / មិនបង់ / ហួស">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={billStatus}
            margin={{ top: 20, right: 18, left: -18, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
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
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
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
      </ChartCard>

      <ChartCard
        title="ស្ថានភាពការទូទាត់"
        description="រង់ចាំ / អនុម័ត / បដិសេធ"
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={paymentStatus}
            margin={{ top: 20, right: 18, left: -18, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
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
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
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
      </ChartCard>
    </div>
  );
}
