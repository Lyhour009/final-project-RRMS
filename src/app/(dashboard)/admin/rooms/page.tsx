import { getRooms } from "@/actions/rooms";
import RoomTable from "@/components/room/room-table";
import { Building2 } from "lucide-react";

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-300">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            គ្រប់គ្រងបន្ទប់ជួល
          </h1>
          <p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">
          ទំព័រចាត់ចែងទិន្នន័យបន្ទប់ បន្ថែម កែប្រែ និងលុប
          </p>
        </div>
      </div>

      <RoomTable initialRooms={rooms || []} />
    </div>
  );
}
