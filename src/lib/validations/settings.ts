import { z } from "zod";

export const settingsSchema = z.object({
  water_rate: z.coerce.number().min(0),
  electric_rate: z.coerce.number().min(0),
  late_fee: z.coerce.number().min(0),
  monthly_due_day: z.coerce.number().min(1).max(31),
  currency: z.literal("USD"),
  payment_instruction: z.string().optional().nullable(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
