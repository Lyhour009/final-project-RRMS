"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FORM_MODAL_BODY,
  FORM_MODAL_CONTENT,
  FORM_MODAL_DESCRIPTION,
  FORM_MODAL_FOOTER,
  FORM_MODAL_HEADER,
  FORM_MODAL_ICON,
  FORM_MODAL_SCROLL_AREA,
  FORM_MODAL_TITLE,
  MODAL_PRIMARY_BUTTON,
  MODAL_SECONDARY_BUTTON,
} from "@/components/ui/modal-styles";
import { ReceiptText } from "lucide-react";
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
    // zod's `z.coerce.number()` has a wider input type (`unknown`) than its
    // output type (`number`); react-hook-form's Resolver only accepts one
    // generic, so the two can't line up without help. The cast is safe —
    // zodResolver's runtime behavior doesn't change, only the type.
    resolver: zodResolver(billSchema) as Resolver<BillFormValues>,
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
    } catch (error) {
      toast.error(getErrorMessage(error, "មានបញ្ហាខុសបច្ចេកទេស"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${FORM_MODAL_CONTENT} sm:max-w-2xl`}>
        <DialogHeader className={FORM_MODAL_HEADER}>
          <DialogTitle className={FORM_MODAL_TITLE}>
            <span className={FORM_MODAL_ICON}><ReceiptText className="h-5 w-5" /></span>
            {isEditMode ? "កែប្រែវិក្កយបត្រ" : "បន្ថែមវិក្កយបត្រថ្មី"}
          </DialogTitle>
          <DialogDescription className={FORM_MODAL_DESCRIPTION}>
            កំណត់ថ្លៃបន្ទប់ ការប្រើប្រាស់ទឹក ភ្លើង និងស្ថានភាពវិក្កយបត្រ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={FORM_MODAL_BODY}>
          <div className={FORM_MODAL_SCROLL_AREA}>
          <div className="space-y-1.5">
            <Label className="text-(--panel-text-muted)">កិច្ចសន្យា</Label>

            <Select
              value={contractIdValue}
              onValueChange={(value: string | null) =>
                value && setValue("contract_id", value, { shouldValidate: true })
              }
            >
              <SelectTrigger className="bg-(--panel) border-(--panel-border) text-(--panel-text)">
                <span
                  className={selectedContract ? "text-(--panel-text)" : "text-(--panel-text-subtle)"}
                >
                  {selectedContract
                    ? `${selectedContract.profiles?.full_name || "-"} — បន្ទប់ #${
                        selectedContract.rooms?.room_number || "-"
                      } — $${selectedContract.rooms?.base_price || 0}`
                    : "ជ្រើសរើសកិច្ចសន្យា..."}
                </span>
              </SelectTrigger>

              <SelectContent className="bg-(--panel) border-(--panel-border) text-(--panel-text) w-fit">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl border border-(--panel-border) bg-(--panel) p-3">
              <div>
                <p className="text-xs text-(--panel-text-subtle)">អ្នកជួល</p>
                <p className="text-sm font-medium text-(--panel-text)">
                  {selectedContract.profiles?.full_name || "-"}
                </p>
                <p className="text-xs text-(--panel-text-subtle)">
                  {selectedContract.profiles?.phone_number || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-(--panel-text-subtle)">បន្ទប់</p>
                <p className="text-sm font-medium text-(--panel-text)">
                  #{selectedContract.rooms?.room_number || "-"}
                </p>
                <p className="text-xs text-(--panel-text-subtle)">
                  {selectedContract.rooms?.room_type || "-"} / ជាន់{" "}
                  {selectedContract.rooms?.floor || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-(--panel-text-subtle)">តម្លៃបន្ទប់</p>
                <p className="text-sm font-semibold text-emerald-400">
                  ${Number(selectedContract.rooms?.base_price || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-(--panel-text-muted)">ខែវិក្កយបត្រ</Label>

              <Input
                type="month"
                className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
                {...register("billing_month")}
              />

              {errors.billing_month && (
                <p className="text-xs text-red-400">
                  {errors.billing_month.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-(--panel-text-muted)">ស្ថានភាព</Label>

              <Select
                value={statusValue}
                onValueChange={(value: BillStatus | null) =>
                  value && setValue("status", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-(--panel) border-(--panel-border) text-(--panel-text)">
                  <span>{STATUS_LABELS[statusValue]}</span>
                </SelectTrigger>

                <SelectContent className="bg-(--panel) border-(--panel-border) text-(--panel-text) w-fit">
                  <SelectItem className="text-xs" value="unpaid">
                    មិនទាន់បង់ (Unpaid)
                  </SelectItem>
                  <SelectItem className="text-xs" value="paid" disabled>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-(--panel-text-muted)">កុងទ័រទឹកដើម</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
                {...register("water_meter_start", { valueAsNumber: true })}
              />
              {errors.water_meter_start && (
                <p className="text-xs text-red-400">
                  {errors.water_meter_start.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-(--panel-text-muted)">កុងទ័រទឹកចុង</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
                {...register("water_meter_end", { valueAsNumber: true })}
              />
              {errors.water_meter_end && (
                <p className="text-xs text-red-400">
                  {errors.water_meter_end.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-(--panel-text-muted)">កុងទ័រភ្លើងដើម</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
                {...register("elec_meter_start", { valueAsNumber: true })}
              />
              {errors.elec_meter_start && (
                <p className="text-xs text-red-400">
                  {errors.elec_meter_start.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-(--panel-text-muted)">កុងទ័រភ្លើងចុង</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
                {...register("elec_meter_end", { valueAsNumber: true })}
              />
              {errors.elec_meter_end && (
                <p className="text-xs text-red-400">
                  {errors.elec_meter_end.message}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-(--panel-border) bg-(--panel) p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-(--panel-text-muted)">ថ្លៃបន្ទប់</span>
              <span className="font-semibold text-(--panel-text)">
                ${calculation.roomFee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-(--panel-text-muted)">
                ថ្លៃទឹក ({calculation.waterUsed} × ${settings?.water_rate})
              </span>
              <span className="font-semibold text-(--panel-text)">
                ${calculation.waterFee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-(--panel-text-muted)">
                ថ្លៃភ្លើង ({calculation.elecUsed} × ${settings?.electric_rate})
              </span>
              <span className="font-semibold text-(--panel-text)">
                ${calculation.elecFee.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-(--panel-border) pt-2 flex justify-between">
              <span className="text-(--panel-text-muted) font-medium">សរុប</span>
              <span className="text-lg font-bold text-emerald-400">
                ${calculation.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          </div>
          <div className={FORM_MODAL_FOOTER}>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className={MODAL_SECONDARY_BUTTON}
            >
              បោះបង់
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className={MODAL_PRIMARY_BUTTON}
            >
              {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
