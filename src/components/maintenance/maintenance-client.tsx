"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Wrench, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import MaintenanceFormModal from "@/components/maintenance/maintenanace-form-modal";
import DeleteMaintenanceModal from "@/components/maintenance/maintenance-delete-modal";
import type {
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority,
} from "@/types/maintenance";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MaintenanceClientProps {
  initialRequests: MaintenanceRequest[];
  tenants: { id: string; full_name: string }[];
  rooms: { id: string; room_number: string }[];
  staff: { id: string; full_name: string }[];
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<MaintenanceStatus, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const STATUS_LABEL: Record<MaintenanceStatus, string> = {
  pending: "រង់ចាំ",
  in_progress: "កំពុងដោះស្រាយ",
  resolved: "រួចរាល់",
};

const PRIORITY_STYLE: Record<MaintenancePriority, string> = {
  low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const PRIORITY_LABEL: Record<MaintenancePriority, string> = {
  low: "ទាប",
  normal: "មធ្យម",
  high: "បន្ទាន់",
};

function StatusBadge({ status }: { status: MaintenanceStatus }) {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-md border text-xs",
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-md border text-xs",
        PRIORITY_STYLE[priority],
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
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

// ─── Filter Button ────────────────────────────────────────────────────────────

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
        active
          ? "bg-indigo-600 text-white border-indigo-500"
          : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:border-indigo-500/40 hover:text-slate-200",
      )}
    >
      {children}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MaintenanceClient({
  initialRequests,
  tenants,
  rooms,
  staff,
}: MaintenanceClientProps) {
  const [requests, setRequests] =
    useState<MaintenanceRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | "all">(
    "all",
  );
  const [filterPriority, setFilterPriority] = useState<
    MaintenancePriority | "all"
  >("all");

  // Modal state
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);

  // ─── Stats ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      in_progress: requests.filter((r) => r.status === "in_progress").length,
      resolved: requests.filter((r) => r.status === "resolved").length,
    };
  }, [requests]);

  // ─── Filtered ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.issue_title?.toLowerCase().includes(q) ||
        r.profiles?.full_name?.toLowerCase().includes(q) ||
        r.rooms?.room_number?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      const matchPriority =
        filterPriority === "all" || r.priority === filterPriority;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [requests, search, filterStatus, filterPriority]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAddNew = () => {
    setSelected(null);
    setFormOpen(true);
  };

  const handleEdit = (req: MaintenanceRequest) => {
    setSelected(req);
    setFormOpen(true);
  };

  const handleDeleteClick = (req: MaintenanceRequest) => {
    setSelected(req);
    setDeleteOpen(true);
  };

  const handleSuccess = (updated: MaintenanceRequest, type: "add" | "edit") => {
    if (type === "add") {
      setRequests((prev) => [updated, ...prev]);
    } else {
      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
    }
  };

  const handleDeleteSuccess = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 font-khmer">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            គ្រប់គ្រងការជួសជុល
          </h1>
          <p className="text-sm text-slate-400">
            តាមដាន និងដោះស្រាយបញ្ហារបស់បន្ទប់
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          ស្នើសុំជួសជុល
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="សរុប" value={stats.total} />
        <StatCard label="រង់ចាំ" value={stats.pending} dot="bg-amber-400" />
        <StatCard
          label="កំពុងដោះស្រាយ"
          value={stats.in_progress}
          dot="bg-blue-400"
        />
        <StatCard label="រួចរាល់" value={stats.resolved} dot="bg-emerald-400" />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកបញ្ហា, អ្នកជួល, ឬបន្ទប់..."
            className="w-full bg-[#0B0F19]/80 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { val: "all", label: "ទាំងអស់" },
              { val: "pending", label: "រង់ចាំ" },
              { val: "in_progress", label: "កំពុង" },
              { val: "resolved", label: "រួចរាល់" },
            ] as { val: MaintenanceStatus | "all"; label: string }[]
          ).map(({ val, label }) => (
            <FilterBtn
              key={val}
              active={filterStatus === val}
              onClick={() => setFilterStatus(val)}
            >
              {label}
            </FilterBtn>
          ))}
        </div>

        {/* Priority filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { val: "all", label: "អាទិភាពទាំងអស់" },
              { val: "high", label: "បន្ទាន់" },
              { val: "normal", label: "មធ្យម" },
              { val: "low", label: "ទាប" },
            ] as { val: MaintenancePriority | "all"; label: string }[]
          ).map(({ val, label }) => (
            <FilterBtn
              key={val}
              active={filterPriority === val}
              onClick={() => setFilterPriority(val)}
            >
              {label}
            </FilterBtn>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B0F19]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 text-[13px]">
              <tr>
                <th className="px-6 py-4">បញ្ហា</th>
                <th className="px-6 py-4">អ្នកជួល</th>
                <th className="px-6 py-4">បន្ទប់</th>
                <th className="px-6 py-4">អាទិភាព</th>
                <th className="px-6 py-4">ស្ថានភាព</th>
                <th className="px-6 py-4">ថ្ងៃស្នើ</th>
                <th className="px-6 py-4">ថ្ងៃដោះស្រាយ</th>
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
                    {search ||
                    filterStatus !== "all" ||
                    filterPriority !== "all"
                      ? "រកមិនឃើញលទ្ធផល"
                      : "គ្មានទិន្នន័យ"}
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-white/[0.02] group transition-colors"
                  >
                    {/* Issue title */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-[200px]">
                        <Wrench className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-200 font-medium leading-snug line-clamp-2">
                          {req.issue_title}
                        </span>
                      </div>
                    </td>

                    {/* Tenant */}
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {req.profiles?.full_name ?? "—"}
                    </td>

                    {/* Room */}
                    <td className="px-6 py-4">
                      {req.rooms?.room_number ? (
                        <span className="text-indigo-400 font-medium text-sm">
                          #{req.rooms.room_number}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-sm">—</span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {req.created_at
                        ? format(new Date(req.created_at), "dd/MM/yyyy")
                        : "—"}
                    </td>

                    {/* Resolved */}
                    <td className="px-6 py-4 text-xs">
                      {req.resolved_at ? (
                        <span className="text-emerald-400">
                          {format(new Date(req.resolved_at), "dd/MM/yyyy")}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(req)}
                          className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="កែប្រែ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(req)}
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
      <MaintenanceFormModal
        open={isFormOpen}
        onOpenChange={setFormOpen}
        request={selected}
        onSuccess={handleSuccess}
        tenants={tenants}
        rooms={rooms}
        staff={staff}
      />
      <DeleteMaintenanceModal
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        request={selected}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
