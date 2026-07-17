import * as z from "zod";

const MAX_FILE_SIZE = 5000000;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export type UserRole = "admin" | "tenant";

export interface Tenant {
  id: string;
  role: UserRole;
  full_name: string;
  phone_number: string;
  email: string;
  created_at: string;
  id_card_images?: string[];
  id_card_image_paths?: string[];
}

export const tenantSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "សូមបញ្ចូលឈ្មោះអ្នកជួល")
    .max(100, "ឈ្មោះវែងពេក"),

  email: z.string().trim().email("សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ"),

  phone_number: z
    .string()
    .trim()
    .min(1, "សូមបញ្ចូលលេខទូរស័ព្ទ")
    .max(30, "លេខទូរស័ព្ទវែងពេក"),

  password: z.string().optional(),

  id_card_image: z
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

export type TenantFormValues = z.infer<typeof tenantSchema>;
