"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, DoorOpen, Search, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import RoomFormModal from "@/components/room/room-form-modal";
import DeleteRoomModal from "@/components/room/room-delete-modal";
import type { Room, RoomStatus } from "@/types/room";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RoomsClientProps {
  initialRooms: Room[];
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  RoomStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  available: {
    label: "ទំនេរ",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  occupied: {
    label: "មិនទំនេរ",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
    dot: "bg-indigo-400",
  },
  maintenance: {
    label: "ជួសជុល",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
};

function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-md border text-xs inline-flex items-center gap-1.5",
        cfg.bg,
        cfg.text,
        cfg.border,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
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
  value: number | string;
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

export default function RoomsClient({ initialRooms }: RoomsClientProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<RoomStatus | "all">("all");

  // Modal state
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Room | null>(null);

  // ─── Stats ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter((r) => r.status === "available").length;
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const maintenance = rooms.filter((r) => r.status === "maintenance").length;
    return { total, available, occupied, maintenance };
  }, [rooms]);

  // ─── Filtered list ───────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rooms.filter((r) => {
      const matchSearch =
        !q ||
        r.room_number?.toLowerCase().includes(q) ||
        r.room_type?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [rooms, search, filterStatus]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAddNew = () => {
    setSelected(null);
    setFormOpen(true);
  };

  const handleEdit = (room: Room) => {
    setSelected(room);
    setFormOpen(true);
  };

  const handleDeleteClick = (room: Room) => {
    setSelected(room);
    setDeleteOpen(true);
  };

  const handleSuccess = (updated: Room, type: "add" | "edit") => {
    if (type === "add") {
      setRooms((prev) => [updated, ...prev]);
    } else {
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
  };

  const handleDeleteSuccess = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 font-khmer">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-indigo-400" />
            គ្រប់គ្រងបន្ទប់
          </h1>
          <p className="text-sm text-slate-400">
            គ្រប់គ្រង និងតាមដានព័ត៌មានបន្ទប់ទាំងអស់
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          បន្ថែមបន្ទប់
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="បន្ទប់សរុប" value={stats.total} />
        <StatCard label="ទំនេរ" value={stats.available} dot="bg-emerald-400" />
        <StatCard label="មិនទំនេរ" value={stats.occupied} dot="bg-indigo-400" />
        <StatCard label="ជួសជុល" value={stats.maintenance} dot="bg-amber-400" />
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមលេខ ឬប្រភេទបន្ទប់..."
            className="w-full bg-[#0B0F19]/80 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-[#0B0F19]/80 border border-white/[0.08] rounded-xl p-1">
          {(["all", "available", "occupied", "maintenance"] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  filterStatus === s
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                {s === "all"
                  ? "ទាំងអស់"
                  : STATUS_CONFIG[s as RoomStatus]?.label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B0F19]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 text-[13px]">
              <tr>
                <th className="px-6 py-4">បន្ទប់</th>
                <th className="px-6 py-4">ប្រភេទ</th>
                <th className="px-6 py-4">ជាន់</th>
                <th className="px-6 py-4">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    តម្លៃ/ខែ
                  </span>
                </th>
                <th className="px-6 py-4">អ្នករស់នៅ</th>
                <th className="px-6 py-4">ស្ថានភាព</th>
                <th className="px-6 py-4">ថ្ងៃបង្កើត</th>
                <th className="px-6 py-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-slate-500 text-sm"
                  >
                    {search || filterStatus !== "all"
                      ? "រកមិនឃើញលទ្ធផល"
                      : "គ្មានទិន្នន័យ"}
                  </td>
                </tr>
              ) : (
                filtered.map((room) => (
                  <tr
                    key={room.id}
                    className="hover:bg-white/[0.02] group transition-colors "
                  >
                    {/* Room number */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                          {room.room_number?.charAt(0).toUpperCase() ?? "?"}
                        </div> */}
                        <span className="font-medium text-slate-200 text-sm">
                          #{room.room_number}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 text-slate-400 text-sm capitalize ">
                      {room.room_type || "—"}
                    </td>

                    {/* Floor */}
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {room.floor != null ? `ជាន់ ${room.floor}` : "—"}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 font-medium text-sm">
                        ${room.base_price?.toFixed(0) ?? "—"}
                      </span>
                    </td>

                    {/* Max occupants */}
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {room.max_occupants != null
                        ? `${room.max_occupants} នាក់`
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <RoomStatusBadge status={room.status} />
                    </td>

                    {/* Created at */}
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {room.created_at
                        ? format(new Date(room.created_at), "dd/MM/yyyy")
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="កែប្រែ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(room)}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="លុប"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <RoomFormModal
        open={isFormOpen}
        onOpenChange={setFormOpen}
        room={selected}
        onSuccess={handleSuccess}
      />
      <DeleteRoomModal
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        room={selected}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
