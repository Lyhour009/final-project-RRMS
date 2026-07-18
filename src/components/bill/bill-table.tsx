"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit2,
  Loader2,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInfiniteReveal } from "@/hooks/use-infinite-reveal";
import { cn, formatKhmerDate } from "@/lib/utils";
import { Bill, BillStatus } from "@/lib/validations/bills";

import BillDeleteModal from "./bill-delete-modal";
import BillModal from "./bill-form-modal";

interface ContractOption {
  id: string;
  tenant_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  due_day: number;
  status: string;
  profiles?: { id: string; full_name: string; phone_number: string; email?: string };
  rooms?: { id: string; room_number: string; room_type: string; base_price: number; floor: number };
}

interface Settings {
  water_rate: number;
  electric_rate: number;
  currency?: string;
  monthly_due_day?: number;
}

interface BillTableProps {
  initialBills: Bill[];
  contracts: ContractOption[];
  settings: Settings;
}

type BillFilter = "all" | BillStatus;

const STATUS_LABELS: Record<BillStatus, string> = {
  unpaid: "មិនទាន់បង់",
  paid: "បានបង់",
  overdue: "ហួសកាលកំណត់",
};

const FILTER_OPTIONS: { value: BillFilter; label: string; activeClass: string }[] = [
  { value: "all", label: "ទាំងអស់", activeClass: "bg-indigo-600 text-white" },
  { value: "unpaid", label: "មិនទាន់បង់", activeClass: "bg-amber-600 text-white" },
  { value: "paid", label: "បានបង់", activeClass: "bg-emerald-600 text-white" },
  { value: "overdue", label: "ហួសកំណត់", activeClass: "bg-red-600 text-white" },
];

function StatCard({ title, value, subtitle, icon, tone }: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  tone: "indigo" | "amber" | "emerald" | "red";
}) {
  const styles = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    red: "bg-red-500/10 text-red-600 dark:text-red-300",
  }[tone];
  return (
    <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5 dark:hover:shadow-black/20 sm:p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[13px] font-medium text-(--panel-text-muted)">{title}</p><p className="mt-2 text-3xl font-bold leading-none tracking-tight">{value}</p></div><div className={cn("rounded-xl p-2.5", styles)}>{icon}</div></div>
      <p className="mt-3 text-xs text-(--panel-text-subtle)">{subtitle}</p>
    </div>
  );
}

export function BillTableWrapper({ initialBills, contracts, settings }: BillTableProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills || []);
  const [prevInitialBills, setPrevInitialBills] = useState(initialBills);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);

  if (initialBills !== prevInitialBills) {
    setPrevInitialBills(initialBills);
    setBills(initialBills || []);
  }

  const stats = useMemo(() => {
    const amountFor = (status?: BillStatus) => bills
      .filter((bill) => !status || bill.status === status)
      .reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);
    return {
      total: bills.length,
      unpaid: bills.filter((bill) => bill.status === "unpaid").length,
      paid: bills.filter((bill) => bill.status === "paid").length,
      overdue: bills.filter((bill) => bill.status === "overdue").length,
      totalAmount: amountFor(),
      unpaidAmount: amountFor("unpaid"),
      paidAmount: amountFor("paid"),
      overdueAmount: amountFor("overdue"),
    };
  }, [bills]);

  const counts: Record<BillFilter, number> = { all: stats.total, unpaid: stats.unpaid, paid: stats.paid, overdue: stats.overdue };
  const filteredBills = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return bills.filter((bill) => {
      const matchesSearch = [bill.profiles?.full_name, bill.profiles?.phone_number, bill.contracts?.rooms?.room_number, bill.billing_month]
        .map((value) => String(value || "").toLowerCase()).some((value) => value.includes(query));
      return matchesSearch && (statusFilter === "all" || bill.status === statusFilter);
    });
  }, [bills, searchQuery, statusFilter]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleItems: visibleBills, hasMore, sentinelRef } = useInfiniteReveal(filteredBills, scrollContainerRef);
  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";
  const clearFilters = () => { setSearchQuery(""); setStatusFilter("all"); };
  const handleAddNew = () => { setSelectedBill(null); setIsModalOpen(true); };
  const handleBillUpserted = (updatedBill: Bill) => setBills((current) => current.some((bill) => bill.id === updatedBill.id) ? current.map((bill) => bill.id === updatedBill.id ? updatedBill : bill) : [updatedBill, ...current]);

  return (
    <div className="space-y-5">
      <section aria-label="ស្ថិតិវិក្កយបត្រ" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="វិក្កយបត្រសរុប" value={stats.total} subtitle={`តម្លៃសរុប $${stats.totalAmount.toFixed(2)}`} icon={<ReceiptText size={20} />} tone="indigo" />
        <StatCard title="មិនទាន់បង់" value={stats.unpaid} subtitle={`នៅសល់ $${stats.unpaidAmount.toFixed(2)}`} icon={<Clock3 size={20} />} tone="amber" />
        <StatCard title="បានបង់" value={stats.paid} subtitle={`ទទួលបាន $${stats.paidAmount.toFixed(2)}`} icon={<CheckCircle2 size={20} />} tone="emerald" />
        <StatCard title="ហួសកាលកំណត់" value={stats.overdue} subtitle={`ត្រូវតាមដាន $${stats.overdueAmount.toFixed(2)}`} icon={<AlertTriangle size={20} />} tone="red" />
      </section>

      <section className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--panel-text-subtle)" /><Input aria-label="ស្វែងរកវិក្កយបត្រ" placeholder="ស្វែងរកអ្នកជួល លេខបន្ទប់ ឬខែ..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-10 border-(--panel-border) bg-(--panel-inset) pl-10 text-(--panel-text) placeholder:text-(--panel-text-subtle)" /></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-(--panel-border) bg-(--panel-inset) p-1 sm:w-auto">
              {FILTER_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => setStatusFilter(option.value)} className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition", statusFilter === option.value ? option.activeClass : "text-(--panel-text-muted) hover:bg-(--panel-hover) hover:text-(--panel-text)")}>{option.label}<span className={cn("text-[10px]", statusFilter === option.value ? "text-white/75" : "text-(--panel-text-subtle)")}>{counts[option.value]}</span></button>)}
            </div>
            <Button onClick={handleAddNew} className="h-10 gap-2 rounded-xl bg-indigo-600 px-4 text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500"><Plus size={16} /> បន្ថែមវិក្កយបត្រ</Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel) shadow-sm">
        <div className="flex items-center justify-between border-b border-(--panel-border-subtle) px-4 py-3 sm:px-5"><div><h2 className="text-sm font-semibold text-(--panel-text)">បញ្ជីវិក្កយបត្រ</h2><p className="mt-0.5 text-xs text-(--panel-text-subtle)">បង្ហាញ {filteredBills.length} ក្នុងចំណោម {stats.total} វិក្កយបត្រ</p></div>{hasActiveFilters && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-(--panel-text-muted) transition hover:bg-(--panel-hover) hover:text-(--panel-text)"><RotateCcw className="h-3.5 w-3.5" /> សម្អាតតម្រង</button>}</div>
        <div ref={scrollContainerRef} className="max-h-[560px] overflow-auto">
          {filteredBills.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center"><div className="mb-4 rounded-2xl bg-cyan-500/10 p-4 text-cyan-500 dark:text-cyan-300">{hasActiveFilters ? <Search className="h-7 w-7" /> : <ReceiptText className="h-7 w-7" />}</div><h3 className="text-base font-semibold text-(--panel-text)">{hasActiveFilters ? "រកមិនឃើញវិក្កយបត្រ" : "មិនទាន់មានវិក្កយបត្រ"}</h3><p className="mt-1 max-w-sm text-sm leading-6 text-(--panel-text-subtle)">{hasActiveFilters ? "សាកល្បងពាក្យស្វែងរក ឬស្ថានភាពផ្សេងទៀត។" : "បង្កើតវិក្កយបត្រដំបូង ដើម្បីគណនាថ្លៃបន្ទប់ ទឹក និងភ្លើងរបស់អ្នកជួល។"}</p><Button onClick={hasActiveFilters ? clearFilters : handleAddNew} variant={hasActiveFilters ? "outline" : "default"} className={cn("mt-5 gap-2 rounded-xl", !hasActiveFilters && "bg-indigo-600 text-white hover:bg-indigo-500")}>{hasActiveFilters ? <RotateCcw size={16} /> : <Plus size={16} />}{hasActiveFilters ? "សម្អាតតម្រង" : "បង្កើតវិក្កយបត្រដំបូង"}</Button></div>
          ) : (
            <table className="w-full min-w-[1120px] border-collapse text-left">
              <thead className="sticky top-0 z-10 border-b border-(--panel-border) bg-(--panel-inset)"><tr className="text-xs font-medium text-(--panel-text-muted)"><th className="px-5 py-3">អ្នកជួល</th><th className="px-5 py-3">បន្ទប់</th><th className="px-5 py-3">ខែវិក្កយបត្រ</th><th className="px-5 py-3">ថ្លៃបន្ទប់</th><th className="px-5 py-3">ទឹក និងភ្លើង</th><th className="px-5 py-3">សរុប</th><th className="px-5 py-3">ស្ថានភាព</th><th className="px-5 py-3 text-right">សកម្មភាព</th></tr></thead>
              <tbody className="divide-y divide-(--panel-border-subtle) text-sm">
                {visibleBills.map((bill) => <tr key={bill.id} className="transition-colors hover:bg-(--panel-hover)/55"><td className="px-5 py-3.5"><p className="font-semibold text-(--panel-text)">{bill.profiles?.full_name || "-"}</p><p className="mt-0.5 text-xs text-(--panel-text-subtle)">{bill.profiles?.phone_number || "មិនមានលេខទូរស័ព្ទ"}</p></td><td className="px-5 py-3.5"><p className="font-semibold text-(--panel-text)">#{bill.contracts?.rooms?.room_number || "-"}</p><p className="mt-0.5 text-xs text-(--panel-text-subtle)">{bill.contracts?.rooms?.room_type || "-"}</p></td><td className="px-5 py-3.5"><div className="flex items-center gap-2 text-(--panel-text-muted)"><CalendarDays className="h-4 w-4 text-(--panel-text-subtle)" />{formatKhmerDate(bill.billing_month)}</div></td><td className="px-5 py-3.5 text-(--panel-text-muted)">${Number(bill.room_fee || 0).toFixed(2)}</td><td className="px-5 py-3.5"><p className="text-(--panel-text-muted)">ទឹក ${Number(bill.water_fee || 0).toFixed(2)}</p><p className="mt-0.5 text-xs text-(--panel-text-subtle)">ភ្លើង ${Number(bill.elec_fee || 0).toFixed(2)}</p></td><td className="px-5 py-3.5 font-semibold text-emerald-600 dark:text-emerald-300">${Number(bill.total_amount || 0).toFixed(2)}</td><td className="px-5 py-3.5"><StatusBadge status={bill.status} /></td><td className="px-5 py-3.5 text-right"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label="កែប្រែវិក្កយបត្រ" onClick={() => { setSelectedBill(bill); setIsModalOpen(true); }} className="h-9 w-9 rounded-lg text-(--panel-text-muted) hover:text-indigo-500"><Edit2 size={15} /></Button><Button size="icon" variant="ghost" aria-label="លុបវិក្កយបត្រ" onClick={() => { setBillToDelete(bill); setIsDeleteModalOpen(true); }} className="h-9 w-9 rounded-lg text-(--panel-text-muted) hover:bg-red-500/10 hover:text-red-500"><Trash2 size={15} /></Button></div></td></tr>)}
                {hasMore && <tr><td colSpan={8} className="p-4 text-center"><div ref={sentinelRef} className="flex items-center justify-center gap-2 text-xs text-(--panel-text-subtle)"><Loader2 size={14} className="animate-spin" /> កំពុងផ្ទុកបន្ថែម...</div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <BillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} bill={selectedBill} contracts={contracts} settings={settings} onSuccess={handleBillUpserted} />
      <BillDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} bill={billToDelete} onDeleteSuccess={(billId) => setBills((current) => current.filter((bill) => bill.id !== billId))} />
    </div>
  );
}

function StatusBadge({ status }: { status: BillStatus }) {
  const styles = {
    unpaid: { className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
    paid: { className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
    overdue: { className: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300", dot: "bg-red-500" },
  }[status];
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", styles.className)}><span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />{STATUS_LABELS[status]}</span>;
}
