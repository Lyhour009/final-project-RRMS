import { z } from "zod";

// ─── Core Database/Entity Interfaces ─────────────────────────────────────────
export type ContractStatus = "active" | "terminated" | "expired" | string;

export interface ContractTenant {
  id: string;
  full_name: string;
  phone_number: string;
}

export interface ContractRoom {
  id: string;
  room_number: string;
  room_type: string;
  base_price: number;
}

export interface Contract {
  id: string;
  tenant_id: string;
  room_id: string;
  start_date: string | null;
  end_date: string | null;
  deposit_amount: number | null;
  status: ContractStatus;
  created_at: string;
  due_day: number | null;
  renewed_from: string | null;
  profiles?: ContractTenant | null;
  rooms?: ContractRoom | null;
}

// ─── Zod Validation Schema ────────────────────────────────────────────────────
export const contractFormSchema = z.object({
  tenantId: z.string().min(1, { message: "ត្រូវការជ្រើសរើសអ្នកជួល។" }),
  roomId: z.string().min(1, { message: "ត្រូវការជ្រើសរើសបន្ទប់។" }),
  startDate: z.string().min(1, { message: "ត្រូវការថ្ងៃចូលជួល។" }),
  endDate: z.string().optional().or(z.literal("")),
  depositAmount: z.string().optional().or(z.literal("")),
  status: z.string().default("active"),
  dueDay: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = parseInt(val, 10);
        return num >= 1 && num <= 31;
      },
      { message: "ត្រូវតែជាលេខ 1-31។" },
    ),
});

export type ContractFormValues = z.infer<typeof contractFormSchema>;
