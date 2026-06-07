import { z } from "zod";

// ─── Tenant Types ─────────────────────────────────────────────────────────────

export interface TenantContract {
  id: string;
  status: "active" | "terminated" | string;
  start_date: string | null;
  end_date: string | null;
  deposit_amount?: number;
  rooms?: {
    room_number: string;
    room_type?: string;
    base_price?: number;
  } | null;
}

export interface Tenant {
  id: string;
  full_name: string;
  phone_number: string;
  role: string;
  created_at: string;
  id_card_images?: string[] | null;
  contracts?: TenantContract[];
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const baseSchema = z.object({
  fullName: z.string().min(1, "ត្រូវការឈ្មោះ។").max(100, "ឈ្មោះវែងពេក។"),

  phoneNumber: z
    .string()
    .min(1, "ត្រូវការលេខទូរស័ព្ទ។")
    .regex(/^[0-9\s\+\-\(\)]{6,20}$/, "លេខទូរស័ព្ទមិនត្រឹមត្រូវ។"),
});

const createSchema = baseSchema.extend({
  email: z.string().min(1, "ត្រូវការអ៊ីម៉ែល។").email("អ៊ីម៉ែលមិនត្រឹមត្រូវ។"),
});

const editSchema = baseSchema.extend({
  email: z.string().optional(),
});

export const getTenantSchema = (isEditMode: boolean) =>
  isEditMode ? editSchema : createSchema;

export type TenantFormValues = z.infer<typeof createSchema>;

// ─── Default values ───────────────────────────────────────────────────────────

export const TENANT_FORM_DEFAULTS: TenantFormValues = {
  fullName: "",
  phoneNumber: "",
  email: "",
};
