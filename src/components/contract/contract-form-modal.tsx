"use client";

import React, { useEffect, useState } from "react";
import { Loader2, FileText, User, DoorOpen } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  createContractAction,
  updateContractAction,
  getContractFormOptionsAction,
} from "@/actions/contracts";
import {
  contractFormSchema,
  type Contract,
  type ContractFormValues,
  type ContractStatus,
} from "@/types/contract";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TenantOption {
  id: string;
  full_name: string;
  phone_number: string;
}

interface RoomOption {
  id: string;
  room_number: string;
  room_type: string;
  base_price: number;
  status: string;
}

interface ContractFormModalProps {
  contract?: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (contract: Contract, type: "add" | "edit") => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS: {
  value: ContractStatus;
  label: string;
  color: string;
}[] = [
  { value: "active", label: "សកម្ម", color: "text-emerald-400" },
  { value: "terminated", label: "បញ្ចប់", color: "text-rose-400" },
  { value: "expired", label: "ផុតកំណត់", color: "text-amber-400" },
];

const DEFAULT_VALUES: ContractFormValues = {
  tenantId: "",
  roomId: "",
  startDate: "",
  endDate: "",
  depositAmount: "",
  status: "active",
  dueDay: "1",
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

// ─── Select Class Helper ──────────────────────────────────────────────────────
const selectCls = (hasError?: boolean) =>
  cn(
    "w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-md px-3 py-2 text-sm outline-none focus:border-indigo-500/50 transition-colors",
    hasError && "border-rose-500/50",
  );

// ─── Component ────────────────────────────────────────────────────────────────
export default function ContractFormModal({
  contract,
  open,
  onOpenChange,
  onSuccess,
}: ContractFormModalProps) {
  const isEditMode = !!contract;

  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // ─── React Hook Form + Zod ───────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const currentStatus = watch("status");
  const selectedRoomId = watch("roomId");

  // ─── Load Options & Populate on Open ────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    reset(
      isEditMode && contract
        ? {
            tenantId: contract.tenant_id ?? "",
            roomId: contract.room_id ?? "",
            startDate: contract.start_date?.slice(0, 10) ?? "",
            endDate: contract.end_date?.slice(0, 10) ?? "",
            depositAmount: contract.deposit_amount?.toString() ?? "",
            status: contract.status ?? "active",
            dueDay: contract.due_day?.toString() ?? "1",
          }
        : DEFAULT_VALUES,
    );

    setLoadingOptions(true);
    getContractFormOptionsAction().then((res) => {
      if (res.success) {
        setTenants(res.tenants as TenantOption[]);
        setRooms(res.rooms as RoomOption[]);
      }
      setLoadingOptions(false);
    });
  }, [open, contract, isEditMode, reset]);

  // ─── Submit Handler ──────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<ContractFormValues> = async (data) => {
    try {
      const result = isEditMode
        ? await updateContractAction(contract!.id, data)
        : await createContractAction(data);

      if (result.success && result.data) {
        onSuccess(result.data as Contract, isEditMode ? "edit" : "add");
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

  // ─── Selected Room Warning ───────────────────────────────────────────────
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const roomUnavailable = selectedRoom && selectedRoom.status !== "available";

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] font-khmer bg-slate-950/95 backdrop-blur-xl border-white/[0.08] text-white p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-500/10 p-2.5">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-snug">
                {isEditMode ? "កែប្រែកិច្ចសន្យា" : "បង្កើតកិច្ចសន្យាថ្មី"}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5">
                {isEditMode
                  ? "កែប្រែព័ត៌មានកិច្ចសន្យា រួចរក្សាទុក។"
                  : "បំពេញព័ត៌មានខាងក្រោម ដើម្បីបង្កើតកិច្ចសន្យា។"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="mt-4 bg-white/[0.06]" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 pb-6 space-y-4 mt-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Section: Parties */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <User className="w-3 h-3" /> អ្នកជួល និងបន្ទប់
            </p>

            {/* Tenant */}
            <Field label="អ្នកជួល" error={errors.tenantId?.message} required>
              <select
                {...register("tenantId")}
                disabled={loadingOptions}
                className={selectCls(!!errors.tenantId)}
              >
                <option value="" className="bg-slate-900">
                  {loadingOptions ? "កំពុងទាញ..." : "ជ្រើសរើសអ្នកជួល..."}
                </option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900">
                    {t.full_name}
                    {t.phone_number ? ` — ${t.phone_number}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            {/* Room */}
            <Field label="បន្ទប់" error={errors.roomId?.message} required>
              <select
                {...register("roomId")}
                disabled={loadingOptions}
                className={selectCls(!!errors.roomId)}
              >
                <option value="" className="bg-slate-900">
                  {loadingOptions ? "កំពុងទាញ..." : "ជ្រើសរើសបន្ទប់..."}
                </option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900">
                    #{r.room_number} — {r.room_type} (${r.base_price}/ខែ)
                    {r.status !== "available" ? " ⚠" : ""}
                  </option>
                ))}
              </select>
              {roomUnavailable && (
                <p className="text-[11px] text-amber-400 mt-1">
                  ⚠ បន្ទប់នេះមានស្ថានភាព &quot;{selectedRoom.status}&quot;។
                </p>
              )}
            </Field>
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Section: Dates */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <DoorOpen className="w-3 h-3" /> រយៈពេលកិច្ចសន្យា
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="ថ្ងៃចូលជួល"
                error={errors.startDate?.message}
                required
              >
                <Input
                  type="date"
                  {...register("startDate")}
                  className={cn(
                    "bg-white/[0.03] border-white/[0.08] text-white [color-scheme:dark]",
                    errors.startDate && "border-rose-500/50",
                  )}
                />
              </Field>

              <Field label="ថ្ងៃបញ្ចប់" error={errors.endDate?.message}>
                <Input
                  type="date"
                  {...register("endDate")}
                  className={cn(
                    "bg-white/[0.03] border-white/[0.08] text-white [color-scheme:dark]",
                    errors.endDate && "border-rose-500/50",
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Deposit */}
              <Field
                label="ប្រាក់កក់ ($)"
                error={errors.depositAmount?.message}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("depositAmount")}
                    placeholder="0"
                    className={cn(
                      "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600 pl-7",
                      errors.depositAmount && "border-rose-500/50",
                    )}
                  />
                </div>
              </Field>

              {/* Due Day */}
              <Field label="ថ្ងៃបង់ប្រចាំខែ" error={errors.dueDay?.message}>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  {...register("dueDay")}
                  placeholder="1"
                  className={cn(
                    "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600",
                    errors.dueDay && "border-rose-500/50",
                  )}
                />
              </Field>
            </div>
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Status Buttons */}
          <Field label="ស្ថានភាព" error={errors.status?.message} required>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue("status", opt.value, { shouldValidate: true })
                  }
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-medium border transition-all",
                    currentStatus === opt.value
                      ? "border-indigo-500/50 bg-indigo-500/10 text-white"
                      : "border-white/[0.08] bg-white/[0.02] text-slate-500 hover:text-slate-300",
                  )}
                >
                  <span
                    className={
                      currentStatus === opt.value ? opt.color : undefined
                    }
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          {/* Root / Server Error */}
          {errors.root && (
            <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* Footer Actions */}
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
              disabled={isSubmitting || loadingOptions}
              className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[130px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditMode ? (
                "រក្សាទុក"
              ) : (
                "បង្កើតកិច្ចសន្យា"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
