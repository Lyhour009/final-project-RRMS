import { CheckCircle, Clock, Wrench } from "lucide-react";
import {
  createTenantMaintenanceRequest,
  getTenantMaintenanceData,
} from "@/actions/tenants/maintenances";

const BADGE_TONES = {
  green: { className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
  amber: { className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
  blue: { className: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
  red: { className: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300", dot: "bg-red-500" },
  gray: { className: "border-zinc-500/20 bg-zinc-500/10 text-(--panel-text-muted)", dot: "bg-zinc-400" },
} as const;

function Badge({ tone, label }: { tone: keyof typeof BADGE_TONES; label: string }) {
  const { className, dot } = BADGE_TONES[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "pending" ? "amber" : status === "in_progress" ? "blue" : status === "resolved" ? "green" : "gray";
  const labels: Record<string, string> = { pending: "រង់ចាំ", in_progress: "កំពុងធ្វើ", resolved: "រួចរាល់" };
  return <Badge tone={tone} label={labels[status] || status} />;
}

function PriorityBadge({ priority }: { priority: string }) {
  const tone = priority === "low" ? "green" : priority === "medium" ? "amber" : priority === "high" ? "red" : "gray";
  const labels: Record<string, string> = { low: "ទាប", medium: "មធ្យម", high: "ខ្ពស់" };
  return <Badge tone={tone} label={labels[priority] || priority} />;
}

const STAT_TONES = {
  amber: { accent: "bg-amber-500", icon: "bg-amber-500/10 text-amber-600 dark:text-amber-300" },
  blue: { accent: "bg-blue-500", icon: "bg-blue-500/10 text-blue-600 dark:text-blue-300" },
  emerald: { accent: "bg-emerald-500", icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
} as const;

function StatCard({ title, value, icon, tone }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tone: keyof typeof STAT_TONES;
}) {
  const styles = STAT_TONES[tone];
  return (
    <div className="group relative overflow-hidden rounded-xl border border-(--panel-border) bg-(--panel) p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5 dark:hover:shadow-black/20">
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-(--panel-text-muted)">{title}</p>
        <div className={`shrink-0 rounded-lg p-1.5 ${styles.icon}`}>{icon}</div>
      </div>
      <p className="mt-1.5 text-lg font-bold leading-none tracking-tight">{value}</p>
    </div>
  );
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
