import { getRoomsAction } from "@/actions/rooms";
import RoomsClient from "@/components/room/room-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const result = await getRoomsAction();
  const initialRooms = result.success && result.data ? result.data : [];

  return (
    <div className="w-full min-h-screen p-1 md:p-6">
      <RoomsClient initialRooms={initialRooms} />
    </div>
  );
}
