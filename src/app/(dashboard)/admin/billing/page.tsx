import { getBills } from "@/actions/bills";
import { getActiveContracts } from "@/actions/contracts";
import { getSettings } from "@/actions/settings";
import { ExportExcelButton } from "@/components/export/export-excel-button";
import { BillTableWrapper } from "@/components/bill/bill-table";
import { ReceiptText } from "lucide-react";
// import { MonthlyBillGenerator } from "@/components/bill/monthly-bill-generator";

export default async function BillsPage() {
  const [bills, contracts, settings] = await Promise.all([
    getBills(),
    getActiveContracts(),
    getSettings(),
  ]);

  const exportBills = bills.map((bill) => ({
    Tenant: bill.profiles?.full_name || "-",
    Room: bill.contracts?.rooms?.room_number || "-",
    BillingMonth: bill.billing_month,
    RoomFee: bill.room_fee,
    WaterFee: bill.water_fee,
    ElectricFee: bill.elec_fee,
    TotalAmount: bill.total_amount,
    Status: bill.status,
    CreatedAt: bill.created_at,
  }));

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-600 dark:text-cyan-300">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              គ្រប់គ្រងវិក្កយបត្រ
            </h1>
            <p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">
              បង្កើត កែប្រែ និងគ្រប់គ្រងវិក្កយបត្ររបស់អ្នកជួល
            </p>
          </div>
        </div>
        <ExportExcelButton data={exportBills} fileName="bills-report" />
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
