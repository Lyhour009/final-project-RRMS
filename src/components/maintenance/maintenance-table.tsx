"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  MoreVertical,
  Play,
  RotateCcw,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";

import { updateMaintenanceStatus } from "@/actions/maintenances";
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
import { useInfiniteReveal } from "@/hooks/use-infinite-reveal";
import { formatKhmerDate } from "@/lib/utils";

import MaintenanceDeleteModal from "./maintenance-delete-modal";

export interface MaintenanceRequestItem {
  id: string;
  issue_title: string;
  issue_description: string;
  status: "pending" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  created_at: string;
  resolved_at: string | null;
  profiles?: { full_name?: string; phone_number?: string } | null;
  rooms?: { room_number?: string } | null;
}

type MaintenanceFilter = "all" | MaintenanceRequestItem["status"];

const FILTER_OPTIONS: { value: MaintenanceFilter; label: string; dotClass?: string }[] = [
  { value: "all", label: "ទាំងអស់" },
  { value: "pending", label: "រង់ចាំ", dotClass: "bg-amber-500" },
  { value: "in_progress", label: "កំពុងធ្វើ", dotClass: "bg-blue-500" },
  { value: "resolved", label: "រួចរាល់", dotClass: "bg-emerald-500" },
];

export function MaintenanceTable({ initialRequests }: { initialRequests: MaintenanceRequestItem[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MaintenanceFilter>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<MaintenanceRequestItem | null>(null);

  const stats = useMemo(() => ({
    pending: requests.filter((item) => item.status === "pending").length,
    inProgress: requests.filter((item) => item.status === "in_progress").length,
    resolved: requests.filter((item) => item.status === "resolved").length,
    highPriority: requests.filter((item) => item.priority === "high" && item.status !== "resolved").length,
  }), [requests]);
  const counts: Record<MaintenanceFilter, number> = { all: requests.length, pending: stats.pending, in_progress: stats.inProgress, resolved: stats.resolved };

  const filteredRequests = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return requests.filter((item) => {
      const matchesSearch = [item.profiles?.full_name, item.profiles?.phone_number, item.rooms?.room_number, item.issue_title, item.issue_description]
        .map((value) => String(value || "").toLowerCase()).some((value) => value.includes(query));
      return matchesSearch && (statusFilter === "all" || item.status === statusFilter);
    });
  }, [requests, searchQuery, statusFilter]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleItems, hasMore, sentinelRef } = useInfiniteReveal(filteredRequests, scrollContainerRef);
  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";
  const clearFilters = () => { setSearchQuery(""); setStatusFilter("all"); };

  const changeStatus = async (item: MaintenanceRequestItem, status: "in_progress" | "resolved") => {
    setLoadingId(item.id);
    try {
      await updateMaintenanceStatus(item.id, status);
      setRequests((current) => current.map((request) => request.id === item.id ? { ...request, status, resolved_at: status === "resolved" ? new Date().toISOString() : null } : request));
      toast.success(status === "resolved" ? "បានបញ្ចប់សំណើជួសជុល" : "បានចាប់ផ្តើមការជួសជុល");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "មានបញ្ហាក្នុងការកែប្រែស្ថានភាព");
    } finally { setLoadingId(null); }
  };

  return (
    <div className="space-y-5">
      <section aria-label="ស្ថិតិសំណើជួសជុល" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard title="កំពុងរង់ចាំ" value={stats.pending} subtitle="សំណើដែលត្រូវពិនិត្យ" icon={<Clock3 size={16} />} tone="amber" />
        <StatCard title="កំពុងធ្វើ" value={stats.inProgress} subtitle="ការងារដែលកំពុងដំណើរការ" icon={<Wrench size={16} />} tone="blue" />
        <StatCard title="រួចរាល់" value={stats.resolved} subtitle="សំណើដែលបានដោះស្រាយ" icon={<CheckCircle2 size={16} />} tone="emerald" />
        <StatCard title="អាទិភាពខ្ពស់" value={stats.highPriority} subtitle="សំណើសកម្មដែលត្រូវប្រញាប់" icon={<AlertTriangle size={16} />} tone="red" />
      </section>

      <section className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm"><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="relative w-full xl:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--panel-text-subtle)" /><Input aria-label="ស្វែងរកសំណើជួសជុល" placeholder="ស្វែងរកអ្នកជួល បន្ទប់ ឬបញ្ហា..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-10 border-(--panel-border) bg-(--panel-inset) pl-10 text-(--panel-text) placeholder:text-(--panel-text-subtle)" /></div><FilterDropdown ariaLabel="ត្រងតាមស្ថានភាពសំណើជួសជុល" value={statusFilter} onChange={setStatusFilter} options={FILTER_OPTIONS.map((option) => ({ ...option, count: counts[option.value] }))} /></div></section>

      <section className="overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel) shadow-sm"><div className="flex items-center justify-between border-b border-(--panel-border-subtle) px-4 py-3 sm:px-5"><div><h2 className="text-sm font-semibold text-(--panel-text)">បញ្ជីសំណើជួសជុល</h2><p className="mt-0.5 text-xs text-(--panel-text-subtle)">បង្ហាញ {filteredRequests.length} ក្នុងចំណោម {requests.length} សំណើ</p></div>{hasActiveFilters && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-(--panel-text-muted) transition hover:bg-(--panel-hover) hover:text-(--panel-text)"><RotateCcw className="h-3.5 w-3.5" /> សម្អាតតម្រង</button>}</div><div ref={scrollContainerRef} className="max-h-[560px] overflow-auto">{filteredRequests.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center"><div className="mb-4 rounded-2xl bg-orange-500/10 p-4 text-orange-500 dark:text-orange-300">{hasActiveFilters ? <Search className="h-7 w-7" /> : <Wrench className="h-7 w-7" />}</div><h3 className="text-base font-semibold text-(--panel-text)">{hasActiveFilters ? "រកមិនឃើញសំណើជួសជុល" : "មិនទាន់មានសំណើជួសជុល"}</h3><p className="mt-1 max-w-sm text-sm leading-6 text-(--panel-text-subtle)">{hasActiveFilters ? "សាកល្បងពាក្យស្វែងរក ឬស្ថានភាពផ្សេងទៀត។" : "សំណើដែលអ្នកជួលបញ្ជូននឹងបង្ហាញនៅទីនេះសម្រាប់ការតាមដាន។"}</p>{hasActiveFilters && <Button onClick={clearFilters} variant="outline" className="mt-5 gap-2 rounded-xl"><RotateCcw size={16} /> សម្អាតតម្រង</Button>}</div> : <table className="w-full min-w-[1100px] border-collapse text-left"><thead className="sticky top-0 z-10 border-b border-(--panel-border) bg-(--panel-inset)"><tr className="text-xs font-medium text-(--panel-text-muted)"><th className="px-5 py-3">អ្នកជួល</th><th className="px-5 py-3">បន្ទប់</th><th className="px-5 py-3">បញ្ហា</th><th className="px-5 py-3">អាទិភាព</th><th className="px-5 py-3">ស្ថានភាព</th><th className="px-5 py-3">កាលបរិច្ឆេទ</th><th className="px-5 py-3 text-right">សកម្មភាព</th></tr></thead><tbody className="divide-y divide-(--panel-border-subtle) text-sm">{visibleItems.map((item) => <tr key={item.id} className="transition-colors hover:bg-(--panel-hover)/55"><td className="px-5 py-2.5"><p className="font-semibold text-(--panel-text)">{item.profiles?.full_name || "-"}</p><p className="mt-0.5 text-xs text-(--panel-text-subtle)">{item.profiles?.phone_number || "មិនមានលេខទូរស័ព្ទ"}</p></td><td className="px-5 py-2.5 font-medium text-(--panel-text-muted)">#{item.rooms?.room_number || "-"}</td><td className="max-w-md px-5 py-2.5"><p className="font-medium text-(--panel-text)">{item.issue_title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-(--panel-text-subtle)">{item.issue_description}</p></td><td className="px-5 py-2.5"><PriorityBadge priority={item.priority} /></td><td className="px-5 py-2.5"><StatusBadge status={item.status} /></td><td className="px-5 py-2.5 text-(--panel-text-muted)">{formatKhmerDate(item.created_at, { withDay: true })}</td><td className="px-5 py-2.5 text-right"><div className="flex justify-end items-center gap-1">{item.status === "pending" && <Button size="sm" onClick={() => changeStatus(item, "in_progress")} disabled={loadingId === item.id} className="h-9 gap-1.5 rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-500">{loadingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} ចាប់ផ្តើម</Button>}{item.status !== "resolved" && <Button size="sm" onClick={() => changeStatus(item, "resolved")} disabled={loadingId === item.id} className="h-9 gap-1.5 rounded-lg bg-emerald-600 px-3 text-white hover:bg-emerald-500"><Check className="h-3.5 w-3.5" /> រួចរាល់</Button>}{item.status !== "resolved" && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon" variant="ghost" aria-label={`សកម្មភាពសម្រាប់សំណើជួសជុលរបស់ ${item.profiles?.full_name || "-"}`} disabled={loadingId === item.id} className="h-9 w-9 rounded-lg text-(--panel-text-muted) hover:bg-(--panel-hover) hover:text-(--panel-text)">
                <MoreVertical size={16} />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuItem variant="destructive" onClick={() => setRequestToDelete(item)}>
              <Trash2 size={14} /> លុប
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}</div></td></tr>)}{hasMore && <tr><td colSpan={7} className="p-4 text-center"><div ref={sentinelRef} className="flex items-center justify-center gap-2 text-xs text-(--panel-text-subtle)"><Loader2 size={14} className="animate-spin" /> កំពុងផ្ទុកបន្ថែម...</div></td></tr>}</tbody></table>}</div></section>

      <MaintenanceDeleteModal request={requestToDelete} isOpen={Boolean(requestToDelete)} onClose={() => setRequestToDelete(null)} onDeleteSuccess={(requestId) => setRequests((current) => current.filter((item) => item.id !== requestId))} />
    </div>
  );
}

const MAINTENANCE_STATUS: Record<MaintenanceRequestItem["status"], { tone: "amber" | "blue" | "green"; label: string }> = {
  pending: { tone: "amber", label: "រង់ចាំ" },
  in_progress: { tone: "blue", label: "កំពុងធ្វើ" },
  resolved: { tone: "green", label: "រួចរាល់" },
};

function StatusBadge({ status }: { status: MaintenanceRequestItem["status"] }) {
  const { tone, label } = MAINTENANCE_STATUS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

const PRIORITY_TONE: Record<MaintenanceRequestItem["priority"], { tone: "green" | "amber" | "red"; label: string }> = {
  low: { tone: "green", label: "ទាប" },
  medium: { tone: "amber", label: "មធ្យម" },
  high: { tone: "red", label: "ខ្ពស់" },
};

function PriorityBadge({ priority }: { priority: MaintenanceRequestItem["priority"] }) {
  const { tone, label } = PRIORITY_TONE[priority];
  return <Badge tone={tone} dot={false}>{label}</Badge>;
}
