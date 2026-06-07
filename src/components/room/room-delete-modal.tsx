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
import { deleteRoomAction } from "@/actions/rooms";
import type { Room } from "@/types/room";
import { toast } from "sonner";

interface DeleteRoomModalProps {
  room?: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (id: string) => void;
}

export default function DeleteRoomModal({
  room,
  open,
  onOpenChange,
  onSuccess,
}: DeleteRoomModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!room) return;
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deleteRoomAction(room.id);
      if (result.success) {
        onSuccess(room.id);
        onOpenChange(false);
        toast.success("បានលុបបន្ទប់ដោយជោគជ័យ!");
      } else {
        setError(result.error ?? "មានបញ្ហាមិនស្គាល់។");
        toast.error("មានបញ្ហាមិនស្គាល់។");
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
                លុបបន្ទប់
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
            តើអ្នកពិតជាចង់លុបបន្ទប់{" "}
            <span className="font-semibold text-white">
              #{room?.room_number}
            </span>{" "}
            មែនទេ? ទិន្នន័យបន្ទប់នឹងត្រូវបានលុបចោលជាអចិន្ត្រៃយ៍។
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
