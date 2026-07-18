"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  ImageOff,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { approvePayment, rejectPayment } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInfiniteReveal } from "@/hooks/use-infinite-reveal";
import { cn } from "@/lib/utils";
import { Payment, PaymentStatus, PAYMENT_METHOD_LABELS } from "@/lib/validations/payments";

import PaymentDeleteModal from "./payment-delete-modal";
import PaymentSubmitModal from "./payment-form-modal";

interface BillOption {
  id: string;
  billing_month: string;
  total_amount: number;
  status: string;
  profiles?: { id?: string; full_name: string; phone_number: string; email?: string };
  contracts?: { rooms?: { id?: string; room_number: string; room_type: string } };
}

interface PaymentTableProps {
  initialPayments: Payment[];
  unpaidBills: BillOption[];
}

type PaymentFilter = "all" | PaymentStatus;

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "កំពុងរង់ចាំ",
  approved: "បានអនុម័ត",
  rejected: "បានបដិសេធ",
};

const FILTER_OPTIONS: { value: PaymentFilter; label: string; activeClass: string }[] = [
  { value: "all", label: "ទាំងអស់", activeClass: "bg-indigo-600 text-white" },
  { value: "pending", label: "កំពុងរង់ចាំ", activeClass: "bg-amber-600 text-white" },
  { value: "approved", label: "បានអនុម័ត", activeClass: "bg-emerald-600 text-white" },
  { value: "rejected", label: "បានបដិសេធ", activeClass: "bg-red-600 text-white" },
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
  return <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5 dark:hover:shadow-black/20 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[13px] font-medium text-(--panel-text-muted)">{title}</p><p className="mt-2 text-3xl font-bold leading-none tracking-tight">{value}</p></div><div className={cn("rounded-xl p-2.5", styles)}>{icon}</div></div><p className="mt-3 text-xs text-(--panel-text-subtle)">{subtitle}</p></div>;
}

export function PaymentTableWrapper({ initialPayments, unpaidBills }: PaymentTableProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments || []);
  const [prevInitialPayments, setPrevInitialPayments] = useState(initialPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentFilter>("all");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (initialPayments !== prevInitialPayments) {
    setPrevInitialPayments(initialPayments);
    setPayments(initialPayments || []);
  }

  const stats = useMemo(() => {
    const amountFor = (status?: PaymentStatus) => payments.filter((payment) => !status || payment.status === status).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    return {
      total: payments.length,
      pending: payments.filter((payment) => payment.status === "pending").length,
      approved: payments.filter((payment) => payment.status === "approved").length,
      rejected: payments.filter((payment) => payment.status === "rejected").length,
      totalAmount: amountFor(), pendingAmount: amountFor("pending"), approvedAmount: amountFor("approved"), rejectedAmount: amountFor("rejected"),
    };
  }, [payments]);

  const counts: Record<PaymentFilter, number> = { all: stats.total, pending: stats.pending, approved: stats.approved, rejected: stats.rejected };
  const filteredPayments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return payments.filter((payment) => {
      const matchesSearch = [payment.profiles?.full_name, payment.profiles?.phone_number, payment.bills?.contracts?.rooms?.room_number]
        .map((value) => String(value || "").toLowerCase()).some((value) => value.includes(query));
      return matchesSearch && (statusFilter === "all" || payment.status === statusFilter);
    });
  }, [payments, searchQuery, statusFilter]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleItems: visiblePayments, hasMore, sentinelRef } = useInfiniteReveal(filteredPayments, scrollContainerRef);
  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";
  const clearFilters = () => { setSearchQuery(""); setStatusFilter("all"); };

  const updateStatus = async (payment: Payment, status: "approved" | "rejected") => {
    const rejectionReason = status === "rejected"
      ? window.prompt("Please enter the reason for rejecting this payment:")?.trim()
      : undefined;
    if (status === "rejected" && !rejectionReason) return;

    setLoadingId(payment.id);
    try {
      if (status === "approved") await approvePayment(payment.id);
      else await rejectPayment(payment.id, rejectionReason!);
      setPayments((current) => current.map((item) => item.id === payment.id ? { ...item, status } : item));
      toast.success(status === "approved" ? "បានអនុម័តការទូទាត់" : "បានបដិសេធការទូទាត់");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "មានបញ្ហាក្នុងការកែប្រែស្ថានភាព");
    } finally { setLoadingId(null); }
  };

  return (
    <div className="space-y-5">
      <section aria-label="ស្ថិតិការទូទាត់" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="ការទូទាត់សរុប" value={stats.total} subtitle={`ទឹកប្រាក់សរុប $${stats.totalAmount.toFixed(2)}`} icon={<CreditCard size={20} />} tone="indigo" />
        <StatCard title="កំពុងរង់ចាំ" value={stats.pending} subtitle={`ត្រូវពិនិត្យ $${stats.pendingAmount.toFixed(2)}`} icon={<Clock3 size={20} />} tone="amber" />
        <StatCard title="បានអនុម័ត" value={stats.approved} subtitle={`បានទទួល $${stats.approvedAmount.toFixed(2)}`} icon={<CheckCircle2 size={20} />} tone="emerald" />
        <StatCard title="បានបដិសេធ" value={stats.rejected} subtitle={`ទឹកប្រាក់ $${stats.rejectedAmount.toFixed(2)}`} icon={<XCircle size={20} />} tone="red" />
      </section>

      <section className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm"><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="relative w-full xl:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--panel-text-subtle)" /><Input aria-label="ស្វែងរកការទូទាត់" placeholder="ស្វែងរកអ្នកជួល លេខទូរស័ព្ទ ឬលេខបន្ទប់..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-10 border-(--panel-border) bg-(--panel-inset) pl-10 text-(--panel-text) placeholder:text-(--panel-text-subtle)" /></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-(--panel-border) bg-(--panel-inset) p-1 sm:w-auto">{FILTER_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => setStatusFilter(option.value)} className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition", statusFilter === option.value ? option.activeClass : "text-(--panel-text-muted) hover:bg-(--panel-hover) hover:text-(--panel-text)")}>{option.label}<span className={cn("text-[10px]", statusFilter === option.value ? "text-white/75" : "text-(--panel-text-subtle)")}>{counts[option.value]}</span></button>)}</div><Button onClick={() => setIsSubmitModalOpen(true)} className="h-10 gap-2 rounded-xl bg-indigo-600 px-4 text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500"><Plus size={16} /> កត់ត្រាការទូទាត់</Button></div></div></section>

      <section className="overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel) shadow-sm">
        <div className="flex items-center justify-between border-b border-(--panel-border-subtle) px-4 py-3 sm:px-5"><div><h2 className="text-sm font-semibold text-(--panel-text)">បញ្ជីការទូទាត់</h2><p className="mt-0.5 text-xs text-(--panel-text-subtle)">បង្ហាញ {filteredPayments.length} ក្នុងចំណោម {stats.total} ការទូទាត់</p></div>{hasActiveFilters && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-(--panel-text-muted) transition hover:bg-(--panel-hover) hover:text-(--panel-text)"><RotateCcw className="h-3.5 w-3.5" /> សម្អាតតម្រង</button>}</div>
        <div ref={scrollContainerRef} className="max-h-[560px] overflow-auto">
          {filteredPayments.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center"><div className="mb-4 rounded-2xl bg-emerald-500/10 p-4 text-emerald-500 dark:text-emerald-300">{hasActiveFilters ? <Search className="h-7 w-7" /> : <CreditCard className="h-7 w-7" />}</div><h3 className="text-base font-semibold text-(--panel-text)">{hasActiveFilters ? "រកមិនឃើញការទូទាត់" : "មិនទាន់មានការទូទាត់"}</h3><p className="mt-1 max-w-sm text-sm leading-6 text-(--panel-text-subtle)">{hasActiveFilters ? "សាកល្បងពាក្យស្វែងរក ឬស្ថានភាពផ្សេងទៀត។" : "កត់ត្រាការទូទាត់ដំបូង ដើម្បីចាប់ផ្តើមផ្ទៀងផ្ទាត់វិក្កយបត្រ។"}</p><Button onClick={hasActiveFilters ? clearFilters : () => setIsSubmitModalOpen(true)} variant={hasActiveFilters ? "outline" : "default"} className={cn("mt-5 gap-2 rounded-xl", !hasActiveFilters && "bg-indigo-600 text-white hover:bg-indigo-500")}>{hasActiveFilters ? <RotateCcw size={16} /> : <Plus size={16} />}{hasActiveFilters ? "សម្អាតតម្រង" : "កត់ត្រាការទូទាត់ដំបូង"}</Button></div> : (
            <table className="w-full min-w-[1080px] border-collapse text-left"><thead className="sticky top-0 z-10 border-b border-(--panel-border) bg-(--panel-inset)"><tr className="text-xs font-medium text-(--panel-text-muted)"><th className="px-5 py-3">អ្នកជួល</th><th className="px-5 py-3">បន្ទប់</th><th className="px-5 py-3">ចំនួនទឹកប្រាក់</th><th className="px-5 py-3">វិធីបង់</th><th className="px-5 py-3">ភស្តុតាង</th><th className="px-5 py-3">ស្ថានភាព</th><th className="px-5 py-3 text-right">សកម្មភាព</th></tr></thead><tbody className="divide-y divide-(--panel-border-subtle) text-sm">{visiblePayments.map((payment) => <tr key={payment.id} className="transition-colors hover:bg-(--panel-hover)/55"><td className="px-5 py-3.5"><p className="font-semibold text-(--panel-text)">{payment.profiles?.full_name || "-"}</p><p className="mt-0.5 text-xs text-(--panel-text-subtle)">{payment.profiles?.phone_number || "មិនមានលេខទូរស័ព្ទ"}</p></td><td className="px-5 py-3.5 text-(--panel-text-muted)">#{payment.bills?.contracts?.rooms?.room_number || "-"}</td><td className="px-5 py-3.5 font-semibold text-emerald-600 dark:text-emerald-300">${Number(payment.amount || 0).toFixed(2)}</td><td className="px-5 py-3.5"><span className="rounded-lg bg-(--panel-inset) px-2.5 py-1.5 text-xs font-medium text-(--panel-text-muted)">{PAYMENT_METHOD_LABELS[payment.payment_method]}</span></td><td className="px-5 py-3.5">{payment.proof_image ? <a href={payment.proof_image} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-500/15 dark:text-blue-300"><Eye size={14} /> មើលបង្កាន់ដៃ</a> : <span className="inline-flex items-center gap-1.5 text-xs text-(--panel-text-subtle)"><ImageOff size={14} /> គ្មាន</span>}</td><td className="px-5 py-3.5"><StatusBadge status={payment.status} /></td><td className="px-5 py-3.5 text-right"><div className="flex justify-end gap-1">{payment.status === "pending" && <><Button size="sm" onClick={() => updateStatus(payment, "approved")} disabled={loadingId === payment.id} className="h-9 gap-1.5 rounded-lg bg-emerald-600 px-3 text-white hover:bg-emerald-500">{loadingId === payment.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} អនុម័ត</Button><Button size="sm" onClick={() => updateStatus(payment, "rejected")} disabled={loadingId === payment.id} className="h-9 gap-1.5 rounded-lg bg-red-600 px-3 text-white hover:bg-red-500"><X className="h-3.5 w-3.5" /> បដិសេធ</Button></>}{payment.status !== "approved" && <Button size="icon" variant="ghost" aria-label="លុបការទូទាត់" onClick={() => setPaymentToDelete(payment)} disabled={loadingId === payment.id} className="h-9 w-9 rounded-lg text-(--panel-text-muted) hover:bg-red-500/10 hover:text-red-500"><Trash2 size={15} /></Button>}</div></td></tr>)}{hasMore && <tr><td colSpan={7} className="p-4 text-center"><div ref={sentinelRef} className="flex items-center justify-center gap-2 text-xs text-(--panel-text-subtle)"><Loader2 size={14} className="animate-spin" /> កំពុងផ្ទុកបន្ថែម...</div></td></tr>}</tbody></table>
          )}
        </div>
      </section>

      <PaymentSubmitModal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} bills={unpaidBills} onSuccess={(payment) => setPayments((current) => [payment, ...current])} />
      <PaymentDeleteModal payment={paymentToDelete} isOpen={Boolean(paymentToDelete)} onClose={() => setPaymentToDelete(null)} onDeleteSuccess={(paymentId) => setPayments((current) => current.filter((payment) => payment.id !== paymentId))} />
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const styles = {
    pending: { className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
    approved: { className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
    rejected: { className: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300", dot: "bg-red-500" },
  }[status];
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", styles.className)}><span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />{STATUS_LABELS[status]}</span>;
}
