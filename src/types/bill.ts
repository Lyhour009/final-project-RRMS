import { z } from "zod";

// ─── Database Types ───────────────────────────────────────────────────────────

export type BillStatus = "unpaid" | "paid" | "overdue";

export interface BillContract {
  id: string;
  tenant_id: string;
  room_id: string;
  rooms?: { room_number: string; room_type: string; base_price: number } | null;
}

export interface BillTenant {
  id: string;
  full_name: string;
  phone_number: string;
}

export interface Bill {
  id: string;
  contract_id: string;
  tenant_id: string;
  billing_month: string | null;
  water_meter_start: number | null;
  water_meter_end: number | null;
  elec_meter_start: number | null;
  elec_meter_end: number | null;
  room_fee: number | null;
  water_fee: number | null;
  elec_fee: number | null;
  total_amount: number | null;
  status: BillStatus;
  created_at: string;
  paid_at: string | null;
  contracts?: BillContract | null;
  profiles?: BillTenant | null;
}

// ─── Zod Form Schema ──────────────────────────────────────────────────────────

export const billFormSchema = z
  .object({
    contractId: z.string().min(1, "ត្រូវការជ្រើសរើសកិច្ចសន្យា។"),
    tenantId: z.string(),
    billingMonth: z.string().min(1, "ត្រូវការខែចេញវិក្កយបត្រ។"),
    waterMeterStart: z.string().optional().or(z.literal("")),
    waterMeterEnd: z.string().optional().or(z.literal("")),
    elecMeterStart: z.string().optional().or(z.literal("")),
    elecMeterEnd: z.string().optional().or(z.literal("")),
    roomFee: z
      .string()
      .min(1, "ត្រូវការតម្លៃបន្ទប់។")
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
        message: "តម្លៃបន្ទប់មិនអាចតូចជាង ០ ទេ។",
      }),
    waterFee: z.string().optional().or(z.literal("")),
    elecFee: z.string().optional().or(z.literal("")),
    status: z.enum(["unpaid", "paid", "overdue"]).default("unpaid"),
  })
  .superRefine((data, ctx) => {
    const ws = parseFloat(data.waterMeterStart ?? "");
    const we = parseFloat(data.waterMeterEnd ?? "");
    if (!isNaN(ws) && !isNaN(we) && we < ws) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "លេខចុងក្រោយត្រូវតែធំជាងដើម។",
        path: ["waterMeterEnd"],
      });
    }

    const es = parseFloat(data.elecMeterStart ?? "");
    const ee = parseFloat(data.elecMeterEnd ?? "");
    if (!isNaN(es) && !isNaN(ee) && ee < es) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "លេខចុងក្រោយត្រូវតែធំជាងដើម។",
        path: ["elecMeterEnd"],
      });
    }
  });

export type BillFormValues = z.infer<typeof billFormSchema>;
