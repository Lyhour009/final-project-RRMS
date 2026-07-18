"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, ImageIcon, Loader2, QrCode, Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadPaymentQr } from "@/actions/settings";

export default function PaymentQrUpload({ currentQrUrl }: { currentQrUrl?: string | null }) {
  const [state, formAction, pending] = useActionState(uploadPaymentQr, null);
  const [fileName, setFileName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const qrUrl = (state?.success && state.url) || currentQrUrl || "";

  useEffect(() => {
    if (!state) return;
    if (state.success) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <aside className="overflow-hidden rounded-2xl border border-(--panel-border) bg-(--panel) shadow-sm xl:sticky xl:top-20">
      <div className="border-b border-(--panel-border-subtle) px-5 py-4">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-300"><QrCode className="h-5 w-5" /></div><div><h2 className="text-sm font-semibold text-(--panel-text)">QR សម្រាប់ទូទាត់</h2><p className="mt-0.5 text-xs text-(--panel-text-subtle)">បង្ហាញទៅអ្នកជួលពេលបង់ប្រាក់</p></div></div>
      </div>

      <div className="p-5">
        <div className="relative flex aspect-square max-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-(--panel-border) bg-(--panel-inset)/55 p-5">
          {qrUrl ? <img src={qrUrl} alt="Payment QR Code" className="max-h-full max-w-full rounded-xl bg-white p-3 object-contain shadow-sm" /> : <div className="text-center"><div className="mx-auto mb-3 w-fit rounded-2xl bg-violet-500/10 p-4 text-violet-500"><ImageIcon className="h-7 w-7" /></div><p className="text-sm font-medium text-(--panel-text)">មិនទាន់មាន QR Code</p><p className="mt-1 text-xs text-(--panel-text-subtle)">ផ្ទុករូបភាពដើម្បីចាប់ផ្តើម</p></div>}
          {pending && <div className="absolute inset-0 flex flex-col items-center justify-center bg-(--panel)/85 backdrop-blur-sm"><Loader2 className="h-7 w-7 animate-spin text-indigo-500" /><p className="mt-2 text-xs text-(--panel-text-muted)">កំពុងផ្ទុកឡើង...</p></div>}
        </div>

        <form ref={formRef} action={formAction} className="mt-4">
          <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--panel-border) bg-(--panel-inset) px-4 text-sm font-medium text-(--panel-text-muted) transition hover:border-indigo-500/30 hover:bg-(--panel-hover) hover:text-(--panel-text)">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {qrUrl ? "ប្តូររូបភាព QR" : "ផ្ទុករូបភាព QR"}
            <input name="qr_image" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" disabled={pending} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setFileName(file.name); formRef.current?.requestSubmit(); }} />
          </label>
        </form>

        <div className="mt-3 space-y-1.5 text-xs text-(--panel-text-subtle)">
          <p>គាំទ្រ JPG, PNG និង WEBP · អតិបរមា 5MB</p>
          {fileName && <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />{fileName}</p>}
        </div>
      </div>
    </aside>
  );
}
