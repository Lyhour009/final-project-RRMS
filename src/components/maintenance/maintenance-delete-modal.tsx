"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { deleteMaintenanceRequest } from "@/actions/maintenances";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DELETE_MODAL_CANCEL_BUTTON, DELETE_MODAL_CONFIRM_BUTTON, DELETE_MODAL_CONTENT, DELETE_MODAL_FOOTER, DELETE_MODAL_HEADER } from "@/components/ui/modal-styles";
import type { MaintenanceRequestItem } from "./maintenance-table";

export default function MaintenanceDeleteModal({ request, isOpen, onClose, onDeleteSuccess }: { request: MaintenanceRequestItem | null; isOpen: boolean; onClose: () => void; onDeleteSuccess: (requestId: string) => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  if (!request) return null;
  const handleDelete = async () => { setIsDeleting(true); try { await deleteMaintenanceRequest(request.id); onDeleteSuccess(request.id); onClose(); toast.success("បានលុបសំណើជួសជុល"); } catch (error) { toast.error(error instanceof Error ? error.message : "មានបញ្ហាក្នុងការលុបសំណើ"); } finally { setIsDeleting(false); } };
  return <Dialog open={isOpen} onOpenChange={onClose}><DialogContent className={DELETE_MODAL_CONTENT}><DialogHeader className={DELETE_MODAL_HEADER}><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500"><AlertTriangle size={24} /></div><DialogTitle className="text-lg font-bold leading-7">តើអ្នកពិតជាចង់លុបសំណើនេះមែនទេ?</DialogTitle><DialogDescription className="mt-2 text-sm leading-6 text-(--panel-text-muted)">សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។ សំណើ <span className="font-semibold text-red-500">{request.issue_title}</span> នឹងត្រូវលុបចេញពីប្រព័ន្ធ។</DialogDescription></DialogHeader><DialogFooter className={DELETE_MODAL_FOOTER}><Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting} className={DELETE_MODAL_CANCEL_BUTTON}>បោះបង់</Button><Button type="button" onClick={handleDelete} disabled={isDeleting} className={DELETE_MODAL_CONFIRM_BUTTON}>{isDeleting ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> កំពុងលុប...</span> : "យល់ព្រមលុប"}</Button></DialogFooter></DialogContent></Dialog>;
}
