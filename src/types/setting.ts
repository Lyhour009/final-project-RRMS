import { z } from "zod";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const profileSchema = z.object({
  fullName: z.string().min(1, "ត្រូវការឈ្មោះ។"),
  phoneNumber: z.string().min(1, "ត្រូវការលេខទូរស័ព្ទ។"),
  email: z.string().min(1, "ត្រូវការអ៊ីម៉ែល។").email("អ៊ីម៉ែលមិនត្រឹមត្រូវ។"),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "ត្រូវការ Password បច្ចុប្បន្ន។"),
    newPassword: z
      .string()
      .min(6, "Password ថ្មីត្រូវការយ៉ាងហោចណាស់ ៦ តួអក្សរ។"),
    confirmPassword: z.string().min(1, "ត្រូវបញ្ជាក់ Password ថ្មី។"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password ថ្មីមិនដូចគ្នា។",
    path: ["confirmPassword"],
  });

export const propertySchema = z.object({
  buildingName: z.string().min(1, "ត្រូវការឈ្មោះអគារ។"),
  address: z.string().optional().default(""),
  contactPhone: z.string().optional().default(""),
  contactEmail: z
    .string()
    .optional()
    .refine((v) => !v || /\S+@\S+\.\S+/.test(v), {
      message: "អ៊ីម៉ែលទំនាក់ទំនងមិនត្រឹមត្រូវ។",
    })
    .default(""),
  description: z.string().optional().default(""),
});

export const billingSchema = z.object({
  waterPricePerUnit: z.coerce.number().min(0, "ត្រូវតែ ≥ 0"),
  elecPricePerUnit: z.coerce.number().min(0, "ត្រូវតែ ≥ 0"),
  defaultDueDay: z.coerce
    .number()
    .min(1, "ត្រូវតែ ≥ ១")
    .max(28, "ត្រូវតែ ≤ ២៨"),
  currency: z.string().min(1, "ត្រូវការរូបិយប័ណ្ណ។"),
});

// ─── Inferred Types ──────────────────────────────────────────────────────────

// ─── Inferred Types ──────────────────────────────────────────────────────────

// FormValues naming convention
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
export type PropertyFormValues = z.infer<typeof propertySchema>;
export type BillingFormValues = z.infer<typeof billingSchema>;

// Settings naming convention (Aliases)
export type ProfileSettings = ProfileFormValues;
export type PasswordSettings = PasswordFormValues;
export type PropertySettings = PropertyFormValues;
export type BillingSettings = BillingFormValues;
