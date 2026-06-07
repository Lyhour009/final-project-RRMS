"use client";

import React, { useEffect, useCallback } from "react";
import { Loader2, Receipt, Zap, Droplets, Home } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler, UseFormRegister } from "react-hook-form";

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
  createBillAction,
  updateBillAction,
  getBillFormOptionsAction,
} from "@/actions/bills";
import {
  billFormSchema,
  type Bill,
  type BillFormValues,
  type BillStatus,
} from "@/types/bill";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContractOption = {
  id: string;
  tenant_id: string;
  rooms?: { room_number: string; room_type: string; base_price: number } | null;
  profiles?: { id: string; full_name: string; phone_number: string } | null;
};

interface BillFormModalProps {
  bill?: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (bill: Bill, type: "add" | "edit") => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WATER_RATE = 0.5;
const ELEC_RATE = 0.18;

const STATUS_OPTIONS: { value: BillStatus; label: string; color: string }[] = [
  { value: "unpaid", label: "មិនទាន់បង់", color: "text-amber-400" },
  { value: "paid", label: "បានបង់", color: "text-emerald-400" },
  { value: "overdue", label: "ហួសកំណត់", color: "text-rose-400" },
];

const DEFAULT_VALUES: BillFormValues = {
  contractId: "",
  tenantId: "",
  billingMonth: new Date().toISOString().slice(0, 7),
  waterMeterStart: "",
  waterMeterEnd: "",
  elecMeterStart: "",
  elecMeterEnd: "",
  roomFee: "",
  waterFee: "",
  elecFee: "",
  status: "unpaid",
};

// ─── Field Wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[10px] text-slate-500">{hint}</p>}
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  cn(
    "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600",
    err && "border-rose-500/50",
  );

const selectCls = (hasError?: boolean) =>
  cn(
    "w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-md px-3 py-2 text-sm outline-none focus:border-indigo-500/50 transition-colors",
    hasError && "border-rose-500/50",
  );

// ─── Meter Row ────────────────────────────────────────────────────────────────

function MeterRow({
  icon,
  label,
  startName,
  endName,
  feeName,
  rate,
  endError,
  register,
  startValue,
  endValue,
}: {
  icon: React.ReactNode;
  label: string;
  startName: keyof BillFormValues;
  endName: keyof BillFormValues;
  feeName: keyof BillFormValues;
  rate: number;
  endError?: string;
  register: UseFormRegister<BillFormValues>;
  startValue: string;
  endValue: string;
}) {
  const start = parseFloat(startValue) || 0;
  const end = parseFloat(endValue) || 0;
  const units = end > start ? end - start : 0;

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          {icon}
          {label}
        </p>
        {units > 0 && (
          <span className="text-[11px] text-slate-500">
            {units} unit × ${rate} ={" "}
            <span className="text-emerald-400 font-medium">
              ${(units * rate).toFixed(2)}
            </span>
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="លេខដើម">
          <Input
            type="number"
            min="0"
            {...register(startName)}
            placeholder="0"
            className={inputCls()}
          />
        </Field>
        <Field label="លេខចុងក្រោយ" error={endError}>
          <Input
            type="number"
            min="0"
            {...register(endName)}
            placeholder="0"
            className={inputCls(endError)}
          />
        </Field>
        <Field label="ថ្លៃ ($)">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
              $
            </span>
            <Input
              type="number"
              min="0"
              step="0.01"
              {...register(feeName)}
              placeholder="0"
              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600 pl-6"
            />
          </div>
        </Field>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillFormModal({
  bill,
  open,
  onOpenChange,
  onSuccess,
}: BillFormModalProps) {
  const isEditMode = !!bill;

  const [contracts, setContracts] = useState<ContractOption[]>([]);
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
  } = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const watchedValues = watch();
  const currentStatus = watchedValues.status;

  // ─── Auto-calc fees from meter readings ─────────────────────────────────
  const autoCalcFees = useCallback(
    (key: keyof BillFormValues, newVal: string) => {
      const current = watch();
      const updated = { ...current, [key]: newVal };

      const ws = parseFloat(updated.waterMeterStart ?? "") || 0;
      const we = parseFloat(updated.waterMeterEnd ?? "") || 0;
      if (we > ws) {
        setValue("waterFee", ((we - ws) * WATER_RATE).toFixed(2));
      }

      const es = parseFloat(updated.elecMeterStart ?? "") || 0;
      const ee = parseFloat(updated.elecMeterEnd ?? "") || 0;
      if (ee > es) {
        setValue("elecFee", ((ee - es) * ELEC_RATE).toFixed(2));
      }
    },
    [watchedValues, setValue],
  );

  // ─── Register meter fields with auto-calc onChange ───────────────────────
  const meterKeys: Array<keyof BillFormValues> = [
    "waterMeterStart",
    "waterMeterEnd",
    "elecMeterStart",
    "elecMeterEnd",
  ];

  function registerMeter(name: keyof BillFormValues) {
    const reg = register(name);
    return {
      ...reg,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        reg.onChange(e);
        autoCalcFees(name, e.target.value);
      },
    };
  }

  // ─── Contract selection auto-fills tenantId + roomFee ───────────────────
  function handleContractChange(contractId: string) {
    const contract = contracts.find((c) => c.id === contractId);
    setValue("contractId", contractId, { shouldValidate: true });
    setValue("tenantId", contract?.tenant_id ?? "");
    setValue("roomFee", contract?.rooms?.base_price?.toString() ?? "");
  }

  // ─── Load options & populate on open ────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    reset(
      isEditMode && bill
        ? {
            contractId: bill.contract_id ?? "",
            tenantId: bill.tenant_id ?? "",
            billingMonth:
              bill.billing_month?.slice(0, 7) ?? DEFAULT_VALUES.billingMonth,
            waterMeterStart: bill.water_meter_start?.toString() ?? "",
            waterMeterEnd: bill.water_meter_end?.toString() ?? "",
            elecMeterStart: bill.elec_meter_start?.toString() ?? "",
            elecMeterEnd: bill.elec_meter_end?.toString() ?? "",
            roomFee: bill.room_fee?.toString() ?? "",
            waterFee: bill.water_fee?.toString() ?? "",
            elecFee: bill.elec_fee?.toString() ?? "",
            status: bill.status ?? "unpaid",
          }
        : DEFAULT_VALUES,
    );

    setLoadingOptions(true);
    getBillFormOptionsAction().then((res) => {
      if (res.success) setContracts(res.contracts as ContractOption[]);
      setLoadingOptions(false);
    });
  }, [open, bill, isEditMode, reset]);

  // ─── Computed total ──────────────────────────────────────────────────────
  const total =
    (parseFloat(watchedValues.roomFee || "0") || 0) +
    (parseFloat(watchedValues.waterFee || "0") || 0) +
    (parseFloat(watchedValues.elecFee || "0") || 0);

  const selectedContract = contracts.find(
    (c) => c.id === watchedValues.contractId,
  );

  // ─── Submit Handler ──────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<BillFormValues> = async (data) => {
    try {
      const result = isEditMode
        ? await updateBillAction(bill!.id, data)
        : await createBillAction(data);

      if (result.success && result.data) {
        onSuccess(result.data as Bill, isEditMode ? "edit" : "add");
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
      <DialogContent className="sm:max-w-[560px] font-khmer bg-slate-950/95 backdrop-blur-xl border-white/[0.08] text-white p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-500/10 p-2.5">
              <Receipt className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-snug">
                {isEditMode ? "កែប្រែវិក្កយបត្រ" : "បង្កើតវិក្កយបត្រថ្មី"}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5">
                {isEditMode
                  ? "កែប្រែព័ត៌មានវិក្កយបត្រ រួចរក្សាទុក។"
                  : "បំពេញព័ត៌មានខាងក្រោម ដើម្បីបង្កើតវិក្កយបត្រ។"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="mt-4 bg-white/[0.06]" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 pb-6 space-y-5 mt-4 max-h-[72vh] overflow-y-auto"
        >
          {/* ── Contract + Month ── */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-500">
              ព័ត៌មានទូទៅ
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="កិច្ចសន្យា (អ្នកជួល / បន្ទប់)"
                error={errors.contractId?.message}
                required
              >
                <select
                  value={watchedValues.contractId}
                  onChange={(e) => handleContractChange(e.target.value)}
                  disabled={loadingOptions}
                  className={selectCls(!!errors.contractId)}
                >
                  <option value="" className="bg-slate-900">
                    {loadingOptions ? "កំពុងទាញ..." : "ជ្រើសរើស..."}
                  </option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">
                      {c.profiles?.full_name ?? "—"} — បន្ទប់ #
                      {c.rooms?.room_number ?? "?"}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="ខែចេញវិក្កយបត្រ"
                error={errors.billingMonth?.message}
                required
              >
                <Input
                  type="month"
                  {...register("billingMonth")}
                  className={cn(
                    "bg-white/[0.03] border-white/[0.08] text-white [color-scheme:dark]",
                    errors.billingMonth && "border-rose-500/50",
                  )}
                />
              </Field>
            </div>

            {selectedContract && (
              <div className="flex items-center gap-3 bg-indigo-500/[0.06] border border-indigo-500/20 rounded-lg px-3 py-2 text-xs text-slate-300">
                <span className="text-indigo-400 font-medium">
                  #{selectedContract.rooms?.room_number}
                </span>
                <span className="text-slate-500">·</span>
                <span>{selectedContract.profiles?.full_name}</span>
                <span className="text-slate-500">·</span>
                <span className="text-emerald-400">
                  ${selectedContract.rooms?.base_price}/ខែ
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* ── Room Fee ── */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-500">
              ថ្លៃបន្ទប់
            </p>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-300 font-medium">
                  ថ្លៃបន្ទប់ប្រចាំខែ
                </span>
              </div>
              <Field label="ថ្លៃ ($)" error={errors.roomFee?.message} required>
                <div className="relative max-w-[160px]">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("roomFee")}
                    placeholder="0"
                    className={cn(inputCls(errors.roomFee?.message), "pl-6")}
                  />
                </div>
              </Field>
            </div>
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* ── Meters ── */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-500">
              ម៉ែត្រទឹក និងភ្លើង
              <span className="ml-2 normal-case text-indigo-400/80">
                (គណនាស្វ័យប្រវត្តិ)
              </span>
            </p>

            <MeterRow
              icon={<Droplets className="w-3.5 h-3.5 text-sky-400" />}
              label="ទឹក"
              startName="waterMeterStart"
              endName="waterMeterEnd"
              feeName="waterFee"
              rate={WATER_RATE}
              endError={errors.waterMeterEnd?.message}
              register={(name) =>
                registerMeter(name as keyof BillFormValues) as ReturnType<
                  typeof useForm<BillFormValues>
                >["register"]
              }
              startValue={watchedValues.waterMeterStart ?? ""}
              endValue={watchedValues.waterMeterEnd ?? ""}
            />

            <MeterRow
              icon={<Zap className="w-3.5 h-3.5 text-yellow-400" />}
              label="ភ្លើង"
              startName="elecMeterStart"
              endName="elecMeterEnd"
              feeName="elecFee"
              rate={ELEC_RATE}
              endError={errors.elecMeterEnd?.message}
              register={(name) =>
                registerMeter(name as keyof BillFormValues) as ReturnType<
                  typeof useForm<BillFormValues>
                >["register"]
              }
              startValue={watchedValues.elecMeterStart ?? ""}
              endValue={watchedValues.elecMeterEnd ?? ""}
            />
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* ── Total Summary ── */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>ថ្លៃបន្ទប់</span>
              <span>
                ${parseFloat(watchedValues.roomFee || "0").toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>ថ្លៃទឹក</span>
              <span>
                ${parseFloat(watchedValues.waterFee || "0").toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>ថ្លៃភ្លើង</span>
              <span>
                ${parseFloat(watchedValues.elecFee || "0").toFixed(2)}
              </span>
            </div>
            <Separator className="bg-white/[0.08]" />
            <div className="flex justify-between font-semibold text-white text-base">
              <span>សរុប</span>
              <span className="text-emerald-400">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* ── Status ── */}
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

          {/* Root error */}
          {errors.root && (
            <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* ── Actions ── */}
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
                "បង្កើតវិក្កយបត្រ"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
