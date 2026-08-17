"use client";

import { useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  CalendarX,
  CheckCircle2,
  Clock3,
  Edit2,
  FileSignature,
  FileText,
  Loader2,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useInfiniteReveal } from "@/hooks/use-infinite-reveal";
import { cn, formatKhmerDate } from "@/lib/utils";
import { Contract, ContractStatus } from "@/lib/validations/contracts";

import ContractDeleteModal from "./contract-delete-modal";
import ContractModal from "./contract-form-modal";

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
  defaultDueDay: number;
}

type ContractFilter = "all" | "active" | "pending" | "ended";

const STATUS_LABELS: Record<ContractStatus, string> = {
  active: "សកម្ម",
  pending: "រង់ចាំ",
  expired: "ផុតកំណត់",
  terminated: "បានបញ្ចប់",
};

const FILTER_OPTIONS: {
  value: ContractFilter;
  label: string;
  dotClass?: string;
}[] = [
  { value: "all", label: "ទាំងអស់" },
  { value: "active", label: "សកម្ម", dotClass: "bg-emerald-500" },
  { value: "pending", label: "រង់ចាំ", dotClass: "bg-amber-500" },
  { value: "ended", label: "បញ្ចប់", dotClass: "bg-red-500" },
];

export function ContractTableWrapper({ initialContracts, tenants, rooms, defaultDueDay }: ContractTableProps) {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts || []);
  const [prevInitialContracts, setPrevInitialContracts] = useState(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

  if (initialContracts !== prevInitialContracts) {
    setPrevInitialContracts(initialContracts);
    setContracts(initialContracts || []);
  }

  const stats = useMemo(() => ({
    total: contracts.length,
    active: contracts.filter((contract) => contract.status === "active").length,
    pending: contracts.filter((contract) => contract.status === "pending").length,
    ended: contracts.filter((contract) => ["expired", "terminated"].includes(contract.status)).length,
  }), [contracts]);

  const counts: Record<ContractFilter, number> = {
    all: stats.total,
    active: stats.active,
    pending: stats.pending,
    ended: stats.ended,
  };

  const filteredContracts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return contracts.filter((contract) => {
      const matchesSearch = [
        contract.profiles?.full_name,
        contract.profiles?.phone_number,
        contract.rooms?.room_number,
      ].map((value) => String(value || "").toLowerCase()).some((value) => value.includes(query));
      const matchesStatus = statusFilter === "all"
        || contract.status === statusFilter
        || (statusFilter === "ended" && ["expired", "terminated"].includes(contract.status));
      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleItems: visibleContracts, hasMore, sentinelRef } = useInfiniteReveal(filteredContracts, scrollContainerRef);
  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";
  const clearFilters = () => { setSearchQuery(""); setStatusFilter("all"); };
  const handleAddNew = () => { setSelectedContract(null); setIsModalOpen(true); };
  const handleContractUpserted = (updatedContract: Contract) => {
    setContracts((current) => current.some((contract) => contract.id === updatedContract.id)
      ? current.map((contract) => contract.id === updatedContract.id ? updatedContract : contract)
      : [updatedContract, ...current]);
  };

  return (
    <div className="space-y-5">
      <section aria-label="ស្ថិតិកិច្ចសន្យា" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard title="កិច្ចសន្យាសរុប" value={stats.total} subtitle="កិច្ចសន្យាទាំងអស់ក្នុងប្រព័ន្ធ" icon={<FileText size={16} />} tone="indigo" />
        <StatCard title="កំពុងសកម្ម" value={stats.active} subtitle="កិច្ចសន្យាដែលកំពុងដំណើរការ" icon={<CheckCircle2 size={16} />} tone="emerald" />
        <StatCard title="កំពុងរង់ចាំ" value={stats.pending} subtitle="ត្រូវពិនិត្យ និងធ្វើឱ្យសកម្ម" icon={<Clock3 size={16} />} tone="amber" />
        <StatCard title="បញ្ចប់ ឬផុតកំណត់" value={stats.ended} subtitle="កិច្ចសន្យាដែលលែងសកម្ម" icon={<XCircle size={16} />} tone="red" />
      </section>

      <section className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--panel-text-subtle)" />
            <Input aria-label="ស្វែងរកកិច្ចសន្យា" placeholder="ស្វែងរកអ្នកជួល លេខទូរស័ព្ទ ឬលេខបន្ទប់..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-10 border-(--panel-border) bg-(--panel-inset) pl-10 text-(--panel-text) placeholder:text-(--panel-text-subtle)" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <FilterDropdown
              ariaLabel="ត្រងតាមស្ថានភាពកិច្ចសន្យា"
              value={statusFilter}
              onChange={setStatusFilter}
              options={FILTER_OPTIONS.map((option) => ({ ...option, count: counts[option.value] }))}
            />
            <Button onClick={handleAddNew} className="h-10 gap-2 rounded-xl bg-indigo-600 px-4 font-semibold text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40 hover:bg-indigo-500"><Plus size={16} /> បន្ថែមកិច្ចសន្យា</Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel) shadow-sm">
        <div className="flex items-center justify-between border-b border-(--panel-border-subtle) px-4 py-3 sm:px-5">
          <div><h2 className="text-sm font-semibold text-(--panel-text)">បញ្ជីកិច្ចសន្យា</h2><p className="mt-0.5 text-xs text-(--panel-text-subtle)">បង្ហាញ {filteredContracts.length} ក្នុងចំណោម {stats.total} កិច្ចសន្យា</p></div>
          {hasActiveFilters && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-(--panel-text-muted) transition hover:bg-(--panel-hover) hover:text-(--panel-text)"><RotateCcw className="h-3.5 w-3.5" /> សម្អាតតម្រង</button>}
        </div>
        <div ref={scrollContainerRef} className="max-h-[560px] overflow-auto">
          {filteredContracts.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 rounded-2xl bg-blue-500/10 p-4 text-blue-500 dark:text-blue-300">{hasActiveFilters ? <Search className="h-7 w-7" /> : <FileSignature className="h-7 w-7" />}</div>
              <h3 className="text-base font-semibold text-(--panel-text)">{hasActiveFilters ? "រកមិនឃើញកិច្ចសន្យា" : "មិនទាន់មានកិច្ចសន្យា"}</h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-(--panel-text-subtle)">{hasActiveFilters ? "សាកល្បងពាក្យស្វែងរក ឬស្ថានភាពផ្សេងទៀត។" : "បង្កើតកិច្ចសន្យាដំបូង ដើម្បីភ្ជាប់អ្នកជួលជាមួយបន្ទប់ និងកំណត់ការបង់ប្រាក់។"}</p>
              <Button onClick={hasActiveFilters ? clearFilters : handleAddNew} variant={hasActiveFilters ? "outline" : "default"} className={cn("mt-5 gap-2 rounded-xl", !hasActiveFilters && "bg-indigo-600 text-white hover:bg-indigo-500")}>{hasActiveFilters ? <RotateCcw size={16} /> : <Plus size={16} />}{hasActiveFilters ? "សម្អាតតម្រង" : "បង្កើតកិច្ចសន្យាដំបូង"}</Button>
            </div>
          ) : (
            <table className="w-full min-w-270 border-collapse text-left">
              <thead className="sticky top-0 z-10 border-b border-(--panel-border) bg-(--panel-inset)">
                <tr className="text-xs font-medium text-(--panel-text-muted)">
                  <th className="px-4 py-3">អ្នកជួល</th>
                  <th className="px-4 py-3">បន្ទប់</th>
                  <th className="px-4 py-3">រយៈពេលកិច្ចសន្យា</th>
                  <th className="px-4 py-3">ប្រាក់កក់</th>
                  <th className="px-4 py-3">
                    <Tooltip>
                      <TooltipTrigger render={<span className="inline-flex cursor-default items-center gap-1" />}>
                        <CalendarClock className="h-3.5 w-3.5 text-(--panel-text-subtle)" />
                        ថ្ងៃបង់
                      </TooltipTrigger>
                      <TooltipContent>ថ្ងៃប្រចាំខែដែលត្រូវបង់ប្រាក់ជួល</TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3">ស្ថានភាព</th>
                  <th className="px-4 py-3 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--panel-border-subtle) text-sm">
                {visibleContracts.map((contract) => (
                  <tr key={contract.id} className="transition-colors hover:bg-(--panel-hover)/55">
                    <td className="px-4 py-2.5"><p className="font-semibold text-(--panel-text)">{contract.profiles?.full_name || "-"}</p><p className="mt-0.5 text-xs text-(--panel-text-subtle)">{contract.profiles?.phone_number || "មិនមានលេខទូរស័ព្ទ"}</p></td>
                    <td className="px-4 py-2.5"><p className="font-semibold text-(--panel-text)">#{contract.rooms?.room_number || "-"}</p><p className="mt-0.5 text-xs text-(--panel-text-subtle)">{contract.rooms?.room_type || "-"} · ជាន់ {contract.rooms?.floor || "-"}</p></td>
                    <td className="px-4 py-2.5">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <div className="flex w-fit cursor-default items-center gap-2 text-(--panel-text-muted) underline decoration-dotted decoration-(--panel-text-subtle) underline-offset-4" />
                          }
                        >
                          <CalendarDays className="h-4 w-4 shrink-0 text-(--panel-text-subtle)" />
                          <span>{formatKhmerDate(contract.start_date)} → {formatKhmerDate(contract.end_date)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {formatKhmerDate(contract.start_date, { withDay: true })} → {formatKhmerDate(contract.end_date, { withDay: true })}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-300">${Number(contract.deposit_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-(--panel-text-muted)">ថ្ងៃទី {contract.due_day}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={contract.status} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button size="icon" variant="ghost" aria-label={`សកម្មភាពសម្រាប់កិច្ចសន្យារបស់ ${contract.profiles?.full_name || "-"}`} className="h-9 w-9 rounded-lg text-(--panel-text-muted) hover:bg-(--panel-hover) hover:text-(--panel-text)">
                              <MoreVertical size={16} />
                            </Button>
                          }
                        />
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => { setSelectedContract(contract); setIsModalOpen(true); }}>
                            <Edit2 size={14} /> កែប្រែ
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => { setContractToDelete(contract); setIsDeleteModalOpen(true); }}>
                            <Trash2 size={14} /> លុប
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {hasMore && <tr><td colSpan={7} className="p-4 text-center"><div ref={sentinelRef} className="flex items-center justify-center gap-2 text-xs text-(--panel-text-subtle)"><Loader2 size={14} className="animate-spin" /> កំពុងផ្ទុកបន្ថែម...</div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <ContractModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} contract={selectedContract} tenants={tenants} rooms={rooms} defaultDueDay={defaultDueDay} onSuccess={handleContractUpserted} />
      <ContractDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} contract={contractToDelete} onDeleteSuccess={(contractId) => setContracts((current) => current.filter((contract) => contract.id !== contractId))} />
    </div>
  );
}

const STATUS_ICONS: Record<ContractStatus, React.ComponentType<{ className?: string }>> = {
  active: CheckCircle2,
  pending: Clock3,
  expired: CalendarX,
  terminated: XCircle,
};

const CONTRACT_STATUS_TONE: Record<ContractStatus, "green" | "amber" | "gray" | "red"> = {
  active: "green",
  pending: "amber",
  expired: "gray",
  terminated: "red",
};

function StatusBadge({ status }: { status: ContractStatus }) {
  const StatusIcon = STATUS_ICONS[status];
  return (
    // Icon repeats what the dot color already says — status isn't conveyed
    // by color alone, so it still reads for colorblind users or in a
    // black-and-white printout.
    <Badge tone={CONTRACT_STATUS_TONE[status]} icon={<StatusIcon className="h-3 w-3 shrink-0" />}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
