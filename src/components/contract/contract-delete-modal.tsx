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
import { toast } from "sonner";
import { deleteContract } from "@/actions/contracts";

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
    } catch (error: any) {
      toast.error(error.message || "មានបញ្ហាក្នុងការលុបកិច្ចសន្យានេះ");
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
            តើអ្នកពិតជាចង់លុបកិច្ចសន្យានេះមែនទេ?
          </DialogTitle>

          <DialogDescription className="text-(--panel-text-muted) text-sm">
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
