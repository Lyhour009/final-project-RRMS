"use client";

import { useState, useMemo, useEffect } from "react";
import { Room } from "@/lib/validations/room";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit2,
  Trash2,
  Plus,
  Home,
  CheckCircle,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import RoomModal from "./room-form-modal";
import RoomDeleteModal from "./room-delete-modal";
import Image from "next/image";

interface RoomTableProps {
  initialRooms: Room[];
}

export default function RoomTable({ initialRooms }: RoomTableProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  useEffect(() => {
    setRooms(initialRooms || []);
  }, [initialRooms]);

  const handleRoomUpserted = (updatedRoom: Room) => {
    setRooms((prevRooms) => {
      const exists = prevRooms.some((r) => r.id === updatedRoom.id);

      if (exists) {
        return prevRooms.map((r) =>
          r.id === updatedRoom.id ? updatedRoom : r,
        );
      }

      return [updatedRoom, ...prevRooms];
    });
  };

  const stats = useMemo(() => {
    const safeRooms = rooms || [];

    return {
      total: safeRooms.length,
      available: safeRooms.filter((r) => r?.status === "available").length,
      occupied: safeRooms.filter((r) => r?.status === "occupied").length,
      maintenance: safeRooms.filter((r) => r?.status === "maintenance").length,
    };
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const safeRooms = rooms || [];
    const sQuery = searchQuery.toLowerCase().trim();

    return safeRooms.filter((room) => {
      if (!room) return false;

      const roomNum = String(room.room_number || "").toLowerCase();
      const roomType = String(room.room_type || "").toLowerCase();

      const matchesSearch =
        roomNum.includes(sQuery) || roomType.includes(sQuery);

      const matchesStatus =
        statusFilter === "all" || room.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchQuery, statusFilter]);

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const handleRoomDeleted = (roomId: string) => {
    setRooms((prevRooms) => prevRooms.filter((r) => r.id !== roomId));
  };

  return (
    <div className="space-y-6 text-white p-1">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">
              បន្ទប់សរុប
            </span>
            <Home size={20} className="text-indigo-400" />
          </div>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">
              ទំនេរ (Available)
            </span>
            <CheckCircle size={20} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-emerald-400">
            {stats.available}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">
              មិនទំនេរ (Occupied)
            </span>
            <UserCheck size={20} className="text-pink-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-pink-400">
            {stats.occupied}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-[#131626] border-zinc-800/80 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">
              ជួសជុល (Maintenance)
            </span>
            <AlertTriangle size={20} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-amber-400">
            {stats.maintenance}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#131626] p-4 rounded-xl border border-zinc-800/60">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="ស្វែងរកតាមលេខបន្ទប់ ឬប្រភេទ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 bg-[#0b0d19] border-zinc-800 text-white placeholder-zinc-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0b0d19] p-1 rounded-lg border border-zinc-800/60 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "all"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ទាំងអស់
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("available")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "available"
                ? "bg-emerald-600 text-white"
                : "text-zinc-400 hover:text-emerald-400"
            }`}
          >
            ទំនេរ
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("occupied")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "occupied"
                ? "bg-pink-600 text-white"
                : "text-zinc-400 hover:text-pink-400"
            }`}
          >
            មិនទំនេរ
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("maintenance")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "maintenance"
                ? "bg-amber-600 text-white"
                : "text-zinc-400 hover:text-amber-400"
            }`}
          >
            ជួសជុល
          </button>
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full sm:w-auto"
        >
          <Plus size={16} /> បន្ថែមបន្ទប់
        </Button>
      </div>

      <div className="bg-[#131626] rounded-xl border border-zinc-800/60 overflow-hidden">
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="sticky top-0 bg-[#131626] z-10 border-b border-zinc-800 text-zinc-400 text-xs uppercase">
              <tr>
                <th className="p-4 bg-[#131626]">រូបភាព</th>
                <th className="p-4 bg-[#131626]">បន្ទប់</th>
                <th className="p-4 bg-[#131626]">ប្រភេទ</th>
                <th className="p-4 bg-[#131626]">ជាន់</th>
                <th className="p-4 bg-[#131626]">តម្លៃ/ខែ</th>
                <th className="p-4 bg-[#131626]">ស្ថានភាព</th>
                <th className="p-4 text-right bg-[#131626]">សកម្មភាព</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/50 text-sm">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    មិនមានទិន្នន័យបន្ទប់ឡើយ។
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr
                    key={room.id}
                    className="hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
                        {room.images?.[0] ? (
                          <img
                            src={room.images[0]}
                            alt="Room"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-zinc-200">
                      #{room.room_number}
                    </td>

                    <td className="p-4 text-zinc-400">{room.room_type}</td>

                    <td className="p-4 text-zinc-400">ជាន់ទី {room.floor}</td>

                    <td className="p-4 text-emerald-400 font-semibold">
                      ${Number(room.base_price).toFixed(2)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          room.status === "available"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : room.status === "occupied"
                              ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {room.status === "available"
                          ? "ទំនេរ"
                          : room.status === "occupied"
                            ? "មិនទំនេរ"
                            : "ជួសជុល"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(room)}
                          className="h-8 w-8 text-zinc-400 hover:text-white"
                        >
                          <Edit2 size={14} />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(room)}
                          className="h-8 w-8 text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={selectedRoom}
        onSuccess={handleRoomUpserted}
      />

      <RoomDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        room={roomToDelete}
        onDeleteSuccess={handleRoomDeleted}
      />
    </div>
  );
}
