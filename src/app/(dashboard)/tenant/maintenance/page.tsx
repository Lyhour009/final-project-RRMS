import { CheckCircle, Clock, Wrench } from "lucide-react";
import {
  createTenantMaintenanceRequest,
  getTenantMaintenanceData,
} from "@/actions/tenants/maintenances";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";

function StatusBadge({ status }: { status: string }) {
  const tone = status === "pending" ? "amber" : status === "in_progress" ? "blue" : status === "resolved" ? "green" : "gray";
  const labels: Record<string, string> = { pending: "រង់ចាំ", in_progress: "កំពុងធ្វើ", resolved: "រួចរាល់" };
  return <Badge tone={tone}>{labels[status] || status}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const tone = priority === "low" ? "green" : priority === "medium" ? "amber" : priority === "high" ? "red" : "gray";
  const labels: Record<string, string> = { low: "ទាប", medium: "មធ្យម", high: "ខ្ពស់" };
  return <Badge tone={tone} dot={false}>{labels[priority] || priority}</Badge>;
}

export default async function TenantMaintenancePage() {
  const { contract, requests } = await getTenantMaintenanceData();

  const pending = requests.filter(
    (item) => item.status === "pending",
  ).length;
  const inProgress = requests.filter(
    (item) => item.status === "in_progress",
  ).length;
  const resolved = requests.filter(
    (item) => item.status === "resolved",
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">សំណើជួសជុល</h1>
        <p className="text-sm text-(--panel-text-subtle) mt-1">
          បង្កើតសំណើជួសជុល និងតាមដានស្ថានភាពសំណើរបស់អ្នក
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard title="រង់ចាំ" value={pending} icon={<Clock size={16} />} tone="amber" />
        <StatCard title="កំពុងធ្វើ" value={inProgress} icon={<Wrench size={16} />} tone="blue" />
        <StatCard title="រួចរាល់" value={resolved} icon={<CheckCircle size={16} />} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold mb-4">បង្កើតសំណើថ្មី</h2>

          {!contract ? (
            <p className="text-sm text-(--panel-text-subtle)">
              អ្នកមិនទាន់មានបន្ទប់សកម្មទេ មិនអាចបង្កើតសំណើជួសជុលបាន។
            </p>
          ) : (
            <form action={createTenantMaintenanceRequest} className="space-y-4">
              <div className="rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3">
                <p className="text-xs text-(--panel-text-subtle)">បន្ទប់របស់អ្នក</p>
                <p className="text-sm font-medium">
                  #{contract.rooms?.room_number} — {contract.rooms?.room_type}
                </p>
              </div>

              <div>
                <label className="text-sm text-(--panel-text-muted)">ចំណងជើងបញ្ហា</label>
                <input
                  name="issue_title"
                  required
                  minLength={2}
                  placeholder="ឧ. ម៉ាស៊ីនត្រជាក់ខូច"
                  className="mt-1 h-10 w-full rounded-lg border border-(--panel-border) bg-(--panel-inset) px-3 text-sm text-(--panel-text) placeholder-(--panel-text-subtle)"
                />
              </div>

              <div>
                <label className="text-sm text-(--panel-text-muted)">អាទិភាព</label>
                <select
                  name="priority"
                  required
                  defaultValue="medium"
                  className="mt-1 h-10 w-full rounded-lg border border-(--panel-border) bg-(--panel-inset) px-3 text-sm text-(--panel-text)"
                >
                  <option value="low">ទាប</option>
                  <option value="medium">មធ្យម</option>
                  <option value="high">ខ្ពស់</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-(--panel-text-muted)">ការពិពណ៌នា</label>
                <textarea
                  name="issue_description"
                  required
                  minLength={5}
                  rows={5}
                  placeholder="ពិពណ៌នាបញ្ហាឲ្យបានច្បាស់..."
                  className="mt-1 w-full rounded-lg border border-(--panel-border) bg-(--panel-inset) px-3 py-2 text-sm text-(--panel-text) placeholder-(--panel-text-subtle)"
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

        <div className="xl:col-span-2 rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold mb-4">ប្រវត្តិសំណើជួសជុល</h2>

          <div className="space-y-2">
            {requests.length === 0 ? (
              <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានសំណើជួសជុល</p>
            ) : (
              requests.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-(--panel-border) bg-(--panel-inset) p-3.5 transition hover:border-indigo-400/30 hover:bg-(--panel)"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Wrench size={16} className="text-indigo-500 dark:text-indigo-400" />
                        <p className="text-sm font-semibold text-(--panel-text)">
                          {item.issue_title}
                        </p>
                      </div>

                      <p className="text-sm text-(--panel-text-subtle) mt-2">
                        {item.issue_description}
                      </p>

                      <p className="text-xs text-(--panel-text-subtle) mt-2">
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
