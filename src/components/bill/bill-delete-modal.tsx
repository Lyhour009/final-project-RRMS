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
import { toast } from "sonner";
import { deleteBill } from "@/actions/bills";

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
    } catch (error: any) {
      toast.error(
        error.message || "មានបញ្ហាក្នុងការលុបវិក្កយបត្រនេះ។ សូមព្យាយាមម្ដងទៀត។",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-[#131626] border-zinc-800 text-white rounded-xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle size={24} />
          </div>

          <DialogTitle className="text-xl font-bold">
            តើអ្នកពិតជាចង់លុបវិក្កយបត្រនេះមែនទេ?
          </DialogTitle>

          <DialogDescription className="text-zinc-400 text-sm">
            សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ។ វិក្កយបត្ររបស់{" "}
            <span className="text-red-400 font-semibold">
              {bill.profiles?.full_name || "អ្នកជួល"}
            </span>{" "}
            នឹងត្រូវលុបចេញពីប្រព័ន្ធជារៀងរហូត។
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex sm:justify-center gap-2 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
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
