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
import {
  DELETE_MODAL_CANCEL_BUTTON,
  DELETE_MODAL_CONFIRM_BUTTON,
  DELETE_MODAL_CONTENT,
  DELETE_MODAL_FOOTER,
  DELETE_MODAL_HEADER,
} from "@/components/ui/modal-styles";
import { toast } from "sonner";
import { deleteRoom } from "@/actions/rooms";
import { getErrorMessage } from "@/lib/utils";

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
    } catch (error) {
      toast.error(getErrorMessage(error, "មានបញ្ហាក្នុងការលុបបន្ទប់នេះ"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={DELETE_MODAL_CONTENT}>
        <DialogHeader className={DELETE_MODAL_HEADER}>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500">
            <AlertTriangle size={24} />
          </div>

          <DialogTitle className="text-lg font-bold leading-7">
            តើអ្នកពិតជាចង់លុបបន្ទប់នេះមែនទេ?
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm leading-6 text-(--panel-text-muted)">
            សកម្មភាពនេះមិនអាចត្រឡប់ថយក្រោយវិញបានឡើយ។ ទិន្នន័យបន្ទប់លេខ{" "}
            <span className="text-red-400 font-semibold font-mono text-base">
              #{room.room_number}
            </span>{" "}
            ({room.room_type}) នឹងត្រូវលុបចេញពី Database។
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className={DELETE_MODAL_FOOTER}>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className={DELETE_MODAL_CANCEL_BUTTON}
          >
            បោះបង់
          </Button>

          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={DELETE_MODAL_CONFIRM_BUTTON}
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
