"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Receipt,
  Search,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import BillFormModal from "@/components/bill/bill-form-modal";
import DeleteBillModal from "@/components/bill/bill-delete-modal";
import { markBillPaidAction } from "@/actions/bills";
import type { Bill, BillStatus } from "@/types/bill";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BillsClientProps {
  initialBills: Bill[];
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  unpaid: {
    label: "មិនទាន់បង់",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  paid: {
    label: "បានបង់",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  overdue: {
    label: "ហួសកំណត់",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-400",
  },
};

function BillStatusBadge({ status }: { status: BillStatus }) {
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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  dot,
  sub,
}: {
  label: string;
  value: number | string;
  dot?: string;
  sub?: string;
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
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillsClient({ initialBills }: BillsClientProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BillStatus | "all">("all");
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Bill | null>(null);

  // ─── Stats ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = bills.length;
    const unpaid = bills.filter((b) => b.status === "unpaid").length;
    const paid = bills.filter((b) => b.status === "paid").length;
    const overdue = bills.filter((b) => b.status === "overdue").length;
    const totalUnpaidAmount = bills
      .filter((b) => b.status !== "paid")
      .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);
    return { total, unpaid, paid, overdue, totalUnpaidAmount };
  }, [bills]);

  // ─── Filtered ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return bills.filter((b) => {
      const matchSearch =
        !q ||
        b.profiles?.full_name?.toLowerCase().includes(q) ||
        b.contracts?.rooms?.room_number?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || b.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [bills, search, filterStatus]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAddNew = () => {
    setSelected(null);
    setFormOpen(true);
  };

  const handleEdit = (bill: Bill) => {
    setSelected(bill);
    setFormOpen(true);
  };

  const handleDeleteClick = (bill: Bill) => {
    setSelected(bill);
    setDeleteOpen(true);
  };

  const handleSuccess = (updated: Bill, type: "add" | "edit") => {
    if (type === "add") {
      setBills((prev) => [updated, ...prev]);
    } else {
      setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    }
  };

  const handleDeleteSuccess = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const handleMarkPaid = async (bill: Bill) => {
    if (bill.status === "paid") return;
    setMarkingPaid(bill.id);
    try {
      const result = await markBillPaidAction(bill.id);
      if (result.success && result.data) {
        setBills((prev) =>
          prev.map((b) => (b.id === bill.id ? (result.data as Bill) : b)),
        );
      }
    } finally {
      setMarkingPaid(null);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 font-khmer">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            គ្រប់គ្រងវិក្កយបត្រ
          </h1>
          <p className="text-sm text-slate-400">
            គ្រប់គ្រង និងតាមដានវិក្កយបត្រ ទឹក ភ្លើង និងបន្ទប់
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          បង្កើតវិក្កយបត្រ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="វិក្កយបត្រសរុប" value={stats.total} />
        <StatCard
          label="មិនទាន់បង់"
          value={stats.unpaid}
          dot="bg-amber-400"
          sub={`$${stats.totalUnpaidAmount.toFixed(0)} នៅសល់`}
        />
        <StatCard label="បានបង់" value={stats.paid} dot="bg-emerald-400" />
        <StatCard label="ហួសកំណត់" value={stats.overdue} dot="bg-rose-400" />
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខបន្ទប់..."
            className="w-full bg-[#0B0F19]/80 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-[#0B0F19]/80 border border-white/[0.08] rounded-xl p-1">
          {(["all", "unpaid", "paid", "overdue"] as const).map((s) => (
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
                <th className="px-6 py-4">ខែ</th>
                <th className="px-6 py-4">ថ្លៃបន្ទប់</th>
                <th className="px-6 py-4">ទឹក</th>
                <th className="px-6 py-4">ភ្លើង</th>
                <th className="px-6 py-4 font-semibold text-white">សរុប</th>
                <th className="px-6 py-4">ស្ថានភាព</th>
                <th className="px-6 py-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-10 text-center text-slate-500 text-sm"
                  >
                    {search || filterStatus !== "all"
                      ? "រកមិនឃើញលទ្ធផល"
                      : "គ្មានទិន្នន័យ"}
                  </td>
                </tr>
              ) : (
                filtered.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-white/[0.02] group transition-colors"
                  >
                    {/* Tenant */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                          {bill.profiles?.full_name?.charAt(0).toUpperCase() ??
                            "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200 text-sm">
                            {bill.profiles?.full_name ?? "—"}
                          </p>
                          {bill.profiles?.phone_number && (
                            <p className="text-[11px] text-slate-500">
                              {bill.profiles.phone_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Room */}
                    <td className="px-6 py-4">
                      <span className="text-indigo-400 font-medium text-sm">
                        #{bill.contracts?.rooms?.room_number ?? "—"}
                      </span>
                    </td>

                    {/* Billing month */}
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {bill.billing_month
                        ? format(parseISO(bill.billing_month), "MM/yyyy")
                        : "—"}
                    </td>

                    {/* Room fee */}
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      ${bill.room_fee?.toFixed(0) ?? "0"}
                    </td>

                    {/* Water fee */}
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <span className="text-sky-400">
                          ${bill.water_fee?.toFixed(0) ?? "0"}
                        </span>
                        {bill.water_meter_start != null &&
                          bill.water_meter_end != null && (
                            <p className="text-[10px] text-slate-600">
                              {bill.water_meter_start}→{bill.water_meter_end}
                            </p>
                          )}
                      </div>
                    </td>

                    {/* Elec fee */}
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <span className="text-yellow-400">
                          ${bill.elec_fee?.toFixed(0) ?? "0"}
                        </span>
                        {bill.elec_meter_start != null &&
                          bill.elec_meter_end != null && (
                            <p className="text-[10px] text-slate-600">
                              {bill.elec_meter_start}→{bill.elec_meter_end}
                            </p>
                          )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-emerald-400 text-sm">
                        ${bill.total_amount?.toFixed(0) ?? "0"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <BillStatusBadge status={bill.status} />
                      {bill.paid_at && (
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          {format(parseISO(bill.paid_at), "dd/MM/yy")}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {/* Mark paid */}
                        {bill.status !== "paid" && (
                          <button
                            onClick={() => handleMarkPaid(bill)}
                            disabled={markingPaid === bill.id}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="គិតថ្លៃបានបង់"
                          >
                            {markingPaid === bill.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(bill)}
                          className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="កែប្រែ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(bill)}
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
      <BillFormModal
        open={isFormOpen}
        onOpenChange={setFormOpen}
        bill={selected}
        onSuccess={handleSuccess}
      />
      <DeleteBillModal
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        bill={selected}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
