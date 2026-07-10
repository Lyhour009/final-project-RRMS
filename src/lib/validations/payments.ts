import * as z from "zod";

const MAX_FILE_SIZE = 5000000;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export type PaymentStatus = "pending" | "approved" | "rejected";

export type PaymentMethod =
  | "cash"
  | "aba"
  | "acleda"
  | "wing"
  | "bank_transfer"
  | "other";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  aba: "ABA",
  acleda: "ACLEDA",
  wing: "Wing",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  other: "ផ្សេងៗ",
};

export interface Payment {
  id: string;
  bill_id: string;
  tenant_id: string;
  amount: number;
  payment_method: PaymentMethod;
  paid_at: string;
  note?: string | null;
  proof_image?: string | null;
  status: PaymentStatus;
  created_at: string;

  profiles?: {
    id: string;
    full_name: string;
    phone_number: string;
    email?: string;
  };

  bills?: {
    id: string;
    billing_month: string;
    total_amount: number;
    status: "unpaid" | "paid" | "overdue";
    contracts?: {
      id: string;
      rooms?: {
        id: string;
        room_number: string;
        room_type: string;
      };
    };
  };
}

export const paymentSchema = z.object({
  bill_id: z.string().uuid("សូមជ្រើសរើសវិក្កយបត្រ"),

  amount: z.coerce
    .number({
      message: "សូមបញ្ចូលចំនួនទឹកប្រាក់",
    })
    .min(0.01, "ចំនួនទឹកប្រាក់ត្រូវធំជាង 0"),

  payment_method: z.enum(
    ["cash", "aba", "acleda", "wing", "bank_transfer", "other"],
    {
      error: "សូមជ្រើសរើសវិធីបង់ប្រាក់",
    },
  ),

  note: z.string().max(500, "ចំណាំវែងពេក").optional().default(""),

  proof_image: z
    .any()
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "រូបភាពត្រូវតែតូចជាង 5MB",
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "គាំទ្រតែប្រភេទ .jpg, .jpeg, .png និង .webp",
    ),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
