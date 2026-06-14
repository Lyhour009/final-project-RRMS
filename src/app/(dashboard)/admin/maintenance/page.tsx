import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Wrench,
} from "lucide-react";
import {
  deleteMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceStatus,
} from "@/actions/maintenances";

function StatusBadge({ status }: { status: string }) {
  let className = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  if (status === "pending") {
    className = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  if (status === "in_progress") {
    className = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }

  if (status === "resolved") {
    className = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  const labels: Record<string, string> = {
    pending: "រង់ចាំ",
    in_progress: "កំពុងធ្វើ",
    resolved: "រួចរាល់",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {labels[status] || status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  let className = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  if (priority === "low") {
    className = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (priority === "medium") {
    className = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  if (priority === "high") {
    className = "bg-red-500/10 text-red-400 border-red-500/20";
  }

  const labels: Record<string, string> = {
    low: "ទាប",
    medium: "មធ្យម",
    high: "ខ្ពស់",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {labels[priority] || priority}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <div className={color}>{icon}</div>
      </div>

      <p className="text-2xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}

export default async function AdminMaintenancePage() {
  const requests = await getMaintenanceRequests();

  const pending = requests.filter(
    (item: any) => item.status === "pending",
  ).length;
  const inProgress = requests.filter(
    (item: any) => item.status === "in_progress",
  ).length;
  const resolved = requests.filter(
    (item: any) => item.status === "resolved",
  ).length;
  const highPriority = requests.filter(
    (item: any) => item.priority === "high",
  ).length;

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">🔧 គ្រប់គ្រងសំណើជួសជុល</h1>
        <p className="text-sm text-zinc-500 mt-1">
          ពិនិត្យ និងធ្វើបច្ចុប្បន្នភាពសំណើជួសជុលពីអ្នកជួល
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="រង់ចាំ"
          value={pending}
          icon={<Clock size={20} />}
          color="text-amber-400"
        />

        <StatCard
          title="កំពុងធ្វើ"
          value={inProgress}
          icon={<AlertTriangle size={20} />}
          color="text-blue-400"
        />

        <StatCard
          title="រួចរាល់"
          value={resolved}
          icon={<CheckCircle size={20} />}
          color="text-emerald-400"
        />

        <StatCard
          title="អាទិភាពខ្ពស់"
          value={highPriority}
          icon={<Wrench size={20} />}
          color="text-red-400"
        />
      </div>

      <div className="bg-[#131626] rounded-xl border border-zinc-800/60 overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60">
          <h2 className="text-base font-semibold text-white">
            សំណើជួសជុលទាំងអស់
          </h2>
        </div>

        <div className="overflow-x-auto max-h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="sticky top-0 bg-[#131626] z-10 border-b border-zinc-800 text-zinc-400 text-xs uppercase">
              <tr>
                <th className="p-4 bg-[#131626]">អ្នកជួល</th>
                <th className="p-4 bg-[#131626]">បន្ទប់</th>
                <th className="p-4 bg-[#131626]">បញ្ហា</th>
                <th className="p-4 bg-[#131626]">អាទិភាព</th>
                <th className="p-4 bg-[#131626]">ស្ថានភាព</th>
                <th className="p-4 bg-[#131626]">កាលបរិច្ឆេទ</th>
                <th className="p-4 text-right bg-[#131626]">សកម្មភាព</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/50 text-sm">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    មិនទាន់មានសំណើជួសជុល
                  </td>
                </tr>
              ) : (
                requests.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-semibold text-zinc-200">
                        {item.profiles?.full_name || "-"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.profiles?.phone_number || "-"}
                      </p>
                    </td>

                    <td className="p-4 text-zinc-300">
                      #{item.rooms?.room_number || "-"}
                    </td>

                    <td className="p-4 max-w-md">
                      <p className="font-medium text-zinc-200">
                        {item.issue_title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                        {item.issue_description}
                      </p>
                    </td>

                    <td className="p-4">
                      <PriorityBadge priority={item.priority} />
                    </td>

                    <td className="p-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="p-4 text-zinc-400">
                      {item.created_at?.slice(0, 10)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {item.status === "pending" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateMaintenanceStatus(
                                item.id,
                                "in_progress",
                              );
                            }}
                          >
                            <button className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
                              In Progress
                            </button>
                          </form>
                        )}

                        {item.status !== "resolved" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateMaintenanceStatus(
                                item.id,
                                "resolved",
                              );
                            }}
                          >
                            <button className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700">
                              Resolve
                            </button>
                          </form>
                        )}

                        {item.status !== "resolved" && (
                          <form
                            action={async () => {
                              "use server";
                              await deleteMaintenanceRequest(item.id);
                            }}
                          >
                            <button className="h-8 w-8 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 inline-flex items-center justify-center">
                              <Trash2 size={14} />
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
