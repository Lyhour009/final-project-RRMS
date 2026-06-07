"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, FileText, Search, Calendar } from "lucide-react";
import { format, differenceInDays, isPast, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import ContractFormModal from "@/components/contract/contract-form-modal";
import DeleteContractModal from "@/components/contract/contract-delete-modal";
import type { Contract, ContractStatus } from "@/types/contract";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContractsClientProps {
  initialContracts: Contract[];
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  active: {
    label: "កំពុងស្នាក់នៅ",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  terminated: {
    label: "លុបចោលមុនកំណត់",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-400",
  },
  expired: {
    label: "ផុតកំណត់",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
};

function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-md border text-xs inline-flex items-center gap-1.5",
        cfg.bg,
        cfg.text,
        cfg.border,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─── Expiry pill ──────────────────────────────────────────────────────────────

function ExpiryPill({ endDate }: { endDate: string | null }) {
  if (!endDate) return <span className="text-slate-600 text-sm">—</span>;
  const end = parseISO(endDate);
  const days = differenceInDays(end, new Date());
  const past = isPast(end);

  if (past)
    return (
      <span className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md px-2 py-0.5">
        ផុតហើយ
      </span>
    );
  if (days <= 30)
    return (
      <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-0.5">
        {days} ថ្ងៃទៀត
      </span>
    );
  return (
    <span className="text-sm text-slate-400">{format(end, "dd/MM/yyyy")}</span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  dot,
}: {
  label: string;
  value: number;
  dot?: string;
}) {
  return (
    <div className="bg-[#0B0F19]/80 border border-white/[0.08] rounded-2xl px-5 py-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
        {dot && (
          <span className={cn("w-2 h-2 rounded-full inline-block", dot)} />
        )}
        {label}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContractsClient({
  initialContracts,
}: ContractsClientProps) {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ContractStatus | "all">(
    "all",
  );

  // Modal state
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);

  // ─── Stats ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => c.status === "active").length;
    const terminated = contracts.filter(
      (c) => c.status === "terminated",
    ).length;
    const expired = contracts.filter((c) => c.status === "expired").length;
    return { total, active, terminated, expired };
  }, [contracts]);

  // ─── Filtered ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return contracts.filter((c) => {
      const matchSearch =
        !q ||
        c.profiles?.full_name?.toLowerCase().includes(q) ||
        c.rooms?.room_number?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [contracts, search, filterStatus]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAddNew = () => {
    setSelected(null);
    setFormOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setSelected(contract);
    setFormOpen(true);
  };

  const handleDeleteClick = (contract: Contract) => {
    setSelected(contract);
    setDeleteOpen(true);
  };

  const handleSuccess = (updated: Contract, type: "add" | "edit") => {
    if (type === "add") {
      setContracts((prev) => [updated, ...prev]);
    } else {
      setContracts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    }
  };

  const handleDeleteSuccess = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 font-khmer">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            គ្រប់គ្រងកិច្ចសន្យា
          </h1>
          <p className="text-sm text-slate-400">
            គ្រប់គ្រង និងតាមដានកិច្ចសន្យាជួលទាំងអស់
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          បង្កើតកិច្ចសន្យា
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="កិច្ចសន្យាសរុប" value={stats.total} />
        <StatCard label="សកម្ម" value={stats.active} dot="bg-emerald-400" />
        <StatCard label="បញ្ចប់" value={stats.terminated} dot="bg-rose-400" />
        <StatCard label="ផុតកំណត់" value={stats.expired} dot="bg-amber-400" />
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះអ្នកជួល ឬលេខបន្ទប់..."
            className="w-full bg-[#0B0F19]/80 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-[#0B0F19]/80 border border-white/[0.08] rounded-xl p-1">
          {(["all", "active", "terminated", "expired"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filterStatus === s
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              {s === "all" ? "ទាំងអស់" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B0F19]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 text-[13px]">
              <tr>
                <th className="px-6 py-4">អ្នកជួល</th>
                <th className="px-6 py-4">បន្ទប់</th>
                <th className="px-6 py-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    ថ្ងៃចូលជួល
                  </span>
                </th>
                <th className="px-6 py-4">ថ្ងៃបញ្ចប់</th>
                <th className="px-6 py-4">ប្រាក់កក់</th>
                <th className="px-6 py-4">ថ្ងៃបង់</th>
                <th className="px-6 py-4">ស្ថានភាព</th>
                <th className="px-6 py-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-slate-500 text-sm"
                  >
                    {search || filterStatus !== "all"
                      ? "រកមិនឃើញលទ្ធផល"
                      : "គ្មានទិន្នន័យ"}
                  </td>
                </tr>
              ) : (
                filtered.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-white/[0.02] group transition-colors"
                  >
                    {/* Tenant */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                          {contract.profiles?.full_name
                            ?.charAt(0)
                            .toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200 text-sm">
                            {contract.profiles?.full_name ?? "—"}
                          </p>
                          {contract.profiles?.phone_number && (
                            <p className="text-[11px] text-slate-500">
                              {contract.profiles.phone_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Room */}
                    <td className="px-6 py-4">
                      {contract.rooms?.room_number ? (
                        <div>
                          <span className="text-indigo-400 font-medium text-sm">
                            #{contract.rooms.room_number}
                          </span>
                          {contract.rooms.room_type && (
                            <p className="text-[11px] text-slate-500 capitalize">
                              {contract.rooms.room_type}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-sm">—</span>
                      )}
                    </td>

                    {/* Start date */}
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {contract.start_date
                        ? format(parseISO(contract.start_date), "dd/MM/yyyy")
                        : "—"}
                    </td>

                    {/* End date with expiry warning */}
                    <td className="px-6 py-4">
                      <ExpiryPill endDate={contract.end_date} />
                    </td>

                    {/* Deposit */}
                    <td className="px-6 py-4 text-sm">
                      {contract.deposit_amount != null ? (
                        <span className="text-emerald-400 font-medium">
                          ${contract.deposit_amount.toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Due day */}
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {contract.due_day != null
                        ? `ថ្ងៃ ${contract.due_day}`
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <ContractStatusBadge status={contract.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(contract)}
                          className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="កែប្រែ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(contract)}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="លុប"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ContractFormModal
        open={isFormOpen}
        onOpenChange={setFormOpen}
        contract={selected}
        onSuccess={handleSuccess}
      />
      <DeleteContractModal
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        contract={selected}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
