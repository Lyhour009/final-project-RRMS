"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Props = {
  currentQrUrl?: string | null;
};

export default function PaymentQrUpload({ currentQrUrl }: Props) {
  const supabase = createClient();
  const [qrUrl, setQrUrl] = useState(currentQrUrl || "");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const fileName = `payment-qr/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

      const { error: uploadError } = await supabase.storage
        .from("room-images")
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("room-images").getPublicUrl(fileName);

      const { data: setting } = await supabase
        .from("settings")
        .select("id")
        .limit(1)
        .single();

      if (!setting) throw new Error("រកមិនឃើញ Settings row");

      const { error: updateError } = await supabase
        .from("settings")
        .update({
          payment_qr_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", setting.id);

      if (updateError) throw updateError;

      setQrUrl(publicUrl);
      toast.success("បាន Upload និងរក្សាទុក QR Code ជោគជ័យ");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-5">
      <p className="mb-2 text-sm font-medium text-zinc-300">Payment QR Code</p>

      <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-[#0b0d19] text-sm text-zinc-300">
        <Upload size={16} />
        {loading ? "កំពុង Upload..." : "Upload QR Image"}

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleUpload}
          disabled={loading}
          className="hidden"
        />
      </label>

      {qrUrl ? (
        <div className="mt-3 flex h-40 items-center justify-center rounded-lg border border-zinc-800 bg-white p-3">
          <img
            src={qrUrl}
            alt="Payment QR Code"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="mt-3 flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-[#0b0d19] text-xs text-zinc-600">
          មិនទាន់មាន QR Code
        </div>
      )}
    </div>
  );
}
