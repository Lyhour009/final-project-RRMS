import { CalendarDays, DollarSign, FileText, Home } from "lucide-react";
import { getTenantContract } from "@/actions/tenants/contract";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-(--panel-border)/60 pb-3">
      <span className="text-sm text-(--panel-text-subtle)">{label}</span>
      <span className="text-sm font-medium text-(--panel-text)">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  const className = isActive
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
    : "border-zinc-500/20 bg-zinc-500/10 text-(--panel-text-muted)";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
      {isActive ? "សកម្ម" : status}
    </span>
  );
}

const STAT_TONES = {
  blue: { accent: "bg-blue-500", icon: "bg-blue-500/10 text-blue-600 dark:text-blue-300" },
  emerald: { accent: "bg-emerald-500", icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
  amber: { accent: "bg-amber-500", icon: "bg-amber-500/10 text-amber-600 dark:text-amber-300" },
  indigo: { accent: "bg-indigo-500", icon: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300" },
} as const;

function StatCard({ title, value, icon, tone }: {
  title: string;
  value: React.ReactNode;
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
      <div className="mt-1.5 text-lg font-bold leading-none tracking-tight">{value}</div>
    </div>
  );
}

const ROOM_STATUS_LABELS: Record<string, string> = {
  available: "ទំនេរ",
  occupied: "មិនទំនេរ",
  maintenance: "ជួសជុល",
};

function getContractProgress(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (!start || !end || end <= start) return 0;

  const progress = ((now - start) / (end - start)) * 100;

  return Math.min(100, Math.max(0, Math.round(progress)));
}

export default async function TenantContractPage() {
  const contract = await getTenantContract();
  const room = contract?.rooms;

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">កិច្ចសន្យារបស់ខ្ញុំ</h1>
        <p className="text-sm text-(--panel-text-subtle) mt-1">
          ព័ត៌មានកិច្ចសន្យា និងបន្ទប់ជួលរបស់អ្នក
        </p>
      </div>

      {!contract ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-(--panel-border) bg-(--panel) px-6 text-center shadow-sm">
          <div className="mb-3 rounded-xl bg-indigo-500/10 p-3 text-indigo-500 dark:text-indigo-300">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-(--panel-text)">មិនមានកិច្ចសន្យាសកម្មទេ</p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-(--panel-text-subtle)">សូមទាក់ទងអ្នកគ្រប់គ្រងប្រសិនបើអ្នកគិតថានេះជាកំហុស។</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard title="បន្ទប់" value={`#${room?.room_number}`} icon={<Home size={16} />} tone="blue" />
            <StatCard title="ថ្លៃបន្ទប់" value={`$${Number(room?.base_price || 0).toFixed(2)}`} icon={<DollarSign size={16} />} tone="emerald" />
            <StatCard title="ថ្ងៃបង់ប្រាក់" value={`ថ្ងៃទី ${contract.due_day}`} icon={<CalendarDays size={16} />} tone="amber" />
            <StatCard title="ស្ថានភាព" value={<StatusBadge status={contract.status} />} icon={<FileText size={16} />} tone="indigo" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-semibold mb-4">ព័ត៌មានកិច្ចសន្យា</h2>

              <div className="space-y-3">
                <InfoRow label="ថ្ងៃចាប់ផ្តើម" value={contract.start_date} />
                <InfoRow label="ថ្ងៃបញ្ចប់" value={contract.end_date} />
                <InfoRow
                  label="ប្រាក់កក់"
                  value={`$${Number(contract.deposit_amount || 0).toFixed(2)}`}
                />
                <InfoRow
                  label="ថ្ងៃបង់ប្រាក់"
                  value={`ថ្ងៃទី ${contract.due_day}`}
                />
                <InfoRow
                  label="កាលបរិច្ឆេទបង្កើត"
                  value={contract.created_at?.slice(0, 10)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-semibold mb-4">ព័ត៌មានបន្ទប់</h2>

              <div className="space-y-3">
                <InfoRow label="លេខបន្ទប់" value={`#${room?.room_number}`} />
                <InfoRow label="ប្រភេទបន្ទប់" value={room?.room_type || "-"} />
                <InfoRow label="ជាន់" value={room?.floor || "-"} />
                <InfoRow
                  label="ស្ថានភាពបន្ទប់"
                  value={room?.status ? ROOM_STATUS_LABELS[room.status] || room.status : "-"}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-semibold mb-4">ដំណើរការកិច្ចសន្យា</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-(--panel-text-subtle)">ថ្ងៃចាប់ផ្តើម</span>
                  <span className="text-(--panel-text)">{contract.start_date}</span>
                </div>

                <div className="h-3 w-full rounded-full bg-(--panel-border) overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${getContractProgress(contract.start_date, contract.end_date)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-(--panel-text-subtle)">ថ្ងៃបញ្ចប់</span>
                  <span className="text-(--panel-text)">{contract.end_date}</span>
                </div>

                <p className="text-center text-sm text-(--panel-text-muted)">
                  កិច្ចសន្យាបានដំណើរការ{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {getContractProgress(
                      contract.start_date,
                      contract.end_date,
                    )}
                    %
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-semibold mb-4">សង្ខេបកិច្ចសន្យា</h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-(--panel-border) bg-(--panel-inset) p-3.5">
                  <p className="text-xs text-(--panel-text-subtle)">ថ្លៃបន្ទប់ប្រចាំខែ</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    ${Number(room?.base_price || 0).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-lg border border-(--panel-border) bg-(--panel-inset) p-3.5">
                  <p className="text-xs text-(--panel-text-subtle)">ប្រាក់កក់</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                    ${Number(contract.deposit_amount || 0).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-lg border border-(--panel-border) bg-(--panel-inset) p-3.5">
                  <p className="text-xs text-(--panel-text-subtle)">ថ្ងៃបង់ប្រាក់</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                    ថ្ងៃទី {contract.due_day}
                  </p>
                </div>

                <div className="rounded-lg border border-(--panel-border) bg-(--panel-inset) p-3.5">
                  <p className="text-xs text-(--panel-text-subtle)">ស្ថានភាព</p>
                  <div className="mt-2">
                    <StatusBadge status={contract.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
