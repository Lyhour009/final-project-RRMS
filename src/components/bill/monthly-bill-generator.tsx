"use client";

import { useActionState, useEffect } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { generateMonthlyBills } from "@/actions/bill-generator";

type GenerateState = { created: number; skipped: number } | null;

async function generateMonthlyBillsAction(
  _prevState: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  return generateMonthlyBills(formData);
}

export function MonthlyBillGenerator() {
  const [state, formAction, pending] = useActionState(
    generateMonthlyBillsAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    toast.success(
      `បង្កើតវិក្កយបត្រ ${state.created} ថ្មី, រំលង ${state.skipped}`,
    );
  }, [state]);

  return (
    <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
          <CalendarPlus size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-(--panel-text)">
            បង្កើតវិក្កយបត្រប្រចាំខែ
          </h2>
          <p className="text-xs text-(--panel-text-subtle)">
            បង្កើតវិក្កយបត្រសម្រាប់កិច្ចសន្យាសកម្មទាំងអស់
          </p>
        </div>
      </div>

      <form
        action={formAction}
        className="flex flex-col md:flex-row md:items-end gap-3"
      >
        <div className="w-fit">
          <label className="text-sm text-(--panel-text-muted)">ជ្រើសរើសខែ</label>
          <input
            type="month"
            name="billing_month"
            required
            className="mt-1 h-10 w-full rounded-lg border border-(--panel-border) bg-(--panel-inset) px-3 text-sm text-(--panel-text)"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-lg bg-indigo-600 px-6 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 md:mb-0"
        >
          {pending ? "កំពុងបង្កើត..." : "បង្កើតវិក្កយបត្រ"}
        </button>
      </form>

      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 w-fit">
        <p className="text-xs text-amber-300 leading-relaxed">
          ប្រព័ន្ធនឹងបង្កើតវិក្កយបត្រតែម្ដងសម្រាប់បន្ទប់ដែលមានកិច្ចសន្យាសកម្ម។
          ប្រសិនបើខែនោះមានវិក្កយបត្ររួចហើយ ប្រព័ន្ធនឹងរំលង។
        </p>
      </div>
    </div>
  );
}
