import { z } from "zod";

// ─── Room Types ──────────────────────────────────────────────────────────────

export type RoomStatus = "available" | "occupied" | "maintenance";
export type RoomType = "single" | "double" | "studio" | "suite" | string;

export interface Room {
  id: string;
  room_number: string;
  room_type: string;
  base_price: number;
  status: RoomStatus;
  floor: number | null;
  max_occupants: number | null;
  description: string | null;
  amenities: string[] | null;
  images: string[] | null;
  created_at: string;
}

// ─── Zod Schema ──────────────────────────────────────────────────────────────

export const roomSchema = z.object({
  roomNumber: z
    .string()
    .min(1, "ត្រូវការលេខបន្ទប់។")
    .max(20, "លេខបន្ទប់វែងពេក។")
    .regex(/^[a-zA-Z0-9\-_]+$/, "លេខបន្ទប់មានតួអក្សរមិនត្រឹមត្រូវ។"),

  roomType: z.string().min(1, "ត្រូវការប្រភេទបន្ទប់។"),

  basePrice: z
    .string()
    .min(1, "ត្រូវការតម្លៃជួល។")
    .refine((val) => !isNaN(parseFloat(val)), "តម្លៃមិនត្រឹមត្រូវ។")
    .refine((val) => parseFloat(val) >= 0, "តម្លៃត្រូវតែមិនអវិជ្ជមាន។"),

  status: z.enum(["available", "occupied", "maintenance"], {
    errorMap: () => ({ message: "ស្ថានភាពមិនត្រឹមត្រូវ។" }),
  }),

  floor: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0),
      "ជាន់ត្រូវតែជាលេខវិជ្ជមាន។",
    ),

  maxOccupants: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 1),
      "ចំនួនអ្នករស់នៅត្រូវតែយ៉ាងតិច ១។",
    ),

  description: z.string().max(500, "ការពណ៌នាវែងពេក។").optional(),

  amenities: z.array(z.string()).optional(),
});

// ─── Inferred form type ───────────────────────────────────────────────────────
export type RoomFormValues = z.infer<typeof roomSchema>;

// ─── Default values ───────────────────────────────────────────────────────────
export const ROOM_FORM_DEFAULTS: RoomFormValues = {
  roomNumber: "",
  roomType: "",
  basePrice: "",
  status: "available",
  floor: "",
  maxOccupants: "",
  description: "",
  amenities: [],
};
