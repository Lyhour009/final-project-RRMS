"use client";

import { useMemo, useRef, useState } from "react";
import {
  ContactRound,
  DoorOpen,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { useInfiniteReveal } from "@/hooks/use-infinite-reveal";
import { cn, formatKhmerDate } from "@/lib/utils";
import { Tenant } from "@/lib/validations/tenants";

import TenantDeleteModal from "./tenant-delete-modal";
import TenantModal from "./tenant-form-modal";

interface TenantTableProps {
  initialTenants: Tenant[];
}

type DataFilter = "phone" | "email" | "idcard" | null;

// Deterministic color per tenant (hashed off their name) so the same
// person always gets the same avatar color across renders/pages, instead
// of a random or uniform color.
const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-fuchsia-500",
];

function avatarColorClass(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialOf(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}


export function TenantTableWrapper({ initialTenants }: TenantTableProps) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants || []);
  const [prevInitialTenants, setPrevInitialTenants] = useState(initialTenants);
  const [searchQuery, setSearchQuery] = useState("");
  const [dataFilter, setDataFilter] = useState<DataFilter>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  if (initialTenants !== prevInitialTenants) {
    setPrevInitialTenants(initialTenants);
    setTenants(initialTenants || []);
  }

  const stats = useMemo(
    () => ({
      total: tenants.length,
      withPhone: tenants.filter((tenant) => Boolean(tenant.phone_number)).length,
      withEmail: tenants.filter((tenant) => Boolean(tenant.email)).length,
      withIdCard: tenants.filter((tenant) => (tenant.id_card_images || []).length > 0).length,
    }),
    [tenants],
  );

  const toggleDataFilter = (filter: DataFilter) => {
    setDataFilter((current) => (current === filter ? null : filter));
  };

  const filteredTenants = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return tenants.filter((tenant) => {
      const matchesSearch = [tenant?.full_name, tenant?.phone_number, tenant?.email]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(query));

      const matchesDataFilter =
        dataFilter === "phone"
          ? !tenant.phone_number
          : dataFilter === "email"
            ? !tenant.email
            : dataFilter === "idcard"
              ? !(tenant.id_card_images || []).length
              : true;

      return matchesSearch && matchesDataFilter;
    });
  }, [tenants, searchQuery, dataFilter]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleItems: visibleTenants, hasMore, sentinelRef } = useInfiniteReveal(
    filteredTenants,
    scrollContainerRef,
  );

  const hasSearch = searchQuery.trim() !== "";
  const hasActiveFilters = hasSearch || dataFilter !== null;
  const clearAllFilters = () => {
    setSearchQuery("");
    setDataFilter(null);
  };
  const handleAddNew = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };
  const handleTenantUpserted = (updatedTenant: Tenant) => {
    setTenants((current) => {
      const exists = current.some((tenant) => tenant.id === updatedTenant.id);
      return exists
        ? current.map((tenant) => (tenant.id === updatedTenant.id ? updatedTenant : tenant))
        : [updatedTenant, ...current];
    });
  };

  return (
    <div className="space-y-5">
      <section aria-label="ស្ថិតិអ្នកជួល" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard title="អ្នកជួលសរុប" value={stats.total} subtitle="គណនីអ្នកជួលក្នុងប្រព័ន្ធ" icon={<Users size={16} />} tone="violet" />
        <StatCard
          title="មានលេខទូរស័ព្ទ"
          value={stats.withPhone}
          subtitle={`${stats.total - stats.withPhone} នាក់មិនទាន់បញ្ចូល`}
          missingCount={stats.total - stats.withPhone}
          onFilterClick={() => toggleDataFilter("phone")}
          isFilterActive={dataFilter === "phone"}
          icon={<Phone size={16} />}
          tone="emerald"
        />
        <StatCard
          title="មានអ៊ីមែល"
          value={stats.withEmail}
          subtitle={`${stats.total - stats.withEmail} នាក់មិនទាន់បញ្ចូល`}
          missingCount={stats.total - stats.withEmail}
          onFilterClick={() => toggleDataFilter("email")}
          isFilterActive={dataFilter === "email"}
          icon={<Mail size={16} />}
          tone="blue"
        />
        <StatCard
          title="មានអត្តសញ្ញាណប័ណ្ណ"
          value={stats.withIdCard}
          subtitle={`${stats.total - stats.withIdCard} នាក់មិនទាន់ផ្ទុកឡើង`}
          missingCount={stats.total - stats.withIdCard}
          onFilterClick={() => toggleDataFilter("idcard")}
          isFilterActive={dataFilter === "idcard"}
          icon={<ImageIcon size={16} />}
          tone="amber"
        />
      </section>

      <section className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--panel-text-subtle)" />
            <Input
              aria-label="ស្វែងរកអ្នកជួល"
              placeholder="ស្វែងរកឈ្មោះ លេខទូរស័ព្ទ ឬអ៊ីមែល..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 border-(--panel-border) bg-(--panel-inset) pl-10 text-(--panel-text) placeholder:text-(--panel-text-subtle)"
            />
            {hasSearch && (
              <button type="button" aria-label="សម្អាតការស្វែងរក" onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-(--panel-text-subtle) transition hover:bg-(--panel-hover) hover:text-(--panel-text)">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button onClick={handleAddNew} className="h-10 gap-2 rounded-xl bg-indigo-600 px-4 font-semibold text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40 hover:bg-indigo-500">
            <Plus size={16} /> បន្ថែមអ្នកជួល
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel) shadow-sm">
        <div className="flex items-center justify-between border-b border-(--panel-border-subtle) px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-(--panel-text)">បញ្ជីអ្នកជួល</h2>
            <p className="mt-0.5 text-xs text-(--panel-text-subtle)">បង្ហាញ {filteredTenants.length} ក្នុងចំណោម {stats.total} នាក់</p>
          </div>
          {hasActiveFilters && <button type="button" onClick={clearAllFilters} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-(--panel-text-muted) transition hover:bg-(--panel-hover) hover:text-(--panel-text)"><RotateCcw className="h-3.5 w-3.5" /> សម្អាតតម្រង</button>}
        </div>

        <div ref={scrollContainerRef} className="max-h-[560px] overflow-auto">
          {filteredTenants.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 rounded-2xl bg-violet-500/10 p-4 text-violet-500 dark:text-violet-300">
                {hasActiveFilters ? <Search className="h-7 w-7" /> : <ContactRound className="h-7 w-7" />}
              </div>
              <h3 className="text-base font-semibold text-(--panel-text)">{hasActiveFilters ? "រកមិនឃើញអ្នកជួល" : "មិនទាន់មានអ្នកជួល"}</h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-(--panel-text-subtle)">
                {hasActiveFilters ? "សាកល្បងលក្ខខណ្ឌស្វែងរក ឬតម្រងផ្សេងទៀត។" : "បន្ថែមអ្នកជួលដំបូង ដើម្បីចាប់ផ្តើមបង្កើតកិច្ចសន្យា និងគ្រប់គ្រងការទូទាត់។"}
              </p>
              <Button onClick={hasActiveFilters ? clearAllFilters : handleAddNew} variant={hasActiveFilters ? "outline" : "default"} className={cn("mt-5 gap-2 rounded-xl", !hasActiveFilters && "bg-indigo-600 text-white hover:bg-indigo-500")}>
                {hasActiveFilters ? <RotateCcw size={16} /> : <Plus size={16} />}{hasActiveFilters ? "សម្អាតតម្រង" : "បន្ថែមអ្នកជួលដំបូង"}
              </Button>
            </div>
          ) : (
            <table className="w-full min-w-235 border-collapse text-left">
              <thead className="sticky top-0 z-10 border-b border-(--panel-border) bg-(--panel-inset)">
                <tr className="text-xs font-medium text-(--panel-text-muted)"><th className="px-5 py-3">អ្នកជួល</th><th className="px-5 py-3">អ៊ីមែល</th><th className="px-5 py-3">លេខទូរស័ព្ទ</th><th className="px-5 py-3">បន្ទប់ / កិច្ចសន្យា</th><th className="px-5 py-3">ថ្ងៃបង្កើត</th><th className="px-5 py-3 text-right">សកម្មភាព</th></tr>
              </thead>
              <tbody className="divide-y divide-(--panel-border-subtle) text-sm">
                {visibleTenants.map((tenant) => (
                  <tr key={tenant.id} className="transition-colors hover:bg-(--panel-hover)/55">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="shrink-0">
                          {tenant.id_card_images?.[0] && (
                            <AvatarImage src={tenant.id_card_images[0]} alt={tenant.full_name} />
                          )}
                          <AvatarFallback className={cn("font-semibold text-white", avatarColorClass(tenant.full_name))}>
                            {initialOf(tenant.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-(--panel-text)">{tenant.full_name}</p>
                          <p className="mt-0.5 truncate font-mono text-xs text-(--panel-text-subtle)/70">
                            {tenant.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-(--panel-text-muted)">{tenant.email || <span className="text-(--panel-text-subtle)">មិនបានបញ្ចូល</span>}</td>
                    <td className="px-5 py-2.5 text-(--panel-text-muted)">{tenant.phone_number || <span className="text-(--panel-text-subtle)">មិនបានបញ្ចូល</span>}</td>
                    <td className="px-5 py-2.5">
                      {tenant.activeContract ? (
                        <Badge tone="blue" dot={false} icon={<DoorOpen size={12} className="shrink-0" />}>
                          បន្ទប់ #{tenant.activeContract.roomNumber}
                        </Badge>
                      ) : (
                        <Badge tone="gray">គ្មានកិច្ចសន្យា</Badge>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-(--panel-text-muted)">{formatKhmerDate(tenant.created_at, { withDay: true })}</td>
                    <td className="px-5 py-2.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button size="icon" variant="ghost" aria-label={`សកម្មភាពសម្រាប់ ${tenant.full_name}`} className="h-9 w-9 rounded-lg text-(--panel-text-muted) hover:bg-(--panel-hover) hover:text-(--panel-text)">
                              <MoreVertical size={16} />
                            </Button>
                          }
                        />
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => { setSelectedTenant(tenant); setIsModalOpen(true); }}>
                            <Edit2 size={14} /> កែប្រែ
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => { setTenantToDelete(tenant); setIsDeleteModalOpen(true); }}>
                            <Trash2 size={14} /> លុប
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {hasMore && <tr><td colSpan={6} className="p-4 text-center"><div ref={sentinelRef} className="flex items-center justify-center gap-2 text-xs text-(--panel-text-subtle)"><Loader2 size={14} className="animate-spin" /> កំពុងផ្ទុកបន្ថែម...</div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <TenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tenant={selectedTenant} onSuccess={handleTenantUpserted} />
      <TenantDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} tenant={tenantToDelete} onDeleteSuccess={(tenantId) => setTenants((current) => current.filter((tenant) => tenant.id !== tenantId))} />
    </div>
  );
}
