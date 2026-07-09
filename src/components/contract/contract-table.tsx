"use client";

import { useMemo, useRef, useState } from "react";
import { Contract, ContractStatus } from "@/lib/validations/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatKhmerDate } from "@/lib/utils";
import { useInfiniteReveal } from "@/hooks/use-infinite-reveal";
import {
  Edit2,
  Trash2,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import ContractModal from "./contract-form-modal";
import ContractDeleteModal from "./contract-delete-modal";

interface TenantOption {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
}

interface RoomOption {
  id: string;
  room_number: string;
  room_type: string;
  base_price: number;
  floor: number;
  status: string;
}

interface ContractTableProps {
  initialContracts: Contract[];
  tenants: TenantOption[];
  rooms: RoomOption[];
}

const STATUS_LABELS: Record<ContractStatus, string> = {
  active: "សកម្ម",
  pending: "រង់ចាំ",
  expired: "អស់សុពលភាព",
  terminated: "បានបញ្ចប់",
};

export function ContractTableWrapper({
  initialContracts,
  tenants,
  rooms,
}: ContractTableProps) {
  const [contracts, setContracts] = useState<Contract[]>(
    initialContracts || [],
  );
  const [prevInitialContracts, setPrevInitialContracts] =
    useState(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null,
  );

  // Resync local state when the server passes a fresh `initialContracts` prop
  // (e.g. after revalidatePath) without waiting for a post-commit effect —
  // see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (initialContracts !== prevInitialContracts) {
    setPrevInitialContracts(initialContracts);
    setContracts(initialContracts || []);
  }

  const handleContractUpserted = (updatedContract: Contract) => {
    setContracts((prevContracts) => {
      const exists = prevContracts.some((c) => c.id === updatedContract.id);

      if (exists) {
        return prevContracts.map((c) =>
          c.id === updatedContract.id ? updatedContract : c,
        );
      }

      return [updatedContract, ...prevContracts];
    });
  };

  const handleContractDeleted = (contractId: string) => {
    setContracts((prevContracts) =>
      prevContracts.filter((c) => c.id !== contractId),
    );
  };

  const stats = useMemo(() => {
    const safeContracts = contracts || [];

    return {
      total: safeContracts.length,
      active: safeContracts.filter((c) => c.status === "active").length,
      pending: safeContracts.filter((c) => c.status === "pending").length,
      ended: safeContracts.filter(
        (c) => c.status === "expired" || c.status === "terminated",
      ).length,
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    const safeContracts = contracts || [];
    const query = searchQuery.toLowerCase().trim();

    return safeContracts.filter((contract) => {
      if (!contract) return false;

      const tenantName = String(
        contract.profiles?.full_name || "",
      ).toLowerCase();
      const tenantPhone = String(
        contract.profiles?.phone_number || "",
      ).toLowerCase();
      const roomNumber = String(
        contract.rooms?.room_number || "",
      ).toLowerCase();

      const matchesSearch =
        tenantName.includes(query) ||
        tenantPhone.includes(query) ||
        roomNumber.includes(query);

      const matchesStatus =
        statusFilter === "all" || contract.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    visibleItems: visibleContracts,
    hasMore,
    sentinelRef,
  } = useInfiniteReveal(filteredContracts, scrollContainerRef);

  const handleAddNew = () => {
    setSelectedContract(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (date?: string) =>
    formatKhmerDate(date, { withDay: true });

  const statusBadgeClass = (status: ContractStatus) => {
    if (status === "active") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }

    if (status === "pending") {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }

    if (status === "expired") {
      return "bg-zinc-500/10 text-(--panel-text-muted) border-zinc-500/20";
    }

    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  return (
    <div className="space-y-6 text-(--panel-text) p-1">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-(--panel) border-(--panel-border)/80 hover:border-(--panel-border) transition-all">
          <div className="flex items-center justify-between">
            <span className="text-(--panel-text-muted) text-sm font-medium">
              កិច្ចសន្យាសរុប
            </span>
            <FileText size={20} className="text-indigo-400" />
          </div>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl border bg-(--panel) border-(--panel-border)/80 hover:border-(--panel-border) transition-all">
          <div className="flex items-center justify-between">
            <span className="text-(--panel-text-muted) text-sm font-medium">
              កំពុងសកម្ម
            </span>
            <CheckCircle size={20} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-emerald-400">
            {stats.active}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-(--panel) border-(--panel-border)/80 hover:border-(--panel-border) transition-all">
          <div className="flex items-center justify-between">
            <span className="text-(--panel-text-muted) text-sm font-medium">រង់ចាំ</span>
            <Clock size={20} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-amber-400">
            {stats.pending}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-(--panel) border-(--panel-border)/80 hover:border-(--panel-border) transition-all">
          <div className="flex items-center justify-between">
            <span className="text-(--panel-text-muted) text-sm font-medium">
              បញ្ចប់/ផុតកំណត់
            </span>
            <XCircle size={20} className="text-red-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-red-400">{stats.ended}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-(--panel) p-4 rounded-xl border border-(--panel-border)/60">
        <div className="relative w-full sm:w-96">
          <Input
            placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ ឬលេខបន្ទប់..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 bg-(--panel-inset) border-(--panel-border) text-(--panel-text) placeholder-(--panel-text-subtle)"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-(--panel-inset) p-1 rounded-lg border border-(--panel-border)/60 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "all"
                ? "bg-indigo-600 text-white"
                : "text-(--panel-text-muted) hover:text-(--panel-text)"
            }`}
          >
            ទាំងអស់
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white"
                : "text-(--panel-text-muted) hover:text-emerald-400"
            }`}
          >
            សកម្ម
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white"
                : "text-(--panel-text-muted) hover:text-amber-400"
            }`}
          >
            រង់ចាំ
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("terminated")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "terminated"
                ? "bg-red-600 text-white"
                : "text-(--panel-text-muted) hover:text-red-400"
            }`}
          >
            បញ្ចប់
          </button>
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full sm:w-auto"
        >
          <Plus size={16} /> បន្ថែមកិច្ចសន្យា
        </Button>
      </div>

      <div className="bg-(--panel) rounded-xl border border-(--panel-border)/60 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto max-h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800"
        >
          <table className="w-full text-left border-collapse table-auto">
            <thead className="sticky top-0 bg-(--panel) z-10 border-b border-(--panel-border) text-(--panel-text-muted) text-xs uppercase">
              <tr>
                <th className="p-4 bg-(--panel)">អ្នកជួល</th>
                <th className="p-4 bg-(--panel)">បន្ទប់</th>
                <th className="p-4 bg-(--panel)">ថ្ងៃចាប់ផ្តើម</th>
                <th className="p-4 bg-(--panel)">ថ្ងៃបញ្ចប់</th>
                <th className="p-4 bg-(--panel)">ប្រាក់កក់</th>
                <th className="p-4 bg-(--panel)">ថ្ងៃបង់</th>
                <th className="p-4 bg-(--panel)">ស្ថានភាព</th>
                <th className="p-4 text-right bg-(--panel)">សកម្មភាព</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/50 text-sm">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-(--panel-text-subtle)">
                    មិនមានទិន្នន័យកិច្ចសន្យាឡើយ។
                  </td>
                </tr>
              ) : (
                visibleContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-(--panel-hover)/30 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-(--panel-text)">
                          {contract.profiles?.full_name || "-"}
                        </p>
                        <p className="text-xs text-(--panel-text-subtle)">
                          {contract.profiles?.phone_number || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-(--panel-text)">
                          #{contract.rooms?.room_number || "-"}
                        </p>
                        <p className="text-xs text-(--panel-text-subtle)">
                          {contract.rooms?.room_type || "-"} / ជាន់{" "}
                          {contract.rooms?.floor || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="p-4 text-(--panel-text-muted)">
                      {formatDate(contract.start_date)}
                    </td>

                    <td className="p-4 text-(--panel-text-muted)">
                      {formatDate(contract.end_date)}
                    </td>

                    <td className="p-4 text-emerald-400 font-semibold">
                      ${Number(contract.deposit_amount || 0).toFixed(2)}
                    </td>

                    <td className="p-4 text-(--panel-text-muted)">
                      ថ្ងៃទី {contract.due_day}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeClass(
                          contract.status,
                        )}`}
                      >
                        {STATUS_LABELS[contract.status]}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(contract)}
                          className="h-8 w-8 text-(--panel-text-muted) hover:text-(--panel-text)"
                        >
                          <Edit2 size={14} />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(contract)}
                          className="h-8 w-8 text-(--panel-text-muted) hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {hasMore && (
                <tr>
                  <td colSpan={8} className="p-4 text-center">
                    <div
                      ref={sentinelRef}
                      className="flex items-center justify-center gap-2 text-xs text-(--panel-text-subtle)"
                    >
                      <Loader2 size={14} className="animate-spin" />
                      កំពុងផ្ទុកបន្ថែម...
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contract={selectedContract}
        tenants={tenants}
        rooms={rooms}
        onSuccess={handleContractUpserted}
      />

      <ContractDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        contract={contractToDelete}
        onDeleteSuccess={handleContractDeleted}
      />
    </div>
  );
}
