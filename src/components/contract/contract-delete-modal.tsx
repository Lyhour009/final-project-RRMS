"use client";

import { useState } from "react";
import { Contract } from "@/lib/validations/contracts";
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
import { deleteContract } from "@/actions/contracts";
import { getErrorMessage } from "@/lib/utils";

interface ContractDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onDeleteSuccess: (contractId: string) => void;
}

export default function ContractDeleteModal({
  isOpen,
  onClose,
  contract,
  onDeleteSuccess,
}: ContractDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!contract) return null;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteContract(contract.id);

      onDeleteSuccess(contract.id);
      onClose();
      toast.success("បានលុបកិច្ចសន្យាជោគជ័យ");
    } catch (error) {
      toast.error(getErrorMessage(error, "មានបញ្ហាក្នុងការលុបកិច្ចសន្យានេះ"));
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
            តើអ្នកពិតជាចង់លុបកិច្ចសន្យានេះមែនទេ?
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm leading-6 text-(--panel-text-muted)">
            សកម្មភាពនេះមិនអាចត្រឡប់ថយក្រោយវិញបានឡើយ។ កិច្ចសន្យារបស់{" "}
            <span className="text-red-400 font-semibold">
              {contract.profiles?.full_name || "អ្នកជួល"}
            </span>{" "}
            បន្ទប់{" "}
            <span className="text-red-400 font-semibold">
              #{contract.rooms?.room_number || "-"}
            </span>{" "}
            នឹងត្រូវលុបចេញពីប្រព័ន្ធ។
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
