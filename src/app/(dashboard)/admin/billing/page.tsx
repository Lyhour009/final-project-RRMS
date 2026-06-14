import { getBills } from "@/actions/bills";
import { getActiveContracts } from "@/actions/contracts";
import { getSettings } from "@/actions/settings";

import { BillTableWrapper } from "@/components/bill/bill-table";
// import { MonthlyBillGenerator } from "@/components/bill/monthly-bill-generator";

export default async function BillsPage() {
  const [bills, contracts, settings] = await Promise.all([
    getBills(),
    getActiveContracts(),
    getSettings(),
  ]);

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          🧾 គ្រប់គ្រងវិក្កយបត្រ
        </h1>

        <p className="text-sm text-zinc-400 mt-1">
          បង្កើត កែប្រែ និងគ្រប់គ្រងវិក្កយបត្ររបស់អ្នកជួល
        </p>
      </div>
      {/* <MonthlyBillGenerator /> */}
      <BillTableWrapper
        initialBills={bills || []}
        contracts={contracts || []}
        settings={settings}
      />
    </div>
  );
}
