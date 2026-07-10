"use client";

import { useMemo, useRef, useState } from "react";
import { Tenant } from "@/lib/validations/tenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatKhmerDate } from "@/lib/utils";
import { useInfiniteReveal } from "@/hooks/use-infinite-reveal";
import {
  Edit2,
  Trash2,
  Plus,
  Users,
  Phone,
  Mail,
  Image as ImageIcon,
  ImageOff,
  Loader2,
} from "lucide-react";
import TenantModal from "./tenant-form-modal";
import TenantDeleteModal from "./tenant-delete-modal";

interface TenantTableProps {
  initialTenants: Tenant[];
}

export function TenantTableWrapper({ initialTenants }: TenantTableProps) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants || []);
  const [prevInitialTenants, setPrevInitialTenants] = useState(initialTenants);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // Resync local state when the server passes a fresh `initialTenants` prop
  // (e.g. after revalidatePath) without waiting for a post-commit effect —
  // see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (initialTenants !== prevInitialTenants) {
    setPrevInitialTenants(initialTenants);
    setTenants(initialTenants || []);
  }

  const handleTenantUpserted = (updatedTenant: Tenant) => {
    setTenants((prevTenants) => {
      const exists = prevTenants.some((t) => t.id === updatedTenant.id);

      if (exists) {
        return prevTenants.map((t) =>
          t.id === updatedTenant.id ? updatedTenant : t,
        );
      }

      return [updatedTenant, ...prevTenants];
    });
  };

  const handleTenantDeleted = (tenantId: string) => {
    setTenants((prevTenants) => prevTenants.filter((t) => t.id !== tenantId));
  };

  const stats = useMemo(() => {
    const safeTenants = tenants || [];

    return {
      total: safeTenants.length,
      withPhone: safeTenants.filter((t) => Boolean(t.phone_number)).length,
      withEmail: safeTenants.filter((t) => Boolean(t.email)).length,
      withIdCard: safeTenants.filter((t) => (t.id_card_images || []).length > 0)
        .length,
    };
  }, [tenants]);

  const filteredTenants = useMemo(() => {
    const safeTenants = tenants || [];
    const query = searchQuery.toLowerCase().trim();

    return safeTenants.filter((tenant) => {
      if (!tenant) return false;

      const fullName = String(tenant.full_name || "").toLowerCase();
      const phone = String(tenant.phone_number || "").toLowerCase();
      const email = String(tenant.email || "").toLowerCase();

      return (
        fullName.includes(query) ||
        phone.includes(query) ||
        email.includes(query)
      );
    });
  }, [tenants, searchQuery]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleItems: visibleTenants, hasMore, sentinelRef } = useInfiniteReveal(
    filteredTenants,
    scrollContainerRef,
  );

  const handleAddNew = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6 text-(--panel-text) p-1">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-(--panel) border-(--panel-border)/80 hover:border-(--panel-border) transition-all">
          <div className="flex items-center justify-between">
            <span className="text-(--panel-text-muted) text-sm font-medium">
              អ្នកជួលសរុប
            </span>
            <Users size={20} className="text-indigo-400" />
          </div>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl border bg-(--panel) border-(--panel-border)/80 hover:border-(--panel-border) transition-all">
          <div className="flex items-center justify-between">
            <span className="text-(--panel-text-muted) text-sm font-medium">
              មានលេខទូរស័ព្ទ
            </span>
            <Phone size={20} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-emerald-400">
            {stats.withPhone}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-(--panel) border-(--panel-border)/80 hover:border-(--panel-border) transition-all">
          <div className="flex items-center justify-between">
            <span className="text-(--panel-text-muted) text-sm font-medium">មានអ៊ីមែល</span>
            <Mail size={20} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-blue-400">
            {stats.withEmail}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-(--panel) border-(--panel-border)/80 hover:border-(--panel-border) transition-all">
          <div className="flex items-center justify-between">
            <span className="text-(--panel-text-muted) text-sm font-medium">
              មានអត្តសញ្ញាណប័ណ្ណ
            </span>
            <ImageIcon size={20} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-amber-400">
            {stats.withIdCard}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-(--panel) p-4 rounded-xl border border-(--panel-border)/60">
        <div className="relative w-full sm:w-96">
          <Input
            placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ ឬអ៊ីមែល..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 bg-(--panel-inset) border-(--panel-border) text-(--panel-text) placeholder-(--panel-text-subtle)"
          />
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full sm:w-auto"
        >
          <Plus size={16} /> បន្ថែមអ្នកជួល
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
                <th className="p-4 bg-(--panel)">រូបភាព</th>
                <th className="p-4 bg-(--panel)">ឈ្មោះ</th>
                <th className="p-4 bg-(--panel)">អ៊ីមែល</th>
                <th className="p-4 bg-(--panel)">លេខទូរស័ព្ទ</th>
                <th className="p-4 bg-(--panel)">តួនាទី</th>
                <th className="p-4 bg-(--panel)">ថ្ងៃបង្កើត</th>
                <th className="p-4 text-right bg-(--panel)">សកម្មភាព</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/50 text-sm">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-(--panel-text-subtle)">
                    មិនមានទិន្នន័យអ្នកជួលឡើយ។
                  </td>
                </tr>
              ) : (
                visibleTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-(--panel-hover)/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-(--panel-border) bg-(--panel-hover)">
                        {tenant.id_card_images?.length ? (
                          <img
                            src={tenant.id_card_images[0]}
                            alt={tenant.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-(--panel-text-subtle)">
                            <ImageOff size={16} />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-(--panel-text)">
                      {tenant.full_name}
                    </td>

                    <td className="p-4 text-(--panel-text-muted)">{tenant.email}</td>

                    <td className="p-4 text-(--panel-text-muted)">{tenant.phone_number}</td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        អ្នកជួល
                      </span>
                    </td>

                    <td className="p-4 text-(--panel-text-muted)">
                      {formatKhmerDate(tenant.created_at, { withDay: true })}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(tenant)}
                          className="h-8 w-8 text-(--panel-text-muted) hover:text-(--panel-text)"
                        >
                          <Edit2 size={14} />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(tenant)}
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
                  <td colSpan={7} className="p-4 text-center">
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

      <TenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenant={selectedTenant}
        onSuccess={handleTenantUpserted}
      />

      <TenantDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        tenant={tenantToDelete}
        onDeleteSuccess={handleTenantDeleted}
      />
    </div>
  );
}
