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
import { Input } from "@/components/ui/input";
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
  activeClass: string;
  activeCountClass: string;
}[] = [
  {
    value: "all",
    label: "ទាំងអស់",
    // Soft tint, not solid — keeps this from competing with the solid
    // indigo "+ បន្ថែមកិច្ចសន្យា" button for attention as the primary action.
    activeClass:
      "bg-indigo-500/15 text-indigo-700 ring-1 ring-inset ring-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300",
    activeCountClass: "text-indigo-700/70 dark:text-indigo-300/70",
  },
  { value: "active", label: "សកម្ម", activeClass: "bg-emerald-600 text-white", activeCountClass: "text-white/75" },
  { value: "pending", label: "រង់ចាំ", activeClass: "bg-amber-600 text-white", activeCountClass: "text-white/75" },
  { value: "ended", label: "បញ្ចប់", activeClass: "bg-red-600 text-white", activeCountClass: "text-white/75" },
];

function StatCard({ title, value, subtitle, icon, tone }: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  tone: "indigo" | "emerald" | "amber" | "red";
}) {
  const styles = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    red: "bg-red-500/10 text-red-600 dark:text-red-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5 dark:hover:shadow-black/20 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-(--panel-text-muted)">{title}</p>
          <p className="mt-2 text-3xl font-bold leading-none tracking-tight">{value}</p>
        </div>
        <div className={cn("rounded-xl p-2.5", styles)}>{icon}</div>
      </div>
      <p className="mt-3 text-xs text-(--panel-text-subtle)">{subtitle}</p>
    </div>
  );
}

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
      <section aria-label="ស្ថិតិកិច្ចសន្យា" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="កិច្ចសន្យាសរុប" value={stats.total} subtitle="កិច្ចសន្យាទាំងអស់ក្នុងប្រព័ន្ធ" icon={<FileText size={20} />} tone="indigo" />
        <StatCard title="កំពុងសកម្ម" value={stats.active} subtitle="កិច្ចសន្យាដែលកំពុងដំណើរការ" icon={<CheckCircle2 size={20} />} tone="emerald" />
        <StatCard title="កំពុងរង់ចាំ" value={stats.pending} subtitle="ត្រូវពិនិត្យ និងធ្វើឱ្យសកម្ម" icon={<Clock3 size={20} />} tone="amber" />
        <StatCard title="បញ្ចប់ ឬផុតកំណត់" value={stats.ended} subtitle="កិច្ចសន្យាដែលលែងសកម្ម" icon={<XCircle size={20} />} tone="red" />
      </section>

      <section className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--panel-text-subtle)" />
            <Input aria-label="ស្វែងរកកិច្ចសន្យា" placeholder="ស្វែងរកអ្នកជួល លេខទូរស័ព្ទ ឬលេខបន្ទប់..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-10 border-(--panel-border) bg-(--panel-inset) pl-10 text-(--panel-text) placeholder:text-(--panel-text-subtle)" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-(--panel-border) bg-(--panel-inset) p-1 sm:w-auto">
              {FILTER_OPTIONS.map((option) => (
                <button key={option.value} type="button" onClick={() => setStatusFilter(option.value)} className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition", statusFilter === option.value ? option.activeClass : "text-(--panel-text-muted) hover:bg-(--panel-hover) hover:text-(--panel-text)")}>
                  {option.label}<span className={cn("text-[10px]", statusFilter === option.value ? option.activeCountClass : "text-(--panel-text-subtle)")}>{counts[option.value]}</span>
                </button>
              ))}
            </div>
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

function StatusBadge({ status }: { status: ContractStatus }) {
  const styles = {
    active: { className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
    pending: { className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
    expired: { className: "border-slate-500/20 bg-slate-500/10 text-(--panel-text-muted)", dot: "bg-slate-500" },
    terminated: { className: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300", dot: "bg-red-500" },
  }[status];
  const StatusIcon = STATUS_ICONS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", styles.className)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", styles.dot)} />
      {/* Icon repeats what the dot color already says — status isn't
          conveyed by color alone, so it still reads for colorblind users
          or in a black-and-white printout. */}
      <StatusIcon className="h-3 w-3 shrink-0" />
      {STATUS_LABELS[status]}
    </span>
  );
}
