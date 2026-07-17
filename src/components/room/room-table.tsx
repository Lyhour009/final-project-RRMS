"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Home,
  ImageOff,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInfiniteReveal } from "@/hooks/use-infinite-reveal";
import { cn } from "@/lib/utils";
import { Room } from "@/lib/validations/room";

import RoomDeleteModal from "./room-delete-modal";
import RoomModal from "./room-form-modal";

interface RoomTableProps {
  initialRooms: Room[];
}

type RoomStatus = "all" | Room["status"];

const STATUS_OPTIONS: {
  value: RoomStatus;
  label: string;
  activeClass: string;
}[] = [
  { value: "all", label: "ទាំងអស់", activeClass: "bg-indigo-600 text-white" },
  { value: "available", label: "ទំនេរ", activeClass: "bg-emerald-600 text-white" },
  { value: "occupied", label: "មិនទំនេរ", activeClass: "bg-blue-600 text-white" },
  { value: "maintenance", label: "ជួសជុល", activeClass: "bg-amber-600 text-white" },
];

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
  tone: "indigo" | "emerald" | "blue" | "amber";
}) {
  const styles = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  }[tone];

  return (
    <div className="group rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5 dark:hover:shadow-black/20 sm:p-5">
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

export default function RoomTable({ initialRooms }: RoomTableProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms || []);
  const [prevInitialRooms, setPrevInitialRooms] = useState(initialRooms);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  if (initialRooms !== prevInitialRooms) {
    setPrevInitialRooms(initialRooms);
    setRooms(initialRooms || []);
  }

  const handleRoomUpserted = (updatedRoom: Room) => {
    setRooms((current) => {
      const exists = current.some((room) => room.id === updatedRoom.id);
      return exists
        ? current.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
        : [updatedRoom, ...current];
    });
  };

  const stats = useMemo(
    () => ({
      total: rooms.length,
      available: rooms.filter((room) => room?.status === "available").length,
      occupied: rooms.filter((room) => room?.status === "occupied").length,
      maintenance: rooms.filter((room) => room?.status === "maintenance").length,
    }),
    [rooms],
  );

  const counts: Record<RoomStatus, number> = {
    all: stats.total,
    available: stats.available,
    occupied: stats.occupied,
    maintenance: stats.maintenance,
  };

  const filteredRooms = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return rooms.filter((room) => {
      const matchesSearch =
        String(room?.room_number || "").toLowerCase().includes(query) ||
        String(room?.room_type || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || room?.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchQuery, statusFilter]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleItems: visibleRooms, hasMore, sentinelRef } = useInfiniteReveal(
    filteredRooms,
    scrollContainerRef,
  );

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };
  const handleAddNew = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <section aria-label="ស្ថិតិបន្ទប់" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="បន្ទប់សរុប" value={stats.total} subtitle="បន្ទប់ទាំងអស់ក្នុងប្រព័ន្ធ" icon={<Home size={20} />} tone="indigo" />
        <StatCard title="បន្ទប់ទំនេរ" value={stats.available} subtitle="អាចទទួលអ្នកជួលថ្មី" icon={<CheckCircle2 size={20} />} tone="emerald" />
        <StatCard title="កំពុងជួល" value={stats.occupied} subtitle="បន្ទប់ដែលមានអ្នកជួល" icon={<UserCheck size={20} />} tone="blue" />
        <StatCard title="កំពុងជួសជុល" value={stats.maintenance} subtitle="មិនទាន់អាចដាក់ជួល" icon={<AlertTriangle size={20} />} tone="amber" />
      </section>

      <section className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--panel-text-subtle)" />
            <Input
              aria-label="ស្វែងរកបន្ទប់"
              placeholder="ស្វែងរកលេខបន្ទប់ ឬប្រភេទបន្ទប់..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 border-(--panel-border) bg-(--panel-inset) pl-10 text-(--panel-text) placeholder:text-(--panel-text-subtle)"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-(--panel-border) bg-(--panel-inset) p-1 sm:w-auto">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition",
                    statusFilter === option.value
                      ? option.activeClass
                      : "text-(--panel-text-muted) hover:bg-(--panel-hover) hover:text-(--panel-text)",
                  )}
                >
                  {option.label}
                  <span className={cn("text-[10px]", statusFilter === option.value ? "text-white/75" : "text-(--panel-text-subtle)")}>
                    {counts[option.value]}
                  </span>
                </button>
              ))}
            </div>

            <Button onClick={handleAddNew} className="h-10 gap-2 rounded-xl bg-indigo-600 px-4 text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500">
              <Plus size={16} /> បន្ថែមបន្ទប់
            </Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel) shadow-sm">
        <div className="flex items-center justify-between border-b border-(--panel-border-subtle) px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-(--panel-text)">បញ្ជីបន្ទប់</h2>
            <p className="mt-0.5 text-xs text-(--panel-text-subtle)">
              បង្ហាញ {filteredRooms.length} ក្នុងចំណោម {stats.total} បន្ទប់
            </p>
          </div>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-(--panel-text-muted) transition hover:bg-(--panel-hover) hover:text-(--panel-text)">
              <RotateCcw className="h-3.5 w-3.5" /> សម្អាតតម្រង
            </button>
          )}
        </div>

        <div ref={scrollContainerRef} className="max-h-[560px] overflow-auto">
          {filteredRooms.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 rounded-2xl bg-indigo-500/10 p-4 text-indigo-500 dark:text-indigo-300">
                {hasActiveFilters ? <Search className="h-7 w-7" /> : <Home className="h-7 w-7" />}
              </div>
              <h3 className="text-base font-semibold text-(--panel-text)">
                {hasActiveFilters ? "រកមិនឃើញបន្ទប់" : "មិនទាន់មានបន្ទប់"}
              </h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-(--panel-text-subtle)">
                {hasActiveFilters
                  ? "សាកល្បងពាក្យស្វែងរកផ្សេង ឬសម្អាតតម្រងដើម្បីមើលបន្ទប់ទាំងអស់។"
                  : "បន្ថែមបន្ទប់ដំបូង ដើម្បីចាប់ផ្តើមគ្រប់គ្រងការជួល និងកិច្ចសន្យា។"}
              </p>
              <Button onClick={hasActiveFilters ? clearFilters : handleAddNew} variant={hasActiveFilters ? "outline" : "default"} className={cn("mt-5 gap-2 rounded-xl", !hasActiveFilters && "bg-indigo-600 text-white hover:bg-indigo-500")}>
                {hasActiveFilters ? <RotateCcw size={16} /> : <Plus size={16} />}
                {hasActiveFilters ? "សម្អាតតម្រង" : "បន្ថែមបន្ទប់ដំបូង"}
              </Button>
            </div>
          ) : (
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="sticky top-0 z-10 border-b border-(--panel-border) bg-(--panel-inset)">
                <tr className="text-xs font-medium text-(--panel-text-muted)">
                  <th className="px-5 py-3">រូបភាព</th><th className="px-5 py-3">បន្ទប់</th><th className="px-5 py-3">ប្រភេទ</th><th className="px-5 py-3">ជាន់</th><th className="px-5 py-3">តម្លៃ/ខែ</th><th className="px-5 py-3">ស្ថានភាព</th><th className="px-5 py-3 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--panel-border-subtle) text-sm">
                {visibleRooms.map((room) => (
                  <tr key={room.id} className="transition-colors hover:bg-(--panel-hover)/55">
                    <td className="px-5 py-3.5">
                      <div className="h-12 w-16 overflow-hidden rounded-xl border border-(--panel-border) bg-(--panel-inset)">
                        {room.images?.[0] ? <img src={room.images[0]} alt={`បន្ទប់ ${room.room_number}`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-(--panel-text-subtle)"><ImageOff size={17} /></div>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><p className="font-semibold text-(--panel-text)">#{room.room_number}</p><p className="mt-0.5 text-xs text-(--panel-text-subtle)">អតិបរមា {room.max_occupants} នាក់</p></td>
                    <td className="px-5 py-3.5 text-(--panel-text-muted)">{room.room_type}</td>
                    <td className="px-5 py-3.5 text-(--panel-text-muted)">ជាន់ទី {room.floor}</td>
                    <td className="px-5 py-3.5 font-semibold text-emerald-600 dark:text-emerald-300">${Number(room.base_price).toFixed(2)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={room.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" aria-label={`កែប្រែបន្ទប់ ${room.room_number}`} onClick={() => { setSelectedRoom(room); setIsModalOpen(true); }} className="h-9 w-9 rounded-lg text-(--panel-text-muted) hover:text-indigo-500"><Edit2 size={15} /></Button>
                        <Button size="icon" variant="ghost" aria-label={`លុបបន្ទប់ ${room.room_number}`} onClick={() => { setRoomToDelete(room); setIsDeleteModalOpen(true); }} className="h-9 w-9 rounded-lg text-(--panel-text-muted) hover:bg-red-500/10 hover:text-red-500"><Trash2 size={15} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {hasMore && <tr><td colSpan={7} className="p-4 text-center"><div ref={sentinelRef} className="flex items-center justify-center gap-2 text-xs text-(--panel-text-subtle)"><Loader2 size={14} className="animate-spin" /> កំពុងផ្ទុកបន្ថែម...</div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <RoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} room={selectedRoom} onSuccess={handleRoomUpserted} />
      <RoomDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} room={roomToDelete} onDeleteSuccess={(roomId) => setRooms((current) => current.filter((room) => room.id !== roomId))} />
    </div>
  );
}

function StatusBadge({ status }: { status: Room["status"] }) {
  const config = {
    available: { label: "ទំនេរ", className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
    occupied: { label: "មិនទំនេរ", className: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
    maintenance: { label: "ជួសជុល", className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
  }[status];

  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", config.className)}><span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />{config.label}</span>;
}
