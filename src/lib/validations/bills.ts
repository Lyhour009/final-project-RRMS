import * as z from "zod";

export type BillStatus = "unpaid" | "paid" | "overdue";

export interface Bill {
  id: string;
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
  total_amount: number;

  status: BillStatus;
  created_at: string;
  paid_at?: string | null;

  profiles?: {
    id: string;
    full_name: string;
    phone_number: string;
    email?: string;
  };

  contracts?: {
    id: string;
    tenant_id: string;
    room_id: string;
    start_date: string;
    end_date: string;
    due_day: number;
    rooms?: {
      id: string;
      room_number: string;
      room_type: string;
      base_price: number;
      floor: number;
    };
  };
}

export const billSchema = z
  .object({
    contract_id: z.string().uuid("សូមជ្រើសរើសកិច្ចសន្យា"),

    billing_month: z.string().min(1, "សូមជ្រើសរើសខែវិក្កយបត្រ"),

    water_meter_start: z.coerce.number().min(0, "កុងទ័រទឹកដើមមិនអាចតិចជាង 0"),

    water_meter_end: z.coerce.number().min(0, "កុងទ័រទឹកចុងមិនអាចតិចជាង 0"),

    elec_meter_start: z.coerce.number().min(0, "កុងទ័រភ្លើងដើមមិនអាចតិចជាង 0"),

    elec_meter_end: z.coerce.number().min(0, "កុងទ័រភ្លើងចុងមិនអាចតិចជាង 0"),

    status: z.enum(["unpaid", "paid", "overdue"]),
  })
  .refine((data) => data.water_meter_end >= data.water_meter_start, {
    message: "កុងទ័រទឹកចុងត្រូវធំជាង ឬស្មើកុងទ័រទឹកដើម",
    path: ["water_meter_end"],
  })
  .refine((data) => data.elec_meter_end >= data.elec_meter_start, {
    message: "កុងទ័រភ្លើងចុងត្រូវធំជាង ឬស្មើកុងទ័រភ្លើងដើម",
    path: ["elec_meter_end"],
  });

export type BillFormValues = z.infer<typeof billSchema>;
