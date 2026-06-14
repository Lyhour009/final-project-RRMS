import * as z from "zod";

const MAX_FILE_SIZE = 5000000;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export type RoomStatus = "available" | "occupied" | "maintenance";

export interface Room {
  id: string;
  room_number: string;
  room_type: string;
  base_price: number;
  status: RoomStatus;
  floor: number;
  max_occupants: number;
  description: string;
  amenities: string[];
  images?: string[];
  created_at: string;
}

export const roomSchema = z.object({
  room_number: z
    .string()
    .trim()
    .min(1, "សូមបញ្ចូលលេខបន្ទប់")
    .max(10, "លេខបន្ទប់វែងពេក"),

  room_type: z
    .string()
    .trim()
    .min(1, "សូមបញ្ចូលប្រភេទបន្ទប់")
    .max(100, "ប្រភេទបន្ទប់វែងពេក"),

  base_price: z.coerce
    .number({
      message: "សូមបញ្ចូលតម្លៃបន្ទប់",
    })
    .min(1, "តម្លៃបន្ទប់ត្រូវធំជាង 0"),

  status: z.enum(["available", "occupied", "maintenance"], {
    message: "សូមជ្រើសរើសស្ថានភាពបន្ទប់",
  }),

  floor: z.coerce
    .number({
      message: "សូមជ្រើសរើសជាន់",
    })
    .int("ជាន់ត្រូវតែជាចំនួនគត់")
    .min(1, "ជាន់ត្រូវតែចាប់ពីលេខ ១")
    .max(20, "ជាន់មិនត្រឹមត្រូវ"),

  max_occupants: z.coerce
    .number({
      message: "សូមបញ្ចូលចំនួនអ្នកស្នាក់នៅ",
    })
    .int("ចំនួនអ្នកស្នាក់នៅត្រូវតែជាចំនួនគត់")
    .min(1, "ចំនួនអ្នកស្នាក់នៅយ៉ាងហោចណាស់ ១ នាក់")
    .max(20, "ចំនួនអ្នកស្នាក់នៅច្រើនពេក"),

  description: z
    .string()
    .max(1000, "ពិពណ៌នាបន្ទប់វែងពេក")
    .optional()
    .default(""),

  amenities: z
    .array(
      z
        .string()
        .trim()
        .min(1, "គ្រឿងបរិក្ខារមិនអាចទទេបាន")
        .max(50, "ឈ្មោះគ្រឿងបរិក្ខារវែងពេក"),
    )
    .max(20, "អាចបន្ថែមគ្រឿងបរិក្ខារបានអតិបរមា ២០ មុខ")
    .default([]),

  image: z
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

export type RoomFormValues = z.infer<typeof roomSchema>;
