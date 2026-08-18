"use client";

import { useActionState, useEffect, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Loader2,
  Save,
  Settings,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { updateSettings, type getSettings } from "@/actions/settings";
import PaymentQrUpload from "@/components/setting/payment-qr-upload";

type SettingsData = NonNullable<Awaited<ReturnType<typeof getSettings>>>;

function Field({ label, hint, name, defaultValue, type = "text", placeholder, step, min, max, suffix }: {
  label: string;
  hint?: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
  step?: string;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-(--panel-text-muted)">{label}</label>
      <div className="relative">
        <input id={name} name={name} type={type} step={step} min={min} max={max} readOnly={name === "currency"} defaultValue={name === "currency" ? "USD" : defaultValue ?? ""} placeholder={placeholder} className="h-11 w-full rounded-xl border border-(--panel-border) bg-(--panel) px-3 text-sm text-(--panel-text) outline-none transition placeholder:text-(--panel-text-subtle) read-only:cursor-not-allowed read-only:bg-(--panel-inset) read-only:text-(--panel-text-muted) focus:border-indigo-500/50 focus:ring-3 focus:ring-indigo-500/10" />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-(--panel-text-subtle)">{suffix}</span>}
      </div>
      {hint && <p className="text-xs leading-5 text-(--panel-text-subtle)">{hint}</p>}
    </div>
  );
}

function Section({ icon, title, description, children, tone }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  tone: string;
}) {
  return (
    <section className="rounded-2xl border border-(--panel-border-subtle) bg-(--panel-inset)/55 p-4 sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className={`rounded-xl p-2.5 ${tone}`}>{icon}</div>
        <div><h3 className="text-sm font-semibold text-(--panel-text)">{title}</h3><p className="mt-1 text-xs leading-5 text-(--panel-text-subtle)">{description}</p></div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsForm({ settings }: { settings: SettingsData }) {
  const [state, formAction, pending] = useActionState(updateSettings, null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    let resetTimer: number | undefined;

    if (state?.success) {
      toast.success(state.message);
      resetTimer = window.setTimeout(() => setIsDirty(false), 0);
    } else if (state && !state.success) {
      toast.error(state.message);
    }

    return () => {
      if (resetTimer) window.clearTimeout(resetTimer);
    };
  }, [state]);

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-300"><Settings className="h-6 w-6" /></div>
        <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">ការកំណត់ប្រព័ន្ធ</h1><p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">កំណត់តម្លៃសេវា វិក្កយបត្រ និងព័ត៌មានទូទាត់ប្រាក់</p></div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <PaymentQrUpload currentQrUrl={settings.payment_qr_url ?? ""} />

        <form action={formAction} onChange={() => setIsDirty(true)} className="overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel) shadow-sm">
          <input type="hidden" name="id" value={settings.id} />
          <div className="flex items-center justify-between gap-4 border-b border-(--panel-border-subtle) px-5 py-4 sm:px-6">
            <div><h2 className="text-sm font-semibold">ការកំណត់សំខាន់ៗ</h2><p className="mt-1 text-xs text-(--panel-text-subtle)">ប្រើសម្រាប់គណនាវិក្កយបត្រ និងបង្ហាញទៅអ្នកជួល</p></div>
            <button type="submit" disabled={pending || !isDirty} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-45">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{pending ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </button>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <Section icon={<Zap size={18} />} title="តម្លៃសេវាកម្ម" description="តម្លៃក្នុងមួយឯកតាសម្រាប់គណនាវិក្កយបត្រប្រចាំខែ" tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="តម្លៃទឹក" hint="ក្នុងមួយឯកតាប្រើប្រាស់" name="water_rate" type="number" step="0.01" min={0} defaultValue={settings.water_rate} suffix={settings.currency || "USD"} />
                <Field label="តម្លៃភ្លើង" hint="ក្នុងមួយឯកតាប្រើប្រាស់" name="electric_rate" type="number" step="0.01" min={0} defaultValue={settings.electric_rate} suffix={settings.currency || "USD"} />
                <Field label="ថ្លៃពិន័យបង់យឺត" hint="បន្ថែមពេលហួសកាលកំណត់" name="late_fee" type="number" step="0.01" min={0} defaultValue={settings.late_fee} suffix={settings.currency || "USD"} />
              </div>
            </Section>

            <Section icon={<CalendarDays size={18} />} title="ការកំណត់វិក្កយបត្រ" description="កាលកំណត់បង់ប្រាក់ និងរូបិយប័ណ្ណលំនាំដើម" tone="bg-blue-500/10 text-blue-600 dark:text-blue-300">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="ថ្ងៃត្រូវបង់ប្រចាំខែ" hint="ចន្លោះថ្ងៃទី 1 ដល់ 31" name="monthly_due_day" type="number" min={1} max={31} defaultValue={settings.monthly_due_day} suffix="ថ្ងៃ" />
                <Field label="រូបិយប័ណ្ណ" hint="ឧទាហរណ៍ USD ឬ KHR" name="currency" defaultValue={settings.currency} placeholder="USD" />
              </div>
            </Section>

            <Section icon={<CreditCard size={18} />} title="ការណែនាំការទូទាត់" description="សារនេះនឹងបង្ហាញជាមួយ QR Code ទៅអ្នកជួល" tone="bg-amber-500/10 text-amber-600 dark:text-amber-300">
              <label htmlFor="payment_instruction" className="sr-only">ការណែនាំការទូទាត់</label>
              <textarea id="payment_instruction" name="payment_instruction" defaultValue={settings.payment_instruction ?? ""} rows={5} placeholder="ឧទាហរណ៍៖ សូមសរសេរលេខបន្ទប់ក្នុងចំណាំការផ្ទេរប្រាក់..." className="w-full resize-y rounded-xl border border-(--panel-border) bg-(--panel) px-3 py-3 text-sm leading-6 text-(--panel-text) outline-none transition placeholder:text-(--panel-text-subtle) focus:border-indigo-500/50 focus:ring-3 focus:ring-indigo-500/10" />
            </Section>
          </div>
        </form>
      </div>
    </div>
  );
}
