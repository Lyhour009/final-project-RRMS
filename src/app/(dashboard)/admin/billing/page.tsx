import { getBills } from "@/actions/bills";
import { getActiveContracts } from "@/actions/contracts";
import { getSettings } from "@/actions/settings";
import { ExportExcelButton } from "@/components/export/export-excel-button";
import { BillTableWrapper } from "@/components/bill/bill-table";
// import { MonthlyBillGenerator } from "@/components/bill/monthly-bill-generator";

export default async function BillsPage() {
  const [bills, contracts, settings] = await Promise.all([
    getBills(),
    getActiveContracts(),
    getSettings(),
  ]);

  const exportBills = bills.map((bill: any) => ({
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
    <div className="p-6 space-y-6 text-(--panel-text)">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            🧾 គ្រប់គ្រងវិក្កយបត្រ
          </h1>

          <p className="text-sm text-(--panel-text-muted) mt-1">
            បង្កើត កែប្រែ និងគ្រប់គ្រងវិក្កយបត្ររបស់អ្នកជួល
          </p>
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
