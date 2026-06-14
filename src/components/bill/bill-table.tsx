"use client";

import { useEffect, useMemo, useState } from "react";
import { Bill, BillStatus } from "@/lib/validations/bills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit2,
  Trash2,
  Plus,
  Receipt,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import BillModal from "./bill-form-modal";
import BillDeleteModal from "./bill-delete-modal";

interface ContractOption {
  id: string;
  tenant_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  due_day: number;
  status: string;
  profiles?: {
    id: string;
    full_name: string;
    phone_number: string;
    email?: string;
  };
  rooms?: {
    id: string;
    room_number: string;
    room_type: string;
    base_price: number;
    floor: number;
  };
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

const STATUS_LABELS: Record<BillStatus, string> = {
  unpaid: "មិនទាន់បង់",
  paid: "បានបង់",
  overdue: "ហួសកាលកំណត់",
};

export function BillTableWrapper({
  initialBills,
  contracts,
  settings,
}: BillTableProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);

  useEffect(() => {
    setBills(initialBills || []);
  }, [initialBills]);

  const handleBillUpserted = (updatedBill: Bill) => {
    setBills((prevBills) => {
      const exists = prevBills.some((b) => b.id === updatedBill.id);

      if (exists) {
        return prevBills.map((b) =>
          b.id === updatedBill.id ? updatedBill : b,
        );
      }

      return [updatedBill, ...prevBills];
    });
  };

  const handleBillDeleted = (billId: string) => {
    setBills((prevBills) => prevBills.filter((b) => b.id !== billId));
  };

  const stats = useMemo(() => {
    const safeBills = bills || [];

    return {
      total: safeBills.length,
      unpaid: safeBills.filter((b) => b.status === "unpaid").length,
      paid: safeBills.filter((b) => b.status === "paid").length,
      overdue: safeBills.filter((b) => b.status === "overdue").length,
      totalAmount: safeBills.reduce(
        (sum, bill) => sum + Number(bill.total_amount || 0),
        0,
      ),
    };
  }, [bills]);

  const filteredBills = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return bills.filter((bill) => {
      const tenantName = String(bill.profiles?.full_name || "").toLowerCase();
      const tenantPhone = String(
        bill.profiles?.phone_number || "",
      ).toLowerCase();
      const roomNumber = String(
        bill.contracts?.rooms?.room_number || "",
      ).toLowerCase();
      const month = String(bill.billing_month || "").toLowerCase();

      const matchesSearch =
        tenantName.includes(query) ||
        tenantPhone.includes(query) ||
        roomNumber.includes(query) ||
        month.includes(query);

      const matchesStatus =
        statusFilter === "all" || bill.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, searchQuery, statusFilter]);

  const handleAddNew = () => {
    setSelectedBill(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (bill: Bill) => {
    setBillToDelete(bill);
    setIsDeleteModalOpen(true);
  };

  const formatMonth = (value?: string) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("km-KH", {
      year: "numeric",
      month: "long",
    });
  };

  const statusBadgeClass = (status: BillStatus) => {
    if (status === "paid") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }

    if (status === "overdue") {
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
              វិក្កយបត្រសរុប
            </span>
            <Receipt size={20} className="text-indigo-400" />
          </div>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">
              មិនទាន់បង់
            </span>
            <Clock size={20} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-amber-400">
            {stats.unpaid}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">បានបង់</span>
            <CheckCircle size={20} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-emerald-400">
            {stats.paid}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">
              ហួសកាលកំណត់
            </span>
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-red-400">
            {stats.overdue}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#131626] p-4 rounded-xl border border-zinc-800/60">
        <div className="relative w-full sm:w-96">
          <Input
            placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ លេខបន្ទប់ ឬខែ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 bg-[#0b0d19] border-zinc-800 text-white placeholder-zinc-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0b0d19] p-1 rounded-lg border border-zinc-800/60 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              statusFilter === "all"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ទាំងអស់
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("unpaid")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              statusFilter === "unpaid"
                ? "bg-amber-600 text-white"
                : "text-zinc-400 hover:text-amber-400"
            }`}
          >
            មិនទាន់បង់
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("paid")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              statusFilter === "paid"
                ? "bg-emerald-600 text-white"
                : "text-zinc-400 hover:text-emerald-400"
            }`}
          >
            បានបង់
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("overdue")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              statusFilter === "overdue"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:text-red-400"
            }`}
          >
            ហួសកាលកំណត់
          </button>
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full sm:w-auto"
        >
          <Plus size={16} /> បន្ថែមវិក្កយបត្រ
        </Button>
      </div>

      <div className="bg-[#131626] rounded-xl border border-zinc-800/60 overflow-hidden">
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="sticky top-0 bg-[#131626] z-10 border-b border-zinc-800 text-zinc-400 text-xs uppercase">
              <tr>
                <th className="p-4 bg-[#131626]">អ្នកជួល</th>
                <th className="p-4 bg-[#131626]">បន្ទប់</th>
                <th className="p-4 bg-[#131626]">ខែ</th>
                <th className="p-4 bg-[#131626]">ថ្លៃបន្ទប់</th>
                <th className="p-4 bg-[#131626]">ទឹក</th>
                <th className="p-4 bg-[#131626]">ភ្លើង</th>
                <th className="p-4 bg-[#131626]">សរុប</th>
                <th className="p-4 bg-[#131626]">ស្ថានភាព</th>
                <th className="p-4 text-right bg-[#131626]">សកម្មភាព</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/50 text-sm">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-zinc-500">
                    មិនមានទិន្នន័យវិក្កយបត្រឡើយ។
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-zinc-900/30 transition-colors text-sm"
                  >
                    <td className="p-4">
                      <p className="font-semibold text-zinc-200">
                        {bill.profiles?.full_name || "-"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {bill.profiles?.phone_number || "-"}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-zinc-200">
                        #{bill.contracts?.rooms?.room_number || "-"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {bill.contracts?.rooms?.room_type || "-"}
                      </p>
                    </td>

                    <td className="p-4 text-zinc-400">
                      {formatMonth(bill.billing_month)}
                    </td>

                    <td className="p-4 text-zinc-400">
                      ${Number(bill.room_fee || 0).toFixed(2)}
                    </td>

                    <td className="p-4 text-zinc-400">
                      ${Number(bill.water_fee || 0).toFixed(2)}
                    </td>

                    <td className="p-4 text-zinc-400">
                      ${Number(bill.elec_fee || 0).toFixed(2)}
                    </td>

                    <td className="p-4 text-emerald-400 font-semibold">
                      ${Number(bill.total_amount || 0).toFixed(2)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeClass(
                          bill.status,
                        )}`}
                      >
                        {STATUS_LABELS[bill.status]}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(bill)}
                          className="h-8 w-8 text-zinc-400 hover:text-white"
                        >
                          <Edit2 size={14} />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(bill)}
                          className="h-8 w-8 text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bill={selectedBill}
        contracts={contracts}
        settings={settings}
        onSuccess={handleBillUpserted}
      />

      <BillDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        bill={billToDelete}
        onDeleteSuccess={handleBillDeleted}
      />
    </div>
  );
}
