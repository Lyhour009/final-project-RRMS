import { CalendarPlus } from "lucide-react";
import { generateMonthlyBills } from "@/actions/bill-generator";

export function MonthlyBillGenerator() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
          <CalendarPlus size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">
            បង្កើតវិក្កយបត្រប្រចាំខែ
          </h2>
          <p className="text-xs text-zinc-500">
            បង្កើតវិក្កយបត្រសម្រាប់កិច្ចសន្យាសកម្មទាំងអស់
          </p>
        </div>
      </div>

      <form
        action={generateMonthlyBills}
        className="flex flex-col md:flex-row md:items-end gap-3"
      >
        <div className="w-fit">
          <label className="text-sm text-zinc-400">ជ្រើសរើសខែ</label>
          <input
            type="month"
            name="billing_month"
            required
            className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-[#0b0d19] px-3 text-sm text-white"
          />
        </div>

        <button
          type="submit"
          className="h-10 rounded-lg bg-indigo-600 px-6 text-sm font-medium text-white hover:bg-indigo-700 md:mb-0"
        >
          បង្កើតវិក្កយបត្រ
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
