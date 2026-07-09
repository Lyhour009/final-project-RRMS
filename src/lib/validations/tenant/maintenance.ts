import * as z from "zod";

export const maintenanceSchema = z.object({
  issue_title: z.string().min(2, "សូមបញ្ចូលចំណងជើងបញ្ហាយ៉ាងតិច 2 តួអក្សរ"),

  issue_description: z.string().min(5, "សូមបញ្ចូលការពិពណ៌នាយ៉ាងតិច 5 តួអក្សរ"),

  priority: z.enum(["low", "medium", "high"], {
    error: "សូមជ្រើសរើសអាទិភាព",
  }),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;
