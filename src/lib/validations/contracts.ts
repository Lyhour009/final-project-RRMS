import * as z from "zod";

export type ContractStatus = "active" | "pending" | "expired" | "terminated";

export interface Contract {
  id: string;
  tenant_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  deposit_amount: number;
  status: ContractStatus;
  due_day: number;
  renewed_from?: string | null;
  created_at: string;

  profiles?: {
    id: string;
    full_name: string;
    phone_number: string;
    email?: string;
  };

  rooms?: {
    id: string;
    room_number: string;
    room_type: string;
    base_price: number;
    floor: number;
  };
}

export const contractSchema = z
  .object({
    tenant_id: z.string().uuid("សូមជ្រើសរើសអ្នកជួល"),
    room_id: z.string().uuid("សូមជ្រើសរើសបន្ទប់"),

    start_date: z.string().min(1, "សូមជ្រើសរើសថ្ងៃចាប់ផ្តើម"),
    end_date: z.string().min(1, "សូមជ្រើសរើសថ្ងៃបញ្ចប់"),

    deposit_amount: z.coerce
      .number({
        message: "សូមបញ្ចូលប្រាក់កក់",
      })
      .min(0, "ប្រាក់កក់ត្រូវធំជាង ឬស្មើ 0"),

    status: z
      .enum(["active", "pending", "expired", "terminated"])
      .refine((val) => val !== undefined, {
        message: "សូមជ្រើសរើសស្ថានភាព",
      }),

    due_day: z.coerce
      .number({
        message: "សូមបញ្ចូលថ្ងៃបង់ប្រាក់",
      })
      .int("ថ្ងៃបង់ប្រាក់ត្រូវតែជាចំនួនគត់")
      .min(1, "ថ្ងៃបង់ប្រាក់ត្រូវចាប់ពីថ្ងៃទី 1")
      .max(31, "ថ្ងៃបង់ប្រាក់មិនអាចលើសថ្ងៃទី 31"),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "ថ្ងៃបញ្ចប់ត្រូវតែក្រោយថ្ងៃចាប់ផ្តើម",
    path: ["end_date"],
  });

export type ContractFormValues = z.infer<typeof contractSchema>;
