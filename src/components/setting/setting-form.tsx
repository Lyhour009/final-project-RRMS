"use client";

import { useActionState, useEffect } from "react";
import { CreditCard, Save, Settings, Zap } from "lucide-react";
import { toast } from "sonner";
import { updateSettings } from "@/actions/settings";
import PaymentQrUpload from "@/components/setting/payment-qr-upload";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-(--panel-text-subtle)">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-lg border border-(--panel-border) bg-(--panel-inset) px-3 text-sm text-(--panel-text) outline-none focus:border-indigo-500/50 placeholder-(--panel-text-subtle)"
      />
    </div>
  );
}

export default function SettingsForm({ settings }: { settings: any }) {
  const [state, formAction, pending] = useActionState(updateSettings, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    }

    if (state && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="p-6 space-y-5 text-(--panel-text)">
      <div>
        <h1 className="text-2xl font-bold">⚙️ ការកំណត់ប្រព័ន្ធ</h1>
        <p className="text-sm text-(--panel-text-subtle) mt-1">
          កំណត់តម្លៃសេវា វិក្កយបត្រ និងព័ត៌មានទូទាត់ប្រាក់
        </p>
      </div>

      <PaymentQrUpload currentQrUrl={settings.payment_qr_url ?? ""} />

      <form
        action={formAction}
        className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5 space-y-5"
      >
        <input type="hidden" name="id" value={settings.id} />

        <div className="flex items-center justify-between border-b border-(--panel-border) pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
              <Settings size={20} />
            </div>

            <div>
              <h2 className="text-base font-semibold">ការកំណត់សំខាន់ៗ</h2>
              <p className="text-xs text-(--panel-text-subtle)">
                ព័ត៌មានទាំងនេះត្រូវបានប្រើក្នុងការគណនាវិក្កយបត្រ
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="hidden md:inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={16} />
            {pending ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
          </button>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-(--panel-text-muted)">
            <Zap size={16} className="text-emerald-400" />
            តម្លៃសេវាកម្ម
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="តម្លៃទឹក"
              name="water_rate"
              type="number"
              defaultValue={settings.water_rate}
            />
            <Field
              label="តម្លៃភ្លើង"
              name="electric_rate"
              type="number"
              defaultValue={settings.electric_rate}
            />
            <Field
              label="ថ្លៃពិន័យបង់យឺត"
              name="late_fee"
              type="number"
              defaultValue={settings.late_fee}
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-(--panel-text-muted)">
            <Settings size={16} className="text-blue-400" />
            ការកំណត់វិក្កយបត្រ
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="ថ្ងៃត្រូវបង់"
              name="monthly_due_day"
              type="number"
              defaultValue={settings.monthly_due_day}
            />
            <Field
              label="រូបិយប័ណ្ណ"
              name="currency"
              defaultValue={settings.currency}
              placeholder="USD"
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-(--panel-text-muted)">
            <CreditCard size={16} className="text-amber-400" />
            ការណែនាំការទូទាត់
          </div>

          <textarea
            name="payment_instruction"
            defaultValue={settings.payment_instruction ?? ""}
            rows={4}
            className="w-full rounded-lg border border-(--panel-border) bg-(--panel-inset) px-3 py-2 text-sm text-(--panel-text) outline-none focus:border-indigo-500/50 placeholder-(--panel-text-subtle)"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="md:hidden h-10 w-full rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "កំពុងរក្សាទុក..." : "រក្សាទុកការកំណត់"}
        </button>
      </form>
    </div>
  );
}
