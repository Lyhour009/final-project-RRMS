import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Building2,
  BedDouble,
  Users,
  DollarSign,
  Layers,
  Wifi,
  AlertCircle,
  ImageOff,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/ui";

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getRoomData() {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { data: contract } = await supabase
    .from("contracts")
    .select(
      `
      id,
      status,
      start_date,
      end_date,
      deposit_amount,
      due_day,
      renewed_from,
      rooms (
        id,
        room_number,
        room_type,
        base_price,
        status,
        floor,
        max_occupants,
        description,
        amenities,
        images
      )
    `,
    )
    .eq("tenant_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return { contract };
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.05] last:border-0">
      <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <span className="text-xs text-slate-500 w-32 shrink-0">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TenantRoomPage() {
  const { contract } = await getRoomData();
  const room = contract?.rooms as any;

  // ── No active contract ──
  if (!contract || !room) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold text-white mb-6">បន្ទប់របស់ខ្ញុំ</h1>
        <div className="bg-slate-900/60 border border-white/[0.07] rounded-xl p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/[0.08] flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-sm text-slate-400">មិនមានបន្ទប់សកម្ម</p>
          <p className="text-xs text-slate-600">
            ទាក់ទងម្ចាស់បន្ទប់ដើម្បីបង្កើតកិច្ចសន្យា
          </p>
        </div>
      </div>
    );
  }

  const amenities: string[] = Array.isArray(room.amenities)
    ? room.amenities
    : [];
  const images: string[] = Array.isArray(room.images) ? room.images : [];

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      {/* ── Page title ── */}
      <div>
        <h1 className="text-xl font-bold text-white">បន្ទប់របស់ខ្ញុំ</h1>
        <p className="text-slate-500 text-sm mt-1">
          ព័ត៌មានលម្អិតអំពីបន្ទប់ និងកិច្ចសន្យា
        </p>
      </div>

      {/* ── Room header card ── */}
      <div className="bg-slate-900/60 border border-white/[0.07] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
          <BedDouble className="w-7 h-7 text-indigo-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-bold text-white">
              បន្ទប់ #{room.room_number}
            </h2>
            <StatusBadge status={room.status} />
          </div>
          <p className="text-slate-500 text-sm mt-1 capitalize">
            {room.room_type} room
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-bold text-white">
            ${room.base_price}
          </div>
          <div className="text-xs text-slate-500">ក្នុងមួយខែ</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Room details ── */}
        <div className="bg-slate-900/60 border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-white">
              ព័ត៌មានបន្ទប់
            </span>
          </div>
          <div className="px-5 py-2">
            <InfoRow
              icon={BedDouble}
              label="លេខបន្ទប់"
              value={`#${room.room_number}`}
            />
            <InfoRow icon={Layers} label="ជាន់" value={room.floor ?? "—"} />
            <InfoRow
              icon={Users}
              label="ចំនួនអ្នករស់នៅ"
              value={room.max_occupants ? `${room.max_occupants} នាក់` : "—"}
            />
            <InfoRow
              icon={DollarSign}
              label="តម្លៃជួល"
              value={`$${room.base_price}/ខែ`}
            />
            {room.description && (
              <div className="py-3 border-b border-white/[0.05]">
                <p className="text-xs text-slate-500 mb-1.5">ការពណ៌នា</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {room.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Contract details ── */}
        <div className="bg-slate-900/60 border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-white">
              ព័ត៌មានកិច្ចសន្យា
            </span>
          </div>
          <div className="px-5 py-2">
            <InfoRow
              icon={CalendarDays}
              label="ចាប់ផ្តើម"
              value={contract.start_date ?? "—"}
            />
            <InfoRow
              icon={CalendarDays}
              label="ផុតកំណត់"
              value={contract.end_date ?? "—"}
            />
            <InfoRow
              icon={CalendarDays}
              label="ថ្ងៃ Due"
              value={contract.due_day ? `ថ្ងៃទី ${contract.due_day}` : "—"}
            />
            <InfoRow
              icon={DollarSign}
              label="ប្រាក់តម្កល់"
              value={`$${contract.deposit_amount}`}
            />
            <InfoRow
              icon={BadgeCheck}
              label="ស្ថានភាព"
              value={<StatusBadge status={contract.status} />}
            />
          </div>
        </div>
      </div>

      {/* ── Amenities ── */}
      {amenities.length > 0 && (
        <div className="bg-slate-900/60 border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <Wifi className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-white">សម្ភារៈ</span>
          </div>
          <div className="px-5 py-4 flex flex-wrap gap-2">
            {amenities.map((a) => (
              <span
                key={a}
                className="inline-flex items-center text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-medium"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Images ── */}
      <div className="bg-slate-900/60 border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <ImageOff className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-white">រូបភាពបន្ទប់</span>
          <span className="text-xs text-slate-600 ml-1">({images.length})</span>
        </div>

        {images.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-600">
            <ImageOff className="w-8 h-8" />
            <p className="text-xs">មិនមានរូបភាព</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-video rounded-lg overflow-hidden border border-white/[0.08] hover:border-indigo-500/30 transition-all"
              >
                <img
                  src={url}
                  alt={`room-${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
