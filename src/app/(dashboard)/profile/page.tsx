import {
  BadgeCheck,
  CalendarDays,
  IdCard,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { getMyProfile } from "@/actions/profiles";

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-(--panel-border) bg-(--panel-inset) p-4">
      <div className="flex items-center gap-2 text-(--panel-text-subtle) text-xs mb-2">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-(--panel-text)">{value}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        isAdmin
          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      }`}
    >
      {isAdmin ? "Admin" : "Tenant"}
    </span>
  );
}

export default async function ProfilePage() {
  const profile = await getMyProfile();

  return (
    <div className="p-6 space-y-6 text-(--panel-text)">
      <div>
        <h1 className="text-2xl font-bold">👤 គណនីរបស់ខ្ញុំ</h1>
        <p className="text-sm text-(--panel-text-subtle) mt-1">
          ព័ត៌មានគណនី និងអត្តសញ្ញាណរបស់អ្នក
        </p>
      </div>

      <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
        <div className="flex items-center gap-4 border-b border-(--panel-border) pb-5">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-bold">
            {profile.full_name?.slice(0, 2).toUpperCase() || "US"}
          </div>

          <div>
            <h2 className="text-xl font-bold">{profile.full_name || "User"}</h2>
            <p className="text-sm text-(--panel-text-subtle)">{profile.email}</p>
            <div className="mt-2">
              <RoleBadge role={profile.role} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
          <InfoCard
            icon={<User size={14} />}
            label="ឈ្មោះពេញ"
            value={profile.full_name || "-"}
          />

          <InfoCard
            icon={<Mail size={14} />}
            label="អ៊ីមែល"
            value={profile.email || "-"}
          />

          <InfoCard
            icon={<Phone size={14} />}
            label="លេខទូរស័ព្ទ"
            value={profile.phone_number || "-"}
          />

          <InfoCard
            icon={<BadgeCheck size={14} />}
            label="តួនាទី"
            value={<RoleBadge role={profile.role} />}
          />

          <InfoCard
            icon={<CalendarDays size={14} />}
            label="ថ្ងៃបង្កើត"
            value={profile.created_at?.slice(0, 10) || "-"}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
        <div className="mb-4 flex items-center gap-2">
          <IdCard size={20} className="text-indigo-400" />
          <h2 className="text-lg font-semibold">រូបភាពអត្តសញ្ញាណប័ណ្ណ</h2>
        </div>

        {!profile.id_card_images || profile.id_card_images.length === 0 ? (
          <div className="rounded-xl border border-(--panel-border) bg-(--panel-inset) p-8 text-center text-sm text-(--panel-text-subtle)">
            មិនទាន់មានរូបភាពអត្តសញ្ញាណប័ណ្ណ
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {profile.id_card_images.map((image: string, index: number) => (
              <a
                key={index}
                href={image}
                target="_blank"
                className="block rounded-xl border border-(--panel-border) bg-(--panel-inset) overflow-hidden"
              >
                <img
                  src={image}
                  alt={`ID Card ${index + 1}`}
                  className="h-56 w-full object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
