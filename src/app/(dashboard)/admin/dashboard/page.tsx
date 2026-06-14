import {
  Building2,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  Users,
} from "lucide-react";

import { getDashboardStats } from "@/actions/dashboard";
import { AdminDashboardCharts } from "@/components/dashboard/admin-dashboard-chart";
import { DashboardActionCards } from "@/components/dashboard/admin-dashboard-action-card";
import { RecentDashboardTables } from "@/components/dashboard/recent-dashboard-tables";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "text-indigo-400",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-5 hover:border-indigo-500/30 transition-all">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <div className={color}>{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">📊 Dashboard</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          ស្ថិតិ និងសកម្មភាពទាំងអស់ក្នុងប្រព័ន្ធ RRMS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <StatCard
          title="បន្ទប់សរុប"
          value={stats.cards.totalRooms}
          subtitle={`${stats.cards.availableRooms} ទំនេរ / ${stats.cards.occupiedRooms} មានអ្នកជួល`}
          icon={<Building2 size={22} />}
          color="text-blue-400"
        />

        <StatCard
          title="បន្ទប់មានអ្នកជួល"
          value={stats.cards.occupiedRooms}
          subtitle="បន្ទប់កំពុងប្រើប្រាស់"
          icon={<Home size={22} />}
          color="text-indigo-400"
        />

        <StatCard
          title="អ្នកជួល"
          value={stats.cards.totalTenants}
          subtitle="អ្នកជួលសរុប"
          icon={<Users size={22} />}
          color="text-indigo-400"
        />

        <StatCard
          title="កិច្ចសន្យាសកម្ម"
          value={stats.cards.activeContracts}
          subtitle="កំពុងដំណើរការ"
          icon={<FileText size={22} />}
          color="text-emerald-400"
        />

        <StatCard
          title="ចំណូលខែនេះ"
          value={`$${stats.cards.monthlyRevenue.toFixed(2)}`}
          subtitle="ពីវិក្កយបត្របានបង់"
          icon={<DollarSign size={22} />}
          color="text-emerald-400"
        />

        <StatCard
          title="Pending Payment"
          value={stats.cards.pendingPayments}
          subtitle="រង់ចាំអនុម័ត"
          icon={<CreditCard size={22} />}
          color="text-amber-400"
        />
      </div>

      <DashboardActionCards cards={stats.cards} />

      <AdminDashboardCharts
        roomStatus={stats.charts.roomStatus}
        billStatus={stats.charts.billStatus}
        paymentStatus={stats.charts.paymentStatus}
        revenueByMonth={stats.charts.revenueByMonth}
      />

      <RecentDashboardTables recent={stats.recent} />
    </div>
  );
}
