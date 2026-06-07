import { z } from "zod";

// ─── Maintenance Types ────────────────────────────────────────────────────────

export type MaintenanceStatus = "pending" | "in_progress" | "resolved";
export type MaintenancePriority = "low" | "normal" | "high";

export interface MaintenanceRequest {
  id: string;
  tenant_id: string | null;
  room_id: string | null;
  issue_title: string;
  issue_description: string | null;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  assigned_to: string | null;
  created_at: string;
  resolved_at: string | null;
  // Joined
  profiles?: { full_name: string } | null;
  rooms?: { room_number: string } | null;
  assignee?: { full_name: string } | null;
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────

export const maintenanceFormSchema = z.object({
  issueTitle: z.string().min(1, { message: "ត្រូវការចំណងជើងបញ្ហា។" }).trim(),
  roomId: z.string().min(1, { message: "ត្រូវការបន្ទប់។" }),
  tenantId: z.string().optional().default(""),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  status: z.enum(["pending", "in_progress", "resolved"]).default("pending"),
  assignedTo: z.string().optional().default(""),
  issueDescription: z.string().optional().default(""),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;
