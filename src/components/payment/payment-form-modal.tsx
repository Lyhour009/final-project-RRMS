"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import { CreditCard } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  paymentSchema,
  PaymentFormValues,
  Payment,
  PaymentMethod,
  PAYMENT_METHOD_LABELS,
} from "@/lib/validations/payments";

import { submitPayment } from "@/actions/payments";

interface BillOption {
  id: string;
  billing_month: string;
  total_amount: number;
  status: string;

  profiles?: {
    id?: string;
    full_name: string;
    phone_number: string;
    email?: string;
  };

  contracts?: {
    rooms?: {
      id?: string;
      room_number: string;
      room_type: string;
    };
  };
}

interface PaymentSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  bills: BillOption[];
  onSuccess?: (payment: Payment) => void;
}

export default function PaymentSubmitModal({
  isOpen,
  onClose,
  bills,
  onSuccess,
}: PaymentSubmitModalProps) {
  const [loading, setLoading] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    // See bill-form-modal.tsx for why this cast is needed and safe.
    resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      bill_id: "",
      amount: 0,
      payment_method: "aba",
      note: "",
      proof_image: undefined,
    },
  });

  const selectedBillId = watch("bill_id");
  const selectedMethod = watch("payment_method");

  const selectedBill = bills.find((bill) => bill.id === selectedBillId);

  const selectedBillLabel = selectedBill
    ? `${selectedBill.billing_month || "វិក្កយបត្រ"} — បន្ទប់ #${
        selectedBill.contracts?.rooms?.room_number || "-"
      } — $${Number(selectedBill.total_amount || 0).toFixed(2)}`
    : "ជ្រើសរើសវិក្កយបត្រ";

  useEffect(() => {
    if (isOpen) {
      reset({
        bill_id: "",
        amount: 0,
        payment_method: "aba",
        note: "",
        proof_image: undefined,
      });

      setProofPreview(null);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (selectedBill) {
      setValue("amount", Number(selectedBill.total_amount || 0), {
        shouldValidate: true,
      });
    }
  }, [selectedBill, setValue]);

  async function onSubmit(values: PaymentFormValues) {
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("bill_id", values.bill_id);
      formData.append("amount", String(values.amount));
      formData.append("payment_method", values.payment_method);
      formData.append("note", values.note || "");

      if (values.proof_image) {
        formData.append("proof_image", values.proof_image);
      }

      const payment = await submitPayment(formData);

      toast.success("បានបញ្ជូនការទូទាត់។ សូមរង់ចាំ Admin ផ្ទៀងផ្ទាត់។");

      onSuccess?.(payment as Payment);

      reset();
      setProofPreview(null);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "មានបញ្ហាបច្ចេកទេស");
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    reset();
    setProofPreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${FORM_MODAL_CONTENT} sm:max-w-xl`}>
        <DialogHeader className={FORM_MODAL_HEADER}>
          <DialogTitle className={FORM_MODAL_TITLE}>
            <span className={FORM_MODAL_ICON}><CreditCard className="h-5 w-5" /></span>
            បញ្ជាក់ការទូទាត់
          </DialogTitle>
          <DialogDescription className={FORM_MODAL_DESCRIPTION}>
            ជ្រើសវិក្កយបត្រ វិធីបង់ប្រាក់ និងភ្ជាប់បង្កាន់ដៃបើមាន
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={FORM_MODAL_BODY}>
          <div className={FORM_MODAL_SCROLL_AREA}>
          <div className="space-y-1.5">
            <Label className="text-(--panel-text-muted)">វិក្កយបត្រ</Label>

            <Select
              value={selectedBillId}
              onValueChange={(value: string | null) =>
                value && setValue("bill_id", value, { shouldValidate: true })
              }
            >
              <SelectTrigger className="bg-(--panel) border-(--panel-border) text-(--panel-text)">
                <SelectValue placeholder="ជ្រើសរើសវិក្កយបត្រ">
                  {selectedBillLabel}
                </SelectValue>
              </SelectTrigger>

              <SelectContent className="bg-(--panel) border-(--panel-border) text-(--panel-text)">
                {bills.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    មិនមានវិក្កយបត្រមិនទាន់បង់ឡើយ
                  </SelectItem>
                ) : (
                  bills.map((bill) => (
                    <SelectItem
                      key={bill.id}
                      value={bill.id}
                      className="text-xs"
                    >
                      {bill.billing_month || "វិក្កយបត្រ"} —{" "}
                      {bill.profiles?.full_name || "-"} — បន្ទប់ #
                      {bill.contracts?.rooms?.room_number || "-"} — $
                      {Number(bill.total_amount || 0).toFixed(2)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {errors.bill_id && (
              <p className="text-xs text-red-400">{errors.bill_id.message}</p>
            )}
          </div>

          {selectedBill && (
            <div className="rounded-xl border border-(--panel-border) bg-(--panel) p-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-(--panel-text-muted)">អ្នកជួល</span>
                <span className="font-medium text-(--panel-text)">
                  {selectedBill.profiles?.full_name || "-"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-(--panel-text-muted)">លេខទូរស័ព្ទ</span>
                <span className="font-medium text-(--panel-text)">
                  {selectedBill.profiles?.phone_number || "-"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-(--panel-text-muted)">បន្ទប់</span>
                <span className="font-medium text-(--panel-text)">
                  #{selectedBill.contracts?.rooms?.room_number || "-"} —{" "}
                  {selectedBill.contracts?.rooms?.room_type || "-"}
                </span>
              </div>

              <div className="flex justify-between text-sm border-t border-(--panel-border) pt-2 mt-2">
                <span className="text-(--panel-text-muted) font-medium">ចំនួនត្រូវបង់</span>
                <span className="font-bold text-emerald-400">
                  ${Number(selectedBill.total_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-(--panel-text-muted)">ចំនួនទឹកប្រាក់</Label>

            <Input
              type="number"
              min={0}
              step="0.01"
              className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
              {...register("amount", { valueAsNumber: true })}
            />

            {errors.amount && (
              <p className="text-xs text-red-400">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-(--panel-text-muted)">វិធីបង់ប្រាក់</Label>

            <Select
              value={selectedMethod}
              onValueChange={(value: PaymentMethod | null) =>
                value && setValue("payment_method", value, { shouldValidate: true })
              }
            >
              <SelectTrigger className="bg-(--panel) border-(--panel-border) text-(--panel-text)">
                <SelectValue placeholder="ជ្រើសរើសវិធីបង់ប្រាក់">
                  {selectedMethod ? PAYMENT_METHOD_LABELS[selectedMethod] : ""}
                </SelectValue>
              </SelectTrigger>

              <SelectContent className="bg-(--panel) border-(--panel-border) text-(--panel-text)">
                <SelectItem value="aba">ABA</SelectItem>
                <SelectItem value="acleda">ACLEDA</SelectItem>
                <SelectItem value="wing">Wing</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">ផ្សេងៗ</SelectItem>
              </SelectContent>
            </Select>

            {errors.payment_method && (
              <p className="text-xs text-red-400">
                {errors.payment_method.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-(--panel-text-muted)">រូបភាពបញ្ជាក់ Optional</Label>

            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
              onChange={(e) => {
                const file = e.target.files?.[0];

                setValue("proof_image", file, { shouldValidate: true });

                if (file) {
                  setProofPreview(URL.createObjectURL(file));
                } else {
                  setProofPreview(null);
                }
              }}
            />

            <p className="text-xs text-(--panel-text-subtle)">
              បើមាន screenshot នៃការបង់ប្រាក់ អាច upload បាន។ មិនបាច់ក៏បាន។
            </p>

            {proofPreview && (
              <div className="mt-2 w-full h-40 rounded-lg overflow-hidden border border-(--panel-border) bg-(--panel-hover)">
                <img
                  src={proofPreview}
                  alt="Payment proof preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {errors.proof_image && (
              <p className="text-xs text-red-400">
                {String(errors.proof_image.message)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-(--panel-text-muted)">ចំណាំ</Label>

            <Input
              className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
              placeholder="ឧ. បានបង់តាម ABA"
              {...register("note")}
            />

            {errors.note && (
              <p className="text-xs text-red-400">{errors.note.message}</p>
            )}
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-xs text-amber-300 leading-relaxed">
              សូមប្រាកដថាអ្នកបានបង់ប្រាក់រួចរាល់។
              ការទូទាត់នេះនឹងស្ថិតក្នុងស្ថានភាព "កំពុងរង់ចាំ" រហូតដល់ Admin
              ផ្ទៀងផ្ទាត់ និងអនុម័ត។
            </p>
          </div>

          </div>
          <div className={FORM_MODAL_FOOTER}>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
              className={MODAL_SECONDARY_BUTTON}
            >
              បោះបង់
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className={MODAL_PRIMARY_BUTTON}
            >
              {loading ? "កំពុងបញ្ជូន..." : "ខ្ញុំបានបង់ប្រាក់រួចហើយ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
