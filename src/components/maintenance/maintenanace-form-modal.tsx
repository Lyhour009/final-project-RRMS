"use client";

import React, { useEffect } from "react";
import { Loader2, Wrench } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  createMaintenanceAction,
  updateMaintenanceAction,
} from "@/actions/maintenances";
import {
  maintenanceFormSchema,
  type MaintenanceRequest,
  type MaintenanceStatus,
  type MaintenancePriority,
  type MaintenanceFormValues,
} from "@/types/maintenance";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MaintenanceFormModalProps {
  request?: MaintenanceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (req: MaintenanceRequest, type: "add" | "edit") => void;
  tenants: { id: string; full_name: string }[];
  rooms: { id: string; room_number: string }[];
  staff: { id: string; full_name: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_VALUES: MaintenanceFormValues = {
  issueTitle: "",
  roomId: "",
  tenantId: "",
  priority: "normal",
  status: "pending",
  assignedTo: "",
  issueDescription: "",
};

// ─── Field Wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MaintenanceFormModal({
  request,
  open,
  onOpenChange,
  onSuccess,
  tenants,
  rooms,
  staff,
}: MaintenanceFormModalProps) {
  const isEditMode = !!request;

  // ─── React Hook Form + Zod ───────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // ─── Reset on open ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    reset(
      isEditMode && request
        ? {
            issueTitle: request.issue_title ?? "",
            roomId: request.room_id ?? "",
            tenantId: request.tenant_id ?? "",
            priority: request.priority,
            status: request.status,
            assignedTo: request.assigned_to ?? "",
            issueDescription: request.issue_description ?? "",
          }
        : DEFAULT_VALUES,
    );
  }, [open, request, isEditMode, reset]);

  // ─── Submit Handler ──────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<MaintenanceFormValues> = async (values) => {
    try {
      const result = isEditMode
        ? await updateMaintenanceAction(request!.id, values)
        : await createMaintenanceAction(values);

      if (result.success && result.data) {
        onSuccess(
          result.data as MaintenanceRequest,
          isEditMode ? "edit" : "add",
        );
        onOpenChange(false);
      } else {
        setError("root", {
          message: (result as { error?: string }).error ?? "មានបញ្ហាមិនស្គាល់។",
        });
      }
    } catch (err: unknown) {
      setError("root", {
        message: err instanceof Error ? err.message : "មានបញ្ហាមិនស្គាល់។",
      });
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] font-khmer bg-slate-950/95 backdrop-blur-xl border-white/[0.08] text-white overflow-y-auto max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-500/10 p-2.5">
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-snug">
                {isEditMode ? "កែប្រែការស្នើសុំ" : "ស្នើសុំជួសជុលថ្មី"}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5">
                {isEditMode
                  ? "កែប្រែព័ត៌មាន រួចរក្សាទុក។"
                  : "បំពេញព័ត៌មានខាងក្រោម ដើម្បីបង្កើតការស្នើសុំ។"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="mt-4 bg-white/[0.06]" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 pb-6 space-y-4 mt-4"
        >
          {/* Issue Title */}
          <Field
            label="ចំណងជើងបញ្ហា"
            error={errors.issueTitle?.message}
            required
          >
            <Input
              {...register("issueTitle")}
              placeholder="ឧ. ទឹកក្ដៅខូច, អំពូលស្រពោន..."
              className={cn(
                "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600",
                errors.issueTitle && "border-rose-500/50",
              )}
            />
          </Field>

          {/* Tenant + Room */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="អ្នកជួល" error={errors.tenantId?.message}>
              <Select
                value={watch("tenantId")}
                onValueChange={(v) =>
                  setValue("tenantId", v, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200">
                  <SelectValue placeholder="ជ្រើសរើស..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/[0.08] text-slate-200">
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="បន្ទប់" error={errors.roomId?.message} required>
              <Select
                value={watch("roomId")}
                onValueChange={(v) =>
                  setValue("roomId", v, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  className={cn(
                    "bg-white/[0.03] border-white/[0.08] text-slate-200",
                    errors.roomId && "border-rose-500/50",
                  )}
                >
                  <SelectValue placeholder="ជ្រើសរើស..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/[0.08] text-slate-200">
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      #{r.room_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="អាទិភាព" error={errors.priority?.message}>
              <Select
                value={watch("priority")}
                onValueChange={(v) =>
                  setValue("priority", v as MaintenancePriority, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/[0.08] text-slate-200">
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                      ទាប (Low)
                    </span>
                  </SelectItem>
                  <SelectItem value="normal">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                      មធ្យម (Normal)
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                      បន្ទាន់ (High)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="ស្ថានភាព" error={errors.status?.message}>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as MaintenanceStatus, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/[0.08] text-slate-200">
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      រង់ចាំ (Pending)
                    </span>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                      កំពុងដោះស្រាយ
                    </span>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      រួចរាល់ (Resolved)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Assigned To */}
          {staff.length > 0 && (
            <Field
              label="ដាក់ឱ្យអ្នកណាទទួលខុសត្រូវ"
              error={errors.assignedTo?.message}
            >
              <Select
                value={watch("assignedTo")}
                onValueChange={(v) =>
                  setValue("assignedTo", v, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200">
                  <SelectValue placeholder="ជ្រើសរើសបុគ្គលិក..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/[0.08] text-slate-200">
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {/* Description */}
          <Field
            label="ការពិពណ៌នាបន្ថែម"
            error={errors.issueDescription?.message}
          >
            <Textarea
              {...register("issueDescription")}
              rows={3}
              placeholder="ពណ៌នាបញ្ហាលម្អិត..."
              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600 resize-none"
            />
          </Field>

          {/* Root Error */}
          {errors.root && (
            <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white hover:bg-white/[0.06]"
            >
              បោះបង់
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditMode ? (
                "រក្សាទុក"
              ) : (
                "បង្កើតការស្នើសុំ"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
