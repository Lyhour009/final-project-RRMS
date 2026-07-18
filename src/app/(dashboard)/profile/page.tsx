import {
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  IdCard,
  ImageOff,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { getMyProfile } from "@/actions/profiles";
import { formatKhmerDate } from "@/lib/utils";

function InfoItem({ icon, label, value, hint }: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-(--panel-border-subtle) bg-(--panel-inset)/55 p-4">
      <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-300">{icon}</div>
      <div className="min-w-0"><p className="text-xs font-medium text-(--panel-text-subtle)">{label}</p><div className="mt-1 break-words text-sm font-semibold text-(--panel-text)">{value}</div>{hint && <p className="mt-1 text-xs text-(--panel-text-subtle)">{hint}</p>}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${isAdmin ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isAdmin ? "bg-indigo-500" : "bg-emerald-500"}`} />
      {isAdmin ? "អ្នកគ្រប់គ្រង" : "អ្នកជួល"}
    </span>
  );
}

export default async function ProfilePage() {
  const profile = await getMyProfile();
  const initials = profile.full_name?.trim().slice(0, 2).toUpperCase() || profile.email?.slice(0, 2).toUpperCase() || "--";
  const hasIdImages = Boolean(profile.id_card_images?.length);

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-6 p-4 text-(--panel-text) sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-600 dark:text-violet-300"><User className="h-6 w-6" /></div>
        <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">គណនីរបស់ខ្ញុំ</h1><p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">ព័ត៌មានគណនី តួនាទី និងអត្តសញ្ញាណរបស់អ្នក</p></div>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel) p-5 shadow-sm sm:p-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-indigo-500/10 to-transparent" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-600/20">{initials}</div>
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold tracking-tight">{profile.full_name || "មិនទាន់មានឈ្មោះ"}</h2><BadgeCheck className="h-5 w-5 text-blue-500" /></div><a href={`mailto:${profile.email}`} className="mt-1 inline-block text-sm text-(--panel-text-muted) transition hover:text-indigo-500">{profile.email || "-"}</a><div className="mt-3 flex flex-wrap gap-2"><RoleBadge role={profile.role} /><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />គណនីសកម្ម</span></div></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-(--panel-border-subtle) bg-(--panel-inset)/65 px-4 py-3"><ShieldCheck className="h-5 w-5 text-indigo-500" /><div><p className="text-xs text-(--panel-text-subtle)">សិទ្ធិប្រើប្រាស់</p><p className="mt-0.5 text-sm font-semibold">{profile.role === "admin" ? "គ្រប់គ្រងប្រព័ន្ធ" : "គណនីអ្នកជួល"}</p></div></div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5 shadow-sm sm:p-6">
          <div className="mb-5"><h2 className="text-base font-semibold">ព័ត៌មានគណនី</h2><p className="mt-1 text-xs text-(--panel-text-subtle)">ព័ត៌មានដែលប្រើសម្រាប់ការទំនាក់ទំនង និងកំណត់សិទ្ធិ</p></div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoItem icon={<User size={16} />} label="ឈ្មោះពេញ" value={profile.full_name || "មិនទាន់បានបញ្ចូល"} />
            <InfoItem icon={<Mail size={16} />} label="អ៊ីមែល" value={profile.email ? <a href={`mailto:${profile.email}`} className="transition hover:text-indigo-500">{profile.email}</a> : "មិនទាន់បានបញ្ចូល"} hint="ប្រើសម្រាប់ចូលគណនី" />
            <InfoItem icon={<Phone size={16} />} label="លេខទូរស័ព្ទ" value={profile.phone_number ? <a href={`tel:${profile.phone_number}`} className="transition hover:text-indigo-500">{profile.phone_number}</a> : "មិនទាន់បានបញ្ចូល"} />
            <InfoItem icon={<BadgeCheck size={16} />} label="តួនាទី" value={<RoleBadge role={profile.role} />} />
            <InfoItem icon={<CalendarDays size={16} />} label="ថ្ងៃបង្កើតគណនី" value={formatKhmerDate(profile.created_at, { withDay: true })} />
          </div>
        </section>

        <section className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3"><div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-300"><IdCard className="h-5 w-5" /></div><div><h2 className="text-base font-semibold">អត្តសញ្ញាណប័ណ្ណ</h2><p className="mt-1 text-xs text-(--panel-text-subtle)">ឯកសារផ្ទៀងផ្ទាត់អត្តសញ្ញាណ</p></div></div>
          {!hasIdImages ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-(--panel-border) bg-(--panel-inset)/55 px-6 text-center"><div className="mb-3 rounded-xl bg-violet-500/10 p-3 text-violet-500"><ImageOff className="h-5 w-5" /></div><p className="text-sm font-medium">មិនទាន់មានរូបភាព</p><p className="mt-1 max-w-xs text-xs leading-5 text-(--panel-text-subtle)">{profile.role === "admin" ? "គណនីអ្នកគ្រប់គ្រងមិនតម្រូវឱ្យមានអត្តសញ្ញាណប័ណ្ណទេ។" : "សូមទាក់ទងអ្នកគ្រប់គ្រងដើម្បីបន្ថែមឯកសារ។"}</p></div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {profile.id_card_images.map((image: string, index: number) => <a key={index} href={image} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel-inset)"><img src={image} alt={`អត្តសញ្ញាណប័ណ្ណ ${index + 1}`} className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02]" /><div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 transition group-hover:bg-slate-950/35"><span className="flex translate-y-2 items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-slate-900 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100"><ExternalLink className="h-3.5 w-3.5" /> បើករូបភាព</span></div></a>)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
