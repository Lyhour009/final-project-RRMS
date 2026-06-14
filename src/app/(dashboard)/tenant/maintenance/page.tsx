import { AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react";
import {
  createTenantMaintenanceRequest,
  getTenantMaintenanceData,
} from "@/actions/tenants/maintenances";

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

export default async function TenantMaintenancePage() {
  const { contract, requests } = await getTenantMaintenanceData();

  const pending = requests.filter(
    (item: any) => item.status === "pending",
  ).length;
  const inProgress = requests.filter(
    (item: any) => item.status === "in_progress",
  ).length;
  const resolved = requests.filter(
    (item: any) => item.status === "resolved",
  ).length;

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">🔧 សំណើជួសជុល</h1>
        <p className="text-sm text-zinc-500 mt-1">
          បង្កើតសំណើជួសជុល និងតាមដានស្ថានភាពសំណើរបស់អ្នក
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-4">
          <Clock className="text-amber-400 mb-2" size={20} />
          <p className="text-sm text-zinc-400">រង់ចាំ</p>
          <p className="text-2xl font-bold">{pending}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-4">
          <AlertTriangle className="text-blue-400 mb-2" size={20} />
          <p className="text-sm text-zinc-400">កំពុងធ្វើ</p>
          <p className="text-2xl font-bold">{inProgress}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-4">
          <CheckCircle className="text-emerald-400 mb-2" size={20} />
          <p className="text-sm text-zinc-400">រួចរាល់</p>
          <p className="text-2xl font-bold">{resolved}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-5">
          <h2 className="text-lg font-semibold mb-4">បង្កើតសំណើថ្មី</h2>

          {!contract ? (
            <p className="text-sm text-zinc-500">
              អ្នកមិនទាន់មានបន្ទប់សកម្មទេ មិនអាចបង្កើតសំណើជួសជុលបាន។
            </p>
          ) : (
            <form action={createTenantMaintenanceRequest}>
              <div className="rounded-xl border border-zinc-800 bg-[#0b0d19] p-3">
                <p className="text-xs text-zinc-500">បន្ទប់របស់អ្នក</p>
                <p className="text-sm font-medium">
                  #{contract.rooms?.room_number} — {contract.rooms?.room_type}
                </p>
              </div>

              <div>
                <label className="text-sm text-zinc-400">ចំណងជើងបញ្ហា</label>
                <input
                  name="issue_title"
                  required
                  minLength={2}
                  placeholder="ឧ. ម៉ាស៊ីនត្រជាក់ខូច"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-[#0b0d19] px-3 text-sm text-white placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">អាទិភាព</label>
                <select
                  name="priority"
                  required
                  defaultValue="medium"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-[#0b0d19] px-3 text-sm text-white"
                >
                  <option value="low">ទាប</option>
                  <option value="medium">មធ្យម</option>
                  <option value="high">ខ្ពស់</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-zinc-400">ការពិពណ៌នា</label>
                <textarea
                  name="issue_description"
                  required
                  minLength={5}
                  rows={5}
                  placeholder="ពិពណ៌នាបញ្ហាឲ្យបានច្បាស់..."
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#0b0d19] px-3 py-2 text-sm text-white placeholder-zinc-600"
                />
              </div>

              <button
                type="submit"
                className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
              >
                បញ្ជូនសំណើ
              </button>
            </form>
          )}
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-[#131626] p-5">
          <h2 className="text-lg font-semibold mb-4">ប្រវត្តិសំណើជួសជុល</h2>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-sm text-zinc-500">មិនទាន់មានសំណើជួសជុល</p>
            ) : (
              requests.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-800 bg-[#0b0d19] p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Wrench size={16} className="text-indigo-400" />
                        <p className="text-sm font-semibold text-white">
                          {item.issue_title}
                        </p>
                      </div>

                      <p className="text-sm text-zinc-500 mt-2">
                        {item.issue_description}
                      </p>

                      <p className="text-xs text-zinc-600 mt-2">
                        បន្ទប់ #{item.rooms?.room_number || "-"} ·{" "}
                        {item.created_at?.slice(0, 10)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={item.priority} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
