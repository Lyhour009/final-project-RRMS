"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import {
  Bill,
  billSchema,
  BillFormValues,
  BillStatus,
} from "@/lib/validations/bills";
import { upsertBill } from "@/actions/bills";

interface ContractOption {
  id: string;
  tenant_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  due_day: number;
  status: string;
  profiles?: {
    id: string;
    full_name: string;
    phone_number: string;
    email?: string;
  };
  rooms?: {
    id: string;
    room_number: string;
    room_type: string;
    base_price: number;
    floor: number;
  };
}

interface Settings {
  water_rate: number;
  electric_rate: number;
  currency?: string;
  monthly_due_day?: number;
}

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill?: Bill | null;
  contracts: ContractOption[];
  settings: Settings;
  onSuccess?: (bill: Bill) => void;
}

const STATUS_LABELS: Record<BillStatus, string> = {
  unpaid: "មិនទាន់បង់ (Unpaid)",
  paid: "បានបង់ (Paid)",
  overdue: "ហួសកាលកំណត់ (Overdue)",
};

export default function BillModal({
  isOpen,
  onClose,
  bill,
  contracts,
  settings,
  onSuccess,
}: BillModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditMode = !!bill;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      contract_id: "",
      billing_month: "",
      water_meter_start: 0,
      water_meter_end: 0,
      elec_meter_start: 0,
      elec_meter_end: 0,
      status: "unpaid",
    },
  });

  const contractIdValue = watch("contract_id");
  const statusValue = watch("status");
  const waterStart = Number(watch("water_meter_start") || 0);
  const waterEnd = Number(watch("water_meter_end") || 0);
  const elecStart = Number(watch("elec_meter_start") || 0);
  const elecEnd = Number(watch("elec_meter_end") || 0);

  useEffect(() => {
    if (isOpen) {
      if (bill) {
        reset({
          contract_id: bill.contract_id,
          billing_month: bill.billing_month?.slice(0, 7) || "",
          water_meter_start: bill.water_meter_start,
          water_meter_end: bill.water_meter_end,
          elec_meter_start: bill.elec_meter_start,
          elec_meter_end: bill.elec_meter_end,
          status: bill.status,
        });
      } else {
        reset({
          contract_id: "",
          billing_month: "",
          water_meter_start: 0,
          water_meter_end: 0,
          elec_meter_start: 0,
          elec_meter_end: 0,
          status: "unpaid",
        });
      }
    }
  }, [isOpen, bill, reset]);

  const selectedContract = contracts.find(
    (contract) => contract.id === contractIdValue,
  );

  const calculation = useMemo(() => {
    const roomFee = Number(selectedContract?.rooms?.base_price || 0);

    const waterUsed = Math.max(0, waterEnd - waterStart);
    const elecUsed = Math.max(0, elecEnd - elecStart);

    const waterFee = waterUsed * Number(settings?.water_rate || 0);
    const elecFee = elecUsed * Number(settings?.electric_rate || 0);

    const totalAmount = roomFee + waterFee + elecFee;

    return {
      roomFee,
      waterUsed,
      elecUsed,
      waterFee,
      elecFee,
      totalAmount,
    };
  }, [selectedContract, waterStart, waterEnd, elecStart, elecEnd, settings]);

  async function onSubmit(values: BillFormValues) {
    setLoading(true);

    const formData = new FormData();

    formData.append("contract_id", values.contract_id);
    formData.append("billing_month", values.billing_month);
    formData.append("water_meter_start", String(values.water_meter_start));
    formData.append("water_meter_end", String(values.water_meter_end));
    formData.append("elec_meter_start", String(values.elec_meter_start));
    formData.append("elec_meter_end", String(values.elec_meter_end));
    formData.append("status", values.status);

    try {
      const result = await upsertBill(bill?.id || null, formData);

      toast.success(
        isEditMode
          ? "បានកែប្រែវិក្កយបត្រជោគជ័យ"
          : "បានបង្កើតវិក្កយបត្រថ្មីជោគជ័យ",
      );

      if (onSuccess && result) {
        onSuccess(result as Bill);
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || "មានបញ្ហាខុសបច្ចេកទេស");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0d19] text-white border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-100">
            {isEditMode ? "📝 កែប្រែវិក្កយបត្រ" : "🧾 បន្ថែមវិក្កយបត្រថ្មី"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-zinc-400">កិច្ចសន្យា</Label>

            <Select
              value={contractIdValue}
              onValueChange={(value) =>
                setValue("contract_id", value, { shouldValidate: true })
              }
            >
              <SelectTrigger className="bg-[#131626] border-zinc-800 text-white">
                <span
                  className={selectedContract ? "text-white" : "text-zinc-500"}
                >
                  {selectedContract
                    ? `${selectedContract.profiles?.full_name || "-"} — បន្ទប់ #${
                        selectedContract.rooms?.room_number || "-"
                      } — $${selectedContract.rooms?.base_price || 0}`
                    : "ជ្រើសរើសកិច្ចសន្យា..."}
                </span>
              </SelectTrigger>

              <SelectContent className="bg-[#131626] border-zinc-800 text-white w-fit">
                {contracts.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    មិនមានកិច្ចសន្យាសកម្មឡើយ
                  </SelectItem>
                ) : (
                  contracts.map((contract) => (
                    <SelectItem
                      key={contract.id}
                      value={contract.id}
                      className="text-xs"
                    >
                      {contract.profiles?.full_name || "-"} — បន្ទប់ #
                      {contract.rooms?.room_number || "-"} —{" "}
                      <span className="text-emerald-400">
                        ${contract.rooms?.base_price || 0}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {errors.contract_id && (
              <p className="text-xs text-red-400">
                {errors.contract_id.message}
              </p>
            )}
          </div>

          {selectedContract && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl border border-zinc-800 bg-[#131626] p-3">
              <div>
                <p className="text-xs text-zinc-500">អ្នកជួល</p>
                <p className="text-sm font-medium text-zinc-100">
                  {selectedContract.profiles?.full_name || "-"}
                </p>
                <p className="text-xs text-zinc-500">
                  {selectedContract.profiles?.phone_number || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">បន្ទប់</p>
                <p className="text-sm font-medium text-zinc-100">
                  #{selectedContract.rooms?.room_number || "-"}
                </p>
                <p className="text-xs text-zinc-500">
                  {selectedContract.rooms?.room_type || "-"} / ជាន់{" "}
                  {selectedContract.rooms?.floor || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">តម្លៃបន្ទប់</p>
                <p className="text-sm font-semibold text-emerald-400">
                  ${Number(selectedContract.rooms?.base_price || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400">ខែវិក្កយបត្រ</Label>

              <Input
                type="month"
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("billing_month")}
              />

              {errors.billing_month && (
                <p className="text-xs text-red-400">
                  {errors.billing_month.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400">ស្ថានភាព</Label>

              <Select
                value={statusValue}
                onValueChange={(value: BillStatus) =>
                  setValue("status", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-[#131626] border-zinc-800 text-white">
                  <span>{STATUS_LABELS[statusValue]}</span>
                </SelectTrigger>

                <SelectContent className="bg-[#131626] border-zinc-800 text-white w-fit">
                  <SelectItem className="text-xs" value="unpaid">
                    មិនទាន់បង់ (Unpaid)
                  </SelectItem>
                  <SelectItem className="text-xs" value="paid">
                    បានបង់ (Paid)
                  </SelectItem>
                  <SelectItem className="text-xs" value="overdue">
                    ហួសកាលកំណត់ (Overdue)
                  </SelectItem>
                </SelectContent>
              </Select>

              {errors.status && (
                <p className="text-xs text-red-400">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400">កុងទ័រទឹកដើម</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("water_meter_start", { valueAsNumber: true })}
              />
              {errors.water_meter_start && (
                <p className="text-xs text-red-400">
                  {errors.water_meter_start.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400">កុងទ័រទឹកចុង</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("water_meter_end", { valueAsNumber: true })}
              />
              {errors.water_meter_end && (
                <p className="text-xs text-red-400">
                  {errors.water_meter_end.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400">កុងទ័រភ្លើងដើម</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("elec_meter_start", { valueAsNumber: true })}
              />
              {errors.elec_meter_start && (
                <p className="text-xs text-red-400">
                  {errors.elec_meter_start.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400">កុងទ័រភ្លើងចុង</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("elec_meter_end", { valueAsNumber: true })}
              />
              {errors.elec_meter_end && (
                <p className="text-xs text-red-400">
                  {errors.elec_meter_end.message}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#131626] p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">ថ្លៃបន្ទប់</span>
              <span className="font-semibold text-zinc-100">
                ${calculation.roomFee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">
                ថ្លៃទឹក ({calculation.waterUsed} × ${settings?.water_rate})
              </span>
              <span className="font-semibold text-zinc-100">
                ${calculation.waterFee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">
                ថ្លៃភ្លើង ({calculation.elecUsed} × ${settings?.electric_rate})
              </span>
              <span className="font-semibold text-zinc-100">
                ${calculation.elecFee.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-zinc-800 pt-2 flex justify-between">
              <span className="text-zinc-300 font-medium">សរុប</span>
              <span className="text-lg font-bold text-emerald-400">
                ${calculation.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800/60">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              បោះបង់
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
            >
              {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
