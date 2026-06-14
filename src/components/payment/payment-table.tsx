"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Trash2,
  XCircle,
  Eye,
  Plus,
} from "lucide-react";

import { Payment, PaymentStatus } from "@/lib/validations/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaymentSubmitModal from "./payment-form-modal";
import {
  approvePayment,
  rejectPayment,
  deletePayment,
} from "@/actions/payments";

interface BillOption {
  id: string;
  billing_month: string;
  total_amount: number;
  status: string;
  profiles?: {
    id?: string;
    full_name: string;
    phone_number: string;
    email?: string;
  };
  contracts?: {
    rooms?: {
      id?: string;
      room_number: string;
      room_type: string;
    };
  };
}

interface PaymentTableProps {
  initialPayments: Payment[];
  unpaidBills: BillOption[];
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "កំពុងរង់ចាំ",
  approved: "បានអនុម័ត",
  rejected: "បានបដិសេធ",
};

export function PaymentTableWrapper({
  initialPayments,
  unpaidBills,
}: PaymentTableProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setPayments(initialPayments || []);
  }, [initialPayments]);

  const stats = useMemo(() => {
    return {
      total: payments.length,
      pending: payments.filter((p) => p.status === "pending").length,
      approved: payments.filter((p) => p.status === "approved").length,
      rejected: payments.filter((p) => p.status === "rejected").length,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return payments.filter((payment) => {
      const tenantName = String(
        payment.profiles?.full_name || "",
      ).toLowerCase();
      const phone = String(payment.profiles?.phone_number || "").toLowerCase();
      const room = String(
        payment.bills?.contracts?.rooms?.room_number || "",
      ).toLowerCase();

      const matchesSearch =
        tenantName.includes(query) ||
        phone.includes(query) ||
        room.includes(query);

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  const handlePaymentSubmitted = (payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);
  };

  const handleApprove = async (payment: Payment) => {
    setLoadingId(payment.id);

    try {
      await approvePayment(payment.id);

      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id ? { ...p, status: "approved" } : p,
        ),
      );

      toast.success("បានអនុម័តការទូទាត់");
    } catch (error: any) {
      toast.error(error.message || "មានបញ្ហាក្នុងការអនុម័ត");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (payment: Payment) => {
    setLoadingId(payment.id);

    try {
      await rejectPayment(payment.id);

      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id ? { ...p, status: "rejected" } : p,
        ),
      );

      toast.success("បានបដិសេធការទូទាត់");
    } catch (error: any) {
      toast.error(error.message || "មានបញ្ហាក្នុងការបដិសេធ");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (payment: Payment) => {
    if (!confirm("តើអ្នកពិតជាចង់លុបការទូទាត់នេះមែនទេ?")) return;

    setLoadingId(payment.id);

    try {
      await deletePayment(payment.id);

      setPayments((prev) => prev.filter((p) => p.id !== payment.id));

      toast.success("បានលុបការទូទាត់");
    } catch (error: any) {
      toast.error(error.message || "មានបញ្ហាក្នុងការលុប");
    } finally {
      setLoadingId(null);
    }
  };

  const statusBadgeClass = (status: PaymentStatus) => {
    if (status === "approved") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }

    if (status === "rejected") {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  return (
    <div className="space-y-6 text-white p-1">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">
              ការទូទាត់សរុប
            </span>
            <CreditCard size={20} className="text-indigo-400" />
          </div>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">រង់ចាំ</span>
            <Clock size={20} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-amber-400">
            {stats.pending}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">បានអនុម័ត</span>
            <CheckCircle size={20} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-emerald-400">
            {stats.approved}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">បានបដិសេធ</span>
            <XCircle size={20} className="text-red-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-red-400">
            {stats.rejected}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#131626] p-4 rounded-xl border border-zinc-800/60">
        <Input
          placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ ឬលេខបន្ទប់..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-96 bg-[#0b0d19] border-zinc-800 text-white placeholder-zinc-500"
        />

        <div className="flex items-center gap-1.5 bg-[#0b0d19] p-1 rounded-lg border border-zinc-800/60 w-full sm:w-auto overflow-x-auto">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                statusFilter === status
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {status === "all"
                ? "ទាំងអស់"
                : STATUS_LABELS[status as PaymentStatus]}
            </button>
          ))}
        </div>

        <Button
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full sm:w-auto"
        >
          <Plus size={16} /> ខ្ញុំបានបង់ប្រាក់
        </Button>
      </div>

      <div className="bg-[#131626] rounded-xl border border-zinc-800/60 overflow-hidden">
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="sticky top-0 bg-[#131626] z-10 border-b border-zinc-800 text-zinc-400 text-xs uppercase">
              <tr>
                <th className="p-4">អ្នកជួល</th>
                <th className="p-4">បន្ទប់</th>
                <th className="p-4">ចំនួនទឹកប្រាក់</th>
                <th className="p-4">វិធីបង់</th>
                <th className="p-4">ភស្តុតាង</th>
                <th className="p-4">ស្ថានភាព</th>
                <th className="p-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/50 text-sm">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    មិនមានទិន្នន័យការទូទាត់ឡើយ។
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-semibold text-zinc-200">
                        {payment.profiles?.full_name || "-"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {payment.profiles?.phone_number || "-"}
                      </p>
                    </td>

                    <td className="p-4 text-zinc-400">
                      #{payment.bills?.contracts?.rooms?.room_number || "-"}
                    </td>

                    <td className="p-4 text-emerald-400 font-semibold">
                      ${Number(payment.amount || 0).toFixed(2)}
                    </td>

                    <td className="p-4 text-zinc-400 uppercase">
                      {payment.payment_method}
                    </td>

                    <td className="p-4">
                      {payment.proof_image ? (
                        <a
                          href={payment.proof_image}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <Eye size={14} /> មើល
                        </a>
                      ) : (
                        <span className="text-zinc-600">គ្មាន</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeClass(
                          payment.status,
                        )}`}
                      >
                        {STATUS_LABELS[payment.status]}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {payment.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(payment)}
                              disabled={loadingId === payment.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleReject(payment)}
                              disabled={loadingId === payment.id}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {payment.status !== "approved" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(payment)}
                            disabled={loadingId === payment.id}
                            className="h-8 w-8 text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        bills={unpaidBills}
        onSuccess={handlePaymentSubmitted}
      />
    </div>
  );
}
