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
  const cls =
    status === "active"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-zinc-500/10 text-(--panel-text-muted) border-zinc-500/20";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}
    >
      {status === "active" ? "សកម្ម" : status}
    </span>
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
    <div className="p-6 space-y-6 text-(--panel-text)">
      <div>
        <h1 className="text-2xl font-bold">📄 កិច្ចសន្យារបស់ខ្ញុំ</h1>
        <p className="text-sm text-(--panel-text-subtle) mt-1">
          ព័ត៌មានកិច្ចសន្យា និងបន្ទប់ជួលរបស់អ្នក
        </p>
      </div>

      {!contract ? (
        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-8 text-center text-(--panel-text-subtle)">
          មិនមានកិច្ចសន្យាសកម្មទេ។
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
              <Home className="text-blue-400 mb-3" size={22} />
              <p className="text-sm text-(--panel-text-muted)">បន្ទប់</p>
              <p className="text-2xl font-bold mt-1">#{room?.room_number}</p>
            </div>

            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
              <DollarSign className="text-emerald-400 mb-3" size={22} />
              <p className="text-sm text-(--panel-text-muted)">ថ្លៃបន្ទប់</p>
              <p className="text-2xl font-bold mt-1">
                ${Number(room?.base_price || 0).toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
              <CalendarDays className="text-amber-400 mb-3" size={22} />
              <p className="text-sm text-(--panel-text-muted)">ថ្ងៃបង់ប្រាក់</p>
              <p className="text-2xl font-bold mt-1">
                ថ្ងៃទី {contract.due_day}
              </p>
            </div>

            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
              <FileText className="text-indigo-400 mb-3" size={22} />
              <p className="text-sm text-(--panel-text-muted)">ស្ថានភាព</p>
              <div className="mt-2">
                <StatusBadge status={contract.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
              <h2 className="text-lg font-semibold mb-4">ព័ត៌មានកិច្ចសន្យា</h2>

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

            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
              <h2 className="text-lg font-semibold mb-4">ព័ត៌មានបន្ទប់</h2>

              {/* {room?.images?.[0] ? (
                <img
                  src={room.images[0]}
                  alt="Room"
                  className="h-44 w-full rounded-xl object-cover mb-4"
                />
              ) : (
                <div className="h-44 rounded-xl border border-(--panel-border) bg-(--panel-inset) flex items-center justify-center text-sm text-(--panel-text-subtle) mb-4">
                  No Room Image
                </div>
              )} */}

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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
              <h2 className="text-lg font-semibold mb-4">
                📊 ដំណើរការកិច្ចសន្យា
              </h2>

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
                  <span className="font-semibold text-emerald-400">
                    {getContractProgress(
                      contract.start_date,
                      contract.end_date,
                    )}
                    %
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
              <h2 className="text-lg font-semibold mb-4">
                📌 សង្ខេបកិច្ចសន្យា
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-(--panel-border) bg-(--panel-inset) p-4">
                  <p className="text-xs text-(--panel-text-subtle)">ថ្លៃបន្ទប់ប្រចាំខែ</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    ${Number(room?.base_price || 0).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl border border-(--panel-border) bg-(--panel-inset) p-4">
                  <p className="text-xs text-(--panel-text-subtle)">ប្រាក់កក់</p>
                  <p className="text-xl font-bold text-blue-400 mt-1">
                    ${Number(contract.deposit_amount || 0).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl border border-(--panel-border) bg-(--panel-inset) p-4">
                  <p className="text-xs text-(--panel-text-subtle)">ថ្ងៃបង់ប្រាក់</p>
                  <p className="text-xl font-bold text-amber-400 mt-1">
                    ថ្ងៃទី {contract.due_day}
                  </p>
                </div>

                <div className="rounded-xl border border-(--panel-border) bg-(--panel-inset) p-4">
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
