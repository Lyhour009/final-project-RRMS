// One-off demo-data seeder for showing the app with a populated dashboard.
// Safe to re-run: every insert is guarded by a lookup so repeat runs skip
// rows that already exist instead of erroring on unique constraints.
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DEMO_TENANT_PASSWORD = "Tenant#2026Demo";

function must<T>(value: T | null | undefined, label: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Expected ${label} to exist`);
  }
  return value;
}

async function ensureRoom(room: {
  room_number: string;
  room_type: string;
  base_price: number;
  status: "available" | "occupied" | "maintenance";
  floor: number;
  max_occupants: number;
  description: string;
  amenities: string[];
}) {
  const { data: existing } = await supabase
    .from("rooms")
    .select("id")
    .eq("room_number", room.room_number)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("rooms")
    .insert([{ ...room, images: [] }])
    .select("id")
    .single();

  if (error) throw new Error(`room ${room.room_number}: ${error.message}`);
  return must(data, "inserted room").id as string;
}

async function ensureTenant(tenant: {
  full_name: string;
  email: string;
  phone_number: string;
}) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", tenant.email)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: tenant.email,
      password: DEMO_TENANT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: tenant.full_name,
        phone_number: tenant.phone_number,
      },
      app_metadata: { role: "tenant" },
    });

  if (authError) throw new Error(`auth user ${tenant.email}: ${authError.message}`);
  const userId = must(authData.user, "created auth user").id;

  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: userId,
      role: "tenant",
      full_name: tenant.full_name,
      email: tenant.email,
      phone_number: tenant.phone_number,
      id_card_images: [],
    },
  ]);

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    throw new Error(`profile ${tenant.email}: ${profileError.message}`);
  }

  return userId;
}

async function ensureContract(contract: {
  tenant_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  deposit_amount: number;
  status: "active" | "pending" | "expired" | "terminated";
  due_day: number;
}) {
  const { data: existing } = await supabase
    .from("contracts")
    .select("id")
    .eq("tenant_id", contract.tenant_id)
    .eq("room_id", contract.room_id)
    .is("archived_at", null)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("contracts")
    .insert([contract])
    .select("id")
    .single();

  if (error) throw new Error(`contract ${contract.room_id}: ${error.message}`);
  return must(data, "inserted contract").id as string;
}

async function ensureBill(bill: {
  contract_id: string;
  tenant_id: string;
  billing_month: string;
  water_meter_start: number;
  water_meter_end: number;
  elec_meter_start: number;
  elec_meter_end: number;
  room_fee: number;
  water_fee: number;
  elec_fee: number;
  late_fee: number;
  total_amount: number;
  status: "unpaid" | "paid" | "overdue";
  paid_at: string | null;
}) {
  const { data: existing } = await supabase
    .from("bills")
    .select("id")
    .eq("contract_id", bill.contract_id)
    .eq("billing_month", bill.billing_month)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("bills")
    .insert([{ ...bill, currency: "USD" }])
    .select("id")
    .single();

  if (error) throw new Error(`bill ${bill.billing_month}: ${error.message}`);
  return must(data, "inserted bill").id as string;
}

async function ensureApprovedPayment(payment: {
  bill_id: string;
  tenant_id: string;
  amount: number;
  payment_method: "cash" | "aba" | "acleda" | "wing" | "bank_transfer" | "other";
  paid_at: string;
}) {
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("bill_id", payment.bill_id)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("payments")
    .insert([
      {
        ...payment,
        note: "",
        proof_image: null,
        status: "approved",
        reviewed_at: payment.paid_at,
      },
    ])
    .select("id")
    .single();

  if (error) throw new Error(`payment ${payment.bill_id}: ${error.message}`);
  return must(data, "inserted payment").id as string;
}

async function ensurePendingPayment(payment: {
  bill_id: string;
  tenant_id: string;
  amount: number;
  payment_method: "cash" | "aba" | "acleda" | "wing" | "bank_transfer" | "other";
}) {
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("bill_id", payment.bill_id)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { error } = await supabase.from("payments").insert([
    {
      ...payment,
      note: "ទូទាត់តាម ABA",
      proof_image: null,
      status: "pending",
    },
  ]);

  if (error) throw new Error(`pending payment ${payment.bill_id}: ${error.message}`);
}

async function ensureMaintenanceRequest(request: {
  tenant_id: string;
  room_id: string;
  issue_title: string;
  issue_description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "resolved";
}) {
  const { data: existing } = await supabase
    .from("maintenance_requests")
    .select("id")
    .eq("room_id", request.room_id)
    .eq("issue_title", request.issue_title)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("maintenance_requests").insert([request]);
  if (error) throw new Error(`maintenance ${request.issue_title}: ${error.message}`);
}

async function main() {
  console.log("Seeding rooms...");
  const room102 = await ensureRoom({
    room_number: "102",
    room_type: "បន្ទប់គ្រែពីរ",
    base_price: 220,
    status: "occupied",
    floor: 1,
    max_occupants: 2,
    description: "បន្ទប់ទំហំធំ មានបង្អួចធំ ខ្យល់ចេញចូលល្អ",
    amenities: ["ម៉ាស៊ីនត្រជាក់", "ទឹកក្តៅ", "តុ-កៅអី"],
  });
  const room103 = await ensureRoom({
    room_number: "103",
    room_type: "បន្ទប់ VIP",
    base_price: 350,
    status: "occupied",
    floor: 1,
    max_occupants: 2,
    description: "បន្ទប់ស្ងាត់ សម្រាប់គ្រួសារតូច",
    amenities: ["ម៉ាស៊ីនត្រជាក់", "ទូទឹកកក", "WiFi"],
  });
  const room201 = await ensureRoom({
    room_number: "201",
    room_type: "បន្ទប់គ្រែមួយ",
    base_price: 180,
    status: "occupied",
    floor: 2,
    max_occupants: 1,
    description: "បន្ទប់តូច សម្រាប់និស្សិត",
    amenities: ["WiFi", "តុសិក្សា"],
  });
  await ensureRoom({
    room_number: "202",
    room_type: "បន្ទប់គ្រែមួយ",
    base_price: 180,
    status: "available",
    floor: 2,
    max_occupants: 1,
    description: "បន្ទប់ទំនេរ ត្រៀមរួចជាស្រេច",
    amenities: ["WiFi"],
  });
  await ensureRoom({
    room_number: "301",
    room_type: "Studio",
    base_price: 280,
    status: "maintenance",
    floor: 3,
    max_occupants: 2,
    description: "កំពុងជួសជុលប្រព័ន្ធទឹក",
    amenities: ["ម៉ាស៊ីនត្រជាក់"],
  });

  console.log("Seeding tenants...");
  const tenant1 = await ensureTenant({
    full_name: "សុខ សំណាង",
    email: "sok.samnang@demo.rrms.local",
    phone_number: "012345671",
  });
  const tenant2 = await ensureTenant({
    full_name: "ចាន់ សុភា",
    email: "chan.sophea@demo.rrms.local",
    phone_number: "012345672",
  });
  const tenant3 = await ensureTenant({
    full_name: "វណ្ណា គឹមហេង",
    email: "vanna.kimheng@demo.rrms.local",
    phone_number: "012345673",
  });

  console.log("Seeding contracts...");
  const contract1 = await ensureContract({
    tenant_id: tenant1,
    room_id: room102,
    start_date: "2026-06-01",
    end_date: "2027-05-31",
    deposit_amount: 220,
    status: "active",
    due_day: 5,
  });
  const contract2 = await ensureContract({
    tenant_id: tenant2,
    room_id: room103,
    start_date: "2026-04-01",
    end_date: "2027-03-31",
    deposit_amount: 350,
    status: "active",
    due_day: 25,
  });
  const contract3 = await ensureContract({
    tenant_id: tenant3,
    room_id: room201,
    start_date: "2026-07-14",
    end_date: "2027-07-13",
    deposit_amount: 180,
    status: "active",
    due_day: 10,
  });

  console.log("Seeding bills + payments...");

  // Contract 1 (room 102, $220/mo): June paid, July paid, August overdue (due day 5 already passed).
  const c1June = await ensureBill({
    contract_id: contract1,
    tenant_id: tenant1,
    billing_month: "2026-06-01",
    water_meter_start: 100,
    water_meter_end: 112,
    elec_meter_start: 500,
    elec_meter_end: 560,
    room_fee: 220,
    water_fee: 9,
    elec_fee: 18,
    late_fee: 0,
    total_amount: 247,
    status: "paid",
    paid_at: "2026-06-06T03:00:00Z",
  });
  await ensureApprovedPayment({
    bill_id: c1June,
    tenant_id: tenant1,
    amount: 247,
    payment_method: "aba",
    paid_at: "2026-06-06T03:00:00Z",
  });

  const c1July = await ensureBill({
    contract_id: contract1,
    tenant_id: tenant1,
    billing_month: "2026-07-01",
    water_meter_start: 112,
    water_meter_end: 125,
    elec_meter_start: 560,
    elec_meter_end: 625,
    room_fee: 220,
    water_fee: 9.75,
    elec_fee: 19.5,
    late_fee: 0,
    total_amount: 249.25,
    status: "paid",
    paid_at: "2026-07-04T03:00:00Z",
  });
  await ensureApprovedPayment({
    bill_id: c1July,
    tenant_id: tenant1,
    amount: 249.25,
    payment_method: "cash",
    paid_at: "2026-07-04T03:00:00Z",
  });

  await ensureBill({
    contract_id: contract1,
    tenant_id: tenant1,
    billing_month: "2026-08-01",
    water_meter_start: 125,
    water_meter_end: 138,
    elec_meter_start: 625,
    elec_meter_end: 690,
    room_fee: 220,
    water_fee: 9.75,
    elec_fee: 19.5,
    late_fee: 10,
    total_amount: 259.25,
    status: "overdue",
    paid_at: null,
  });

  // Contract 2 (room 103, $350/mo): July paid, August unpaid but not yet
  // due (due_day 25 hasn't passed) — with a pending payment awaiting review.
  const c2July = await ensureBill({
    contract_id: contract2,
    tenant_id: tenant2,
    billing_month: "2026-07-01",
    water_meter_start: 200,
    water_meter_end: 214,
    elec_meter_start: 900,
    elec_meter_end: 980,
    room_fee: 350,
    water_fee: 10.5,
    elec_fee: 24,
    late_fee: 0,
    total_amount: 384.5,
    status: "paid",
    paid_at: "2026-07-20T03:00:00Z",
  });
  await ensureApprovedPayment({
    bill_id: c2July,
    tenant_id: tenant2,
    amount: 384.5,
    payment_method: "acleda",
    paid_at: "2026-07-20T03:00:00Z",
  });

  const c2Aug = await ensureBill({
    contract_id: contract2,
    tenant_id: tenant2,
    billing_month: "2026-08-01",
    water_meter_start: 214,
    water_meter_end: 229,
    elec_meter_start: 980,
    elec_meter_end: 1058,
    room_fee: 350,
    water_fee: 11.25,
    elec_fee: 23.4,
    late_fee: 0,
    total_amount: 384.65,
    status: "unpaid",
    paid_at: null,
  });
  await ensurePendingPayment({
    bill_id: c2Aug,
    tenant_id: tenant2,
    amount: 384.65,
    payment_method: "aba",
  });

  // Contract 3 (room 201, $180/mo): August overdue (due day 10 already passed, no payment yet).
  await ensureBill({
    contract_id: contract3,
    tenant_id: tenant3,
    billing_month: "2026-08-01",
    water_meter_start: 0,
    water_meter_end: 10,
    elec_meter_start: 0,
    elec_meter_end: 45,
    room_fee: 180,
    water_fee: 7.5,
    elec_fee: 13.5,
    late_fee: 10,
    total_amount: 211,
    status: "overdue",
    paid_at: null,
  });

  console.log("Seeding maintenance requests...");
  await ensureMaintenanceRequest({
    tenant_id: tenant3,
    room_id: room201,
    issue_title: "ទ្វារបង្គន់ខូច",
    issue_description: "ជើងទ្វារបង្គន់ដាច់ បិទមិនជិត ត្រូវការជាងមកជួសជុលបន្ទាន់",
    priority: "high",
    status: "pending",
  });
  await ensureMaintenanceRequest({
    tenant_id: tenant1,
    room_id: room102,
    issue_title: "ម៉ាស៊ីនត្រជាក់មិនត្រជាក់",
    issue_description: "ម៉ាស៊ីនត្រជាក់ដំណើរការ ប៉ុន្តែខ្យល់ចេញមិនត្រជាក់",
    priority: "medium",
    status: "in_progress",
  });
  await ensureMaintenanceRequest({
    tenant_id: tenant2,
    room_id: room103,
    issue_title: "អំពូលភ្លើងលោតរលត់",
    issue_description: "អំពូលភ្លើងបន្ទប់គេងលោតរលត់ជាប់ៗគ្នា",
    priority: "low",
    status: "resolved",
  });

  console.log("Done. Demo tenant login password (all demo tenants):", DEMO_TENANT_PASSWORD);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
