"use client";

import { useState } from "react";
import { Room } from "@/lib/validations/room";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { deleteRoom } from "@/actions/rooms";

interface RoomDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onDeleteSuccess: (roomId: string) => void;
}

export default function RoomDeleteModal({
  isOpen,
  onClose,
  room,
  onDeleteSuccess,
}: RoomDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!room) return null;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteRoom(room.id);

      onDeleteSuccess(room.id);
      onClose();
      toast.success("បានលុបបន្ទប់ជោគជ័យ");
    } catch (error: any) {
      toast.error(error.message || "មានបញ្ហាក្នុងការលុបបន្ទប់នេះ");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-(--panel) border-(--panel-border) text-(--panel-text) rounded-xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle size={24} />
          </div>

          <DialogTitle className="text-xl font-bold">
            តើអ្នកពិតជាចង់លុបបន្ទប់នេះមែនទេ?
          </DialogTitle>

          <DialogDescription className="text-(--panel-text-muted) text-sm">
            សកម្មភាពនេះមិនអាចត្រឡប់ថយក្រោយវិញបានឡើយ។ ទិន្នន័យបន្ទប់លេខ{" "}
            <span className="text-red-400 font-semibold font-mono text-base">
              #{room.room_number}
            </span>{" "}
            ({room.room_type}) នឹងត្រូវលុបចេញពី Database។
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex sm:justify-center gap-2 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-(--panel-hover) border border-(--panel-border) text-(--panel-text-muted) hover:bg-(--panel-border) hover:text-(--panel-text)"
          >
            បោះបង់
          </Button>

          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium min-w-[100px]"
          >
            {isDeleting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>កំពុងលុប...</span>
              </div>
            ) : (
              "យល់ព្រមលុប"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
