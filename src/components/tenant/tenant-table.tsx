"use client";

import { useMemo, useRef, useState } from "react";
import {
  ContactRound,
  Edit2,
  Image as ImageIcon,
  ImageOff,
  Loader2,
  Mail,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInfiniteReveal } from "@/hooks/use-infinite-reveal";
import { cn, formatKhmerDate } from "@/lib/utils";
import { Tenant } from "@/lib/validations/tenants";

import TenantDeleteModal from "./tenant-delete-modal";
import TenantModal from "./tenant-form-modal";

interface TenantTableProps {
  initialTenants: Tenant[];
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  tone: "violet" | "emerald" | "blue" | "amber";
}) {
  const styles = {
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
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

export function TenantTableWrapper({ initialTenants }: TenantTableProps) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants || []);
  const [prevInitialTenants, setPrevInitialTenants] = useState(initialTenants);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredTenants = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return tenants.filter((tenant) =>
      [tenant?.full_name, tenant?.phone_number, tenant?.email]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(query)),
    );
  }, [tenants, searchQuery]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleItems: visibleTenants, hasMore, sentinelRef } = useInfiniteReveal(
    filteredTenants,
    scrollContainerRef,
  );

  const hasSearch = searchQuery.trim() !== "";
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
      <section aria-label="ស្ថិតិអ្នកជួល" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="អ្នកជួលសរុប" value={stats.total} subtitle="គណនីអ្នកជួលក្នុងប្រព័ន្ធ" icon={<Users size={20} />} tone="violet" />
        <StatCard title="មានលេខទូរស័ព្ទ" value={stats.withPhone} subtitle={`${stats.total - stats.withPhone} នាក់មិនទាន់បញ្ចូល`} icon={<Phone size={20} />} tone="emerald" />
        <StatCard title="មានអ៊ីមែល" value={stats.withEmail} subtitle={`${stats.total - stats.withEmail} នាក់មិនទាន់បញ្ចូល`} icon={<Mail size={20} />} tone="blue" />
        <StatCard title="មានអត្តសញ្ញាណប័ណ្ណ" value={stats.withIdCard} subtitle={`${stats.total - stats.withIdCard} នាក់មិនទាន់ផ្ទុកឡើង`} icon={<ImageIcon size={20} />} tone="amber" />
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
          <Button onClick={handleAddNew} className="h-10 gap-2 rounded-xl bg-indigo-600 px-4 text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500">
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
          {hasSearch && <button type="button" onClick={() => setSearchQuery("")} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-(--panel-text-muted) transition hover:bg-(--panel-hover) hover:text-(--panel-text)"><RotateCcw className="h-3.5 w-3.5" /> សម្អាតការស្វែងរក</button>}
        </div>

        <div ref={scrollContainerRef} className="max-h-[560px] overflow-auto">
          {filteredTenants.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 rounded-2xl bg-violet-500/10 p-4 text-violet-500 dark:text-violet-300">
                {hasSearch ? <Search className="h-7 w-7" /> : <ContactRound className="h-7 w-7" />}
              </div>
              <h3 className="text-base font-semibold text-(--panel-text)">{hasSearch ? "រកមិនឃើញអ្នកជួល" : "មិនទាន់មានអ្នកជួល"}</h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-(--panel-text-subtle)">
                {hasSearch ? "សាកល្បងឈ្មោះ លេខទូរស័ព្ទ ឬអ៊ីមែលផ្សេងទៀត។" : "បន្ថែមអ្នកជួលដំបូង ដើម្បីចាប់ផ្តើមបង្កើតកិច្ចសន្យា និងគ្រប់គ្រងការទូទាត់។"}
              </p>
              <Button onClick={hasSearch ? () => setSearchQuery("") : handleAddNew} variant={hasSearch ? "outline" : "default"} className={cn("mt-5 gap-2 rounded-xl", !hasSearch && "bg-indigo-600 text-white hover:bg-indigo-500")}>
                {hasSearch ? <RotateCcw size={16} /> : <Plus size={16} />}{hasSearch ? "សម្អាតការស្វែងរក" : "បន្ថែមអ្នកជួលដំបូង"}
              </Button>
            </div>
          ) : (
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="sticky top-0 z-10 border-b border-(--panel-border) bg-(--panel-inset)">
                <tr className="text-xs font-medium text-(--panel-text-muted)"><th className="px-5 py-3">អត្តសញ្ញាណប័ណ្ណ</th><th className="px-5 py-3">អ្នកជួល</th><th className="px-5 py-3">អ៊ីមែល</th><th className="px-5 py-3">លេខទូរស័ព្ទ</th><th className="px-5 py-3">តួនាទី</th><th className="px-5 py-3">ថ្ងៃបង្កើត</th><th className="px-5 py-3 text-right">សកម្មភាព</th></tr>
              </thead>
              <tbody className="divide-y divide-(--panel-border-subtle) text-sm">
                {visibleTenants.map((tenant) => (
                  <tr key={tenant.id} className="transition-colors hover:bg-(--panel-hover)/55">
                    <td className="px-5 py-3.5"><div className="h-12 w-16 overflow-hidden rounded-xl border border-(--panel-border) bg-(--panel-inset)">{tenant.id_card_images?.length ? <img src={tenant.id_card_images[0]} alt={`អត្តសញ្ញាណប័ណ្ណ ${tenant.full_name}`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-(--panel-text-subtle)"><ImageOff size={17} /></div>}</div></td>
                    <td className="px-5 py-3.5"><p className="font-semibold text-(--panel-text)">{tenant.full_name}</p><p className="mt-0.5 text-xs text-(--panel-text-subtle)">លេខសម្គាល់ {tenant.id.slice(0, 8)}</p></td>
                    <td className="px-5 py-3.5 text-(--panel-text-muted)">{tenant.email || <span className="text-(--panel-text-subtle)">មិនបានបញ្ចូល</span>}</td>
                    <td className="px-5 py-3.5 text-(--panel-text-muted)">{tenant.phone_number || <span className="text-(--panel-text-subtle)">មិនបានបញ្ចូល</span>}</td>
                    <td className="px-5 py-3.5"><span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-300"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" />អ្នកជួល</span></td>
                    <td className="px-5 py-3.5 text-(--panel-text-muted)">{formatKhmerDate(tenant.created_at, { withDay: true })}</td>
                    <td className="px-5 py-3.5 text-right"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label={`កែប្រែ ${tenant.full_name}`} onClick={() => { setSelectedTenant(tenant); setIsModalOpen(true); }} className="h-9 w-9 rounded-lg text-(--panel-text-muted) hover:text-indigo-500"><Edit2 size={15} /></Button><Button size="icon" variant="ghost" aria-label={`លុប ${tenant.full_name}`} onClick={() => { setTenantToDelete(tenant); setIsDeleteModalOpen(true); }} className="h-9 w-9 rounded-lg text-(--panel-text-muted) hover:bg-red-500/10 hover:text-red-500"><Trash2 size={15} /></Button></div></td>
                  </tr>
                ))}
                {hasMore && <tr><td colSpan={7} className="p-4 text-center"><div ref={sentinelRef} className="flex items-center justify-center gap-2 text-xs text-(--panel-text-subtle)"><Loader2 size={14} className="animate-spin" /> កំពុងផ្ទុកបន្ថែម...</div></td></tr>}
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
