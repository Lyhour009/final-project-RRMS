"use client";

import React, { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { deleteMaintenanceAction } from "@/actions/maintenances";
import type { MaintenanceRequest } from "@/types/maintenance";
import { toast } from "sonner";

interface DeleteMaintenanceModalProps {
  request?: MaintenanceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (id: string) => void;
}

export default function DeleteMaintenanceModal({
  request,
  open,
  onOpenChange,
  onSuccess,
}: DeleteMaintenanceModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!request) return;
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteMaintenanceAction(request.id);
      if (result.success) {
        onSuccess(request.id);
        onOpenChange(false);
        toast.success("បានលុបការស្នើសុំជួសជុលដោយជោគជ័យ!");
      } else {
        setError(result.error ?? "មានបញ្ហាមិនស្គាល់។");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "មានបញ្ហាមិនស្គាល់។");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] font-khmer bg-slate-950/95 backdrop-blur-xl border-white/[0.08] text-white p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-rose-500/10 p-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                លុបការស្នើសុំ
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5">
                សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="mt-4 bg-white/[0.06]" />

        <div className="px-6 pb-6 mt-4 space-y-4">
          <p className="text-sm text-slate-300">
            តើអ្នកពិតជាចង់លុប{" "}
            <span className="font-semibold text-white">
              &ldquo;{request?.issue_title}&rdquo;
            </span>{" "}
            មែនទេ?
          </p>

          {error && (
            <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="ghost"
              disabled={isDeleting}
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white hover:bg-white/[0.06]"
            >
              បោះបង់
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-500 text-white min-w-[100px]"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "លុបចោល"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
