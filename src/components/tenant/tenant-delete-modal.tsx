"use client";

import { useState } from "react";
import { Tenant } from "@/lib/validations/tenants";
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
import { deleteTenant } from "@/actions/tenants";
import { getErrorMessage } from "@/lib/utils";

interface TenantDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onDeleteSuccess: (tenantId: string) => void;
}

export default function TenantDeleteModal({
  isOpen,
  onClose,
  tenant,
  onDeleteSuccess,
}: TenantDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!tenant) return null;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteTenant(tenant.id);

      onDeleteSuccess(tenant.id);
      onClose();
      toast.success("បានលុបអ្នកជួលជោគជ័យ");
    } catch (error) {
      toast.error(getErrorMessage(error, "មានបញ្ហាក្នុងការលុបអ្នកជួលនេះ"));
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
            តើអ្នកពិតជាចង់លុបអ្នកជួលនេះមែនទេ?
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm leading-6 text-(--panel-text-muted)">
            សកម្មភាពនេះមិនអាចត្រឡប់ថយក្រោយវិញបានឡើយ។ ទិន្នន័យអ្នកជួល{" "}
            <span className="text-red-400 font-semibold">
              {tenant.full_name}
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
