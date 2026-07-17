"use client";

import { useState } from "react";
import { Bill } from "@/lib/validations/bills";
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
import { deleteBill } from "@/actions/bills";
import { getErrorMessage } from "@/lib/utils";

interface BillDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onDeleteSuccess: (billId: string) => void;
}

export default function BillDeleteModal({
  isOpen,
  onClose,
  bill,
  onDeleteSuccess,
}: BillDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!bill) return null;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteBill(bill.id);

      onDeleteSuccess(bill.id);

      toast.success("បានលុបវិក្កយបត្រជោគជ័យ");

      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "មានបញ្ហាក្នុងការលុបវិក្កយបត្រនេះ។ សូមព្យាយាមម្ដងទៀត។"));
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
            តើអ្នកពិតជាចង់លុបវិក្កយបត្រនេះមែនទេ?
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm leading-6 text-(--panel-text-muted)">
            សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ។ វិក្កយបត្ររបស់{" "}
            <span className="text-red-400 font-semibold">
              {bill.profiles?.full_name || "អ្នកជួល"}
            </span>{" "}
            នឹងត្រូវលុបចេញពីប្រព័ន្ធជារៀងរហូត។
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
