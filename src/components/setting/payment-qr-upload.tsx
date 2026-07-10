"use client";

import { useActionState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadPaymentQr } from "@/actions/settings";

type Props = {
  currentQrUrl?: string | null;
};

export default function PaymentQrUpload({ currentQrUrl }: Props) {
  const [state, formAction, pending] = useActionState(uploadPaymentQr, null);
  const formRef = useRef<HTMLFormElement>(null);
  const qrUrl = (state?.success && state.url) || currentQrUrl || "";

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
      <p className="mb-2 text-sm font-medium text-(--panel-text-muted)">
        កូដ QR សម្រាប់ទូទាត់ប្រាក់
      </p>

      <form ref={formRef} action={formAction}>
        <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-(--panel-border) bg-(--panel-inset) text-sm text-(--panel-text-muted)">
          <Upload size={16} />
          {pending ? "កំពុងផ្ទុកឡើង..." : "ផ្ទុករូបភាព QR ឡើង"}

          <input
            name="qr_image"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            disabled={pending}
            className="hidden"
            onChange={() => formRef.current?.requestSubmit()}
          />
        </label>
      </form>

      {qrUrl ? (
        <div className="mt-3 flex h-40 items-center justify-center rounded-lg border border-(--panel-border) bg-white p-3">
          <img
            src={qrUrl}
            alt="Payment QR Code"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="mt-3 flex h-40 items-center justify-center rounded-lg border border-dashed border-(--panel-border) bg-(--panel-inset) text-xs text-(--panel-text-subtle)">
          មិនទាន់មាន QR Code
        </div>
      )}
    </div>
  );
}
