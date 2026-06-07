"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Users, Search, Phone } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import TenantFormModal from "@/components/tenant/tenant-form-model";
import DeleteTenantModal from "@/components/tenant/tenant-delete-modal";
import type { Tenant } from "@/types/tenant";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TenantsClientProps {
  initialTenants: Tenant[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getActiveContract(tenant: Tenant) {
  return tenant.contracts?.find((c) => c.status === "active") ?? null;
}

function TenantStatusBadge({ tenant }: { tenant: Tenant }) {
  const active = getActiveContract(tenant);
  if (active) {
    return (
      <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
        កំពុងជួល
      </span>
    );
  }
  return (
    <span className="px-2 py-1 rounded-md bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs">
      គ្មានកិច្ចសន្យា
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  dot,
}: {
  label: string;
  value: number;
  dot?: string;
}) {
  return (
    <div className="bg-[#0B0F19]/80 border border-white/[0.08] rounded-2xl px-5 py-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
        {dot && (
          <span className={cn("w-2 h-2 rounded-full inline-block", dot)} />
        )}
        {label}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TenantsClient({ initialTenants }: TenantsClientProps) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [search, setSearch] = useState("");

  // Modal state
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Tenant | null>(null);

  // ─── Stats ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter((t) => getActiveContract(t)).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [tenants]);

  // ─── Filtered list ───────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tenants;
    return tenants.filter(
      (t) =>
        t.full_name?.toLowerCase().includes(q) ||
        t.phone_number?.toLowerCase().includes(q),
    );
  }, [tenants, search]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAddNew = () => {
    setSelected(null);
    setFormOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelected(tenant);
    setFormOpen(true);
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setSelected(tenant);
    setDeleteOpen(true);
  };

  const handleSuccess = (updated: Tenant, type: "add" | "edit") => {
    if (type === "add") {
      setTenants((prev) => [updated, ...prev]);
    } else {
      setTenants((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
    }
  };

  const handleDeleteSuccess = (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 font-khmer">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            គ្រប់គ្រងអ្នកជួល
          </h1>
          <p className="text-sm text-slate-400">
            គ្រប់គ្រង និងតាមដានព័ត៌មានអ្នកជួលទាំងអស់
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          បន្ថែមអ្នកជួល
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="អ្នកជួលសរុប" value={stats.total} />
        <StatCard label="កំពុងជួល" value={stats.active} dot="bg-emerald-400" />
        <StatCard
          label="គ្មានកិច្ចសន្យា"
          value={stats.inactive}
          dot="bg-slate-400"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខទូរស័ព្ទ..."
          className="w-full bg-[#0B0F19]/80 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0B0F19]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 text-[13px]">
              <tr>
                <th className="px-6 py-4">ឈ្មោះ</th>
                <th className="px-6 py-4">លេខទូរស័ព្ទ</th>
                <th className="px-6 py-4">បន្ទប់</th>
                <th className="px-6 py-4">ថ្ងៃចូលជួល</th>
                <th className="px-6 py-4">ស្ថានភាព</th>
                <th className="px-6 py-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-500 text-sm"
                  >
                    {search ? "រកមិនឃើញលទ្ធផល" : "គ្មានទិន្នន័យ"}
                  </td>
                </tr>
              ) : (
                filtered.map((tenant) => {
                  const active = getActiveContract(tenant);
                  return (
                    <tr
                      key={tenant.id}
                      className="hover:bg-white/[0.02] group transition-colors"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                            {tenant.full_name?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          <span className="font-medium text-slate-200 text-sm">
                            {tenant.full_name}
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                          <Phone className="w-3.5 h-3.5" />
                          {tenant.phone_number || "—"}
                        </span>
                      </td>

                      {/* Room */}
                      <td className="px-6 py-4">
                        {active?.rooms?.room_number ? (
                          <span className="text-indigo-400 font-medium text-sm">
                            #{active.rooms.room_number}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-sm">—</span>
                        )}
                      </td>

                      {/* Start date */}
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {active?.start_date
                          ? format(new Date(active.start_date), "dd/MM/yyyy")
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <TenantStatusBadge tenant={tenant} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(tenant)}
                            className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="កែប្រែ"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(tenant)}
                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="លុប"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <TenantFormModal
        open={isFormOpen}
        onOpenChange={setFormOpen}
        tenant={selected}
        onSuccess={handleSuccess}
      />
      <DeleteTenantModal
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        tenant={selected}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
