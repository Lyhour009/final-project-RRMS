import { getRooms } from "@/actions/rooms";
import RoomTable from "@/components/room/room-table";

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="p-6 space-y-6 text-(--panel-text)">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          🏢 គ្រប់គ្រងបន្ទប់ជួល
        </h1>

        <p className="text-sm text-(--panel-text-muted) mt-1">
          ទំព័រចាត់ចែងទិន្នន័យបន្ទប់ បន្ថែម កែប្រែ និងលុប
        </p>
      </div>

      <RoomTable initialRooms={rooms || []} />
    </div>
  );
}
