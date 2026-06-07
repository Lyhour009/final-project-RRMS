"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Lock,
  Building2,
  Receipt,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  updateProfileAction,
  updatePasswordAction,
  updatePropertySettingsAction,
  updateBillingSettingsAction,
} from "@/actions/settings";
import type {
  ProfileFormValues,
  PasswordFormValues,
  PropertyFormValues,
  BillingFormValues,
} from "@/types/setting";

// You will need to import your schemas to pass them to zodResolver
import {
  profileSchema,
  passwordSchema,
  propertySchema,
  billingSchema,
} from "@/types/setting"; // <-- Update this path if your schemas are somewhere else!

// ─── Props ────────────────────────────────────────────────────────────────────

interface SettingsClientProps {
  initialProfile: ProfileFormValues;
  initialProperty: PropertyFormValues;
  initialBilling: BillingFormValues;
}

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabId = "profile" | "password" | "property" | "billing";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "ព័ត៌មានគណនី", icon: <User className="w-4 h-4" /> },
  {
    id: "password",
    label: "ផ្លាស់ប្តូរ Password",
    icon: <Lock className="w-4 h-4" />,
  },
  {
    id: "property",
    label: "ព័ត៌មានអគារ",
    icon: <Building2 className="w-4 h-4" />,
  },
  { id: "billing", label: "វិក្កយបត្រ", icon: <Receipt className="w-4 h-4" /> },
];

// ─── Status type ──────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "loading" | "success" | "error";

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
      <span className="shrink-0 mt-0.5">⚠</span>
      <span>{message}</span>
    </div>
  );
}

function SaveButton({ status }: { status: SaveStatus }) {
  return (
    <Button
      type="submit"
      disabled={status === "loading"}
      className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[120px]"
    >
      {status === "loading" ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        "រក្សាទុក"
      )}
    </Button>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────

function ProfileSection({
  initialProfile,
}: {
  initialProfile: ProfileFormValues;
}) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [msg, setMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialProfile,
  });

  async function onSubmit(values: ProfileFormValues) {
    setStatus("loading");
    const result = await updateProfileAction(values);
    if (result.success) {
      setStatus("success");
      setMsg("រក្សាទុកព័ត៌មានជោគជ័យ!");
    } else {
      setStatus("error");
      setMsg(result.error ?? "មានបញ្ហាមិនស្គាល់។");
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="ព័ត៌មានគណនី"
        description="កែប្រែឈ្មោះ, លេខទូរស័ព្ទ និងអ៊ីម៉ែលរបស់ Admin"
      />
      <Separator className="bg-white/[0.06]" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">
            ឈ្មោះពេញ <span className="text-rose-400">*</span>
          </label>
          <Input
            {...register("fullName")}
            placeholder="ឈ្មោះ Admin"
            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600"
          />
          {errors.fullName && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">
            លេខទូរស័ព្ទ <span className="text-rose-400">*</span>
          </label>
          <Input
            {...register("phoneNumber")}
            placeholder="012 345 678"
            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600"
          />
          {errors.phoneNumber && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">
            អ៊ីម៉ែល <span className="text-rose-400">*</span>
          </label>
          <Input
            {...register("email")}
            type="email"
            className="bg-white/[0.03] border-white/[0.08] text-white"
          />
          <p className="text-[11px] text-slate-500">
            ប្រសិនបើផ្លាស់ប្តូរ អ្នកនឹងទទួលការផ្ទៀងផ្ទាត់តាមអ៊ីម៉ែល។
          </p>
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {status === "success" && <SuccessBanner message={msg} />}
        {status === "error" && <ErrorBanner message={msg} />}

        <div className="flex justify-end pt-2 border-t border-white/[0.06]">
          <SaveButton status={status} />
        </div>
      </form>
    </div>
  );
}

// ─── Password Section ─────────────────────────────────────────────────────────

function PasswordSection() {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [msg, setMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: PasswordFormValues) {
    setStatus("loading");
    const result = await updatePasswordAction(values);
    if (result.success) {
      setStatus("success");
      setMsg("ផ្លាស់ប្តូរ Password ជោគជ័យ!");
      reset();
    } else {
      setStatus("error");
      setMsg(result.error ?? "មានបញ្ហាមិនស្គាល់។");
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="ផ្លាស់ប្តូរ Password"
        description="ត្រូវប្រាកដថា Password ថ្មីមានភាពខ្លាំងគ្រប់គ្រាន់"
      />
      <Separator className="bg-white/[0.06]" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">
            Password បច្ចុប្បន្ន <span className="text-rose-400">*</span>
          </label>
          <Input
            {...register("currentPassword")}
            type="password"
            className="bg-white/[0.03] border-white/[0.08] text-white"
          />
          {errors.currentPassword && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">
            Password ថ្មី <span className="text-rose-400">*</span>
          </label>
          <Input
            {...register("newPassword")}
            type="password"
            className="bg-white/[0.03] border-white/[0.08] text-white"
          />
          <p className="text-[11px] text-slate-500">យ៉ាងហោចណាស់ ៦ តួអក្សរ</p>
          {errors.newPassword && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">
            បញ្ជាក់ Password ថ្មី <span className="text-rose-400">*</span>
          </label>
          <Input
            {...register("confirmPassword")}
            type="password"
            className="bg-white/[0.03] border-white/[0.08] text-white"
          />
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {status === "success" && <SuccessBanner message={msg} />}
        {status === "error" && <ErrorBanner message={msg} />}

        <div className="flex justify-end pt-2 border-t border-white/[0.06]">
          <Button
            type="submit"
            disabled={status === "loading"}
            className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[120px]"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "ផ្លាស់ប្តូរ"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Property Section ─────────────────────────────────────────────────────────

function PropertySection({
  initialProperty,
}: {
  initialProperty: PropertyFormValues;
}) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [msg, setMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialProperty,
  });

  async function onSubmit(values: PropertyFormValues) {
    setStatus("loading");
    const result = await updatePropertySettingsAction(values);
    if (result.success) {
      setStatus("success");
      setMsg("រក្សាទុកព័ត៌មានអគារជោគជ័យ!");
    } else {
      setStatus("error");
      setMsg(result.error ?? "មានបញ្ហាមិនស្គាល់។");
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="ព័ត៌មានអគារ"
        description="ព័ត៌មាននេះបង្ហាញក្នុងរបាយការណ៍ និងវិក្កយបត្រ"
      />
      <Separator className="bg-white/[0.06]" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">
            ឈ្មោះអគារ/ខុនដូ <span className="text-rose-400">*</span>
          </label>
          <Input
            {...register("buildingName")}
            placeholder="ឧ. ខុនដូ ABC"
            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600"
          />
          {errors.buildingName && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.buildingName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">
            អាសយដ្ឋាន
          </label>
          <Textarea
            {...register("address")}
            rows={2}
            placeholder="ភ្នំពេញ, កម្ពុជា"
            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600 resize-none"
          />
          {errors.address && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              លេខទូរស័ព្ទ
            </label>
            <Input
              {...register("contactPhone")}
              placeholder="023 123 456"
              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600"
            />
            {errors.contactPhone && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.contactPhone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              អ៊ីម៉ែលទំនាក់ទំនង
            </label>
            <Input
              {...register("contactEmail")}
              type="email"
              placeholder="contact@building.com"
              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600"
            />
            {errors.contactEmail && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.contactEmail.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">
            ការពិពណ៌នា
          </label>
          <Textarea
            {...register("description")}
            rows={3}
            placeholder="ការពិពណ៌នាខ្លីៗអំពីអគារ..."
            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600 resize-none"
          />
          {errors.description && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.description.message}
            </p>
          )}
        </div>

        {status === "success" && <SuccessBanner message={msg} />}
        {status === "error" && <ErrorBanner message={msg} />}

        <div className="flex justify-end pt-2 border-t border-white/[0.06]">
          <SaveButton status={status} />
        </div>
      </form>
    </div>
  );
}

// ─── Billing Section ──────────────────────────────────────────────────────────

function BillingSection({
  initialBilling,
}: {
  initialBilling: BillingFormValues;
}) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [msg, setMsg] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: initialBilling,
  });

  const watched = watch();

  async function onSubmit(values: BillingFormValues) {
    setStatus("loading");
    const result = await updateBillingSettingsAction(values);
    if (result.success) {
      setStatus("success");
      setMsg("រក្សាទុកការកំណត់ជោគជ័យ!");
    } else {
      setStatus("error");
      setMsg(result.error ?? "មានបញ្ហាមិនស្គាល់។");
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="ការកំណត់វិក្កយបត្រ"
        description="ថ្លៃទឹក ភ្លើង និងថ្ងៃទីត្រូវបង់ប្រាក់"
      />
      <Separator className="bg-white/[0.06]" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              ថ្លៃទឹក ($/m³)
            </label>
            <Input
              {...register("waterPricePerUnit")}
              type="number"
              step="0.01"
              min={0}
              className="bg-white/[0.03] border-white/[0.08] text-white"
            />
            {errors.waterPricePerUnit && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.waterPricePerUnit.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              ថ្លៃភ្លើង ($/kWh)
            </label>
            <Input
              {...register("elecPricePerUnit")}
              type="number"
              step="0.01"
              min={0}
              className="bg-white/[0.03] border-white/[0.08] text-white"
            />
            {errors.elecPricePerUnit && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.elecPricePerUnit.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              ថ្ងៃទីត្រូវបង់ប្រចាំខែ
            </label>
            <Input
              {...register("defaultDueDay")}
              type="number"
              min={1}
              max={28}
              className="bg-white/[0.03] border-white/[0.08] text-white"
            />
            <p className="text-[11px] text-slate-500">
              ថ្ងៃទី ១ ដល់ ២៨ ប៉ុណ្ណោះ
            </p>
            {errors.defaultDueDay && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.defaultDueDay.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              រូបិយប័ណ្ណ
            </label>
            <Input
              {...register("currency")}
              placeholder="USD"
              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600"
            />
            {errors.currency && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.currency.message}
              </p>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-2">
          <p className="text-xs font-medium text-slate-400">ការគណនាឧទាហរណ៍</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-slate-500">ទឹក ១០ m³</p>
              <p className="text-white font-medium">
                {(Number(watched.waterPricePerUnit || 0) * 10).toFixed(2)}{" "}
                {watched.currency || "USD"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500">ភ្លើង ១០០ kWh</p>
              <p className="text-white font-medium">
                {(Number(watched.elecPricePerUnit || 0) * 100).toFixed(2)}{" "}
                {watched.currency || "USD"}
              </p>
            </div>
          </div>
        </div>

        {status === "success" && <SuccessBanner message={msg} />}
        {status === "error" && <ErrorBanner message={msg} />}

        <div className="flex justify-end pt-2 border-t border-white/[0.06]">
          <SaveButton status={status} />
        </div>
      </form>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SettingsClient({
  initialProfile,
  initialProperty,
  initialBilling,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="space-y-6 font-khmer max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white">ការកំណត់</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          គ្រប់គ្រងព័ត៌មានគណនី និងការកំណត់ប្រព័ន្ធ
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <nav className="lg:w-52 shrink-0 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
              )}
            >
              <span className="flex items-center gap-2.5">
                {tab.icon}
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <div className="flex-1 bg-[#0B0F19]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
          {activeTab === "profile" && (
            <ProfileSection initialProfile={initialProfile} />
          )}
          {activeTab === "password" && <PasswordSection />}
          {activeTab === "property" && (
            <PropertySection initialProperty={initialProperty} />
          )}
          {activeTab === "billing" && (
            <BillingSection initialBilling={initialBilling} />
          )}
        </div>
      </div>
    </div>
  );
}
