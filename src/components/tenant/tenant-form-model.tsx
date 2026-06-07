"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, UserPlus, X, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  createTenantAction,
  updateTenantAction,
  uploadIdCardImagesAction,
  deleteIdCardImageAction,
} from "@/actions/tenants";
import {
  getTenantSchema,
  TENANT_FORM_DEFAULTS,
  type Tenant,
  type TenantFormValues,
} from "@/types/tenant";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TenantFormModalProps {
  tenant?: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (tenant: Tenant, type: "add" | "edit") => void;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}
      {!error && hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TenantFormModal({
  tenant,
  open,
  onOpenChange,
  onSuccess,
}: TenantFormModalProps) {
  const isEditMode = !!tenant;

  // Schema changes between create (email required) and edit (email optional)
  const schema = useMemo(() => getTenantSchema(isEditMode), [isEditMode]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: TENANT_FORM_DEFAULTS,
  });

  // ─── Populate on open ──────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    reset({
      fullName: tenant?.full_name ?? "",
      phoneNumber: tenant?.phone_number ?? "",
      email: "",
    });
    setIdCardImages(
      Array.isArray(tenant?.id_card_images) ? tenant.id_card_images : [],
    );
  }, [open, tenant, reset]);

  // ─── ID card image state ───────────────────────────────────────────────

  const [idCardImages, setIdCardImages] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(files: FileList) {
    if (!tenant?.id) return;
    setImageUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const result = await uploadIdCardImagesAction(tenant.id, fd);
    if (result.success) setIdCardImages(result.urls ?? []);
    setImageUploading(false);
  }

  async function handleImageDelete(url: string) {
    if (!tenant?.id) return;
    const result = await deleteIdCardImageAction(tenant.id, url);
    if (result.success) setIdCardImages(result.urls ?? []);
  }

  // ─── Submit ────────────────────────────────────────────────────────────

  const onSubmit = async (data: TenantFormValues) => {
    try {
      const result = isEditMode
        ? await updateTenantAction(tenant!.id, data)
        : await createTenantAction(data);

      if (result.success) {
        // Derive the ID: from server response on create, from existing on edit
        const resolvedId = isEditMode
          ? tenant!.id
          : "id" in result && typeof result.id === "string"
            ? result.id
            : crypto.randomUUID();

        onSuccess(
          {
            ...(tenant ?? {}),
            id: resolvedId,
            full_name: data.fullName,
            phone_number: data.phoneNumber,
            role: "tenant",
            created_at: tenant?.created_at ?? new Date().toISOString(),
            contracts: tenant?.contracts ?? [],
          },
          isEditMode ? "edit" : "add",
        );
        onOpenChange(false);
      } else {
        setError("root", { message: result.error ?? "មានបញ្ហាមិនស្គាល់។" });
      }
    } catch (err: unknown) {
      setError("root", {
        message: err instanceof Error ? err.message : "មានបញ្ហាមិនស្គាល់។",
      });
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] font-khmer bg-slate-950/95 backdrop-blur-xl border-white/[0.08] text-white p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-500/10 border border-indigo-500/20 p-2.5">
              <UserPlus className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-snug">
                {isEditMode
                  ? `កែប្រែ — ${tenant.full_name}`
                  : "បន្ថែមអ្នកជួលថ្មី"}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5">
                {isEditMode
                  ? "កែប្រែព័ត៌មានអ្នកជួល រួចរក្សាទុក។"
                  : "បំពេញព័ត៌មានខាងក្រោម ដើម្បីបង្កើតគណនី។"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="mt-4 bg-white/[0.06]" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 pb-6 space-y-4 mt-4"
        >
          {/* Full Name */}
          <Field label="ឈ្មោះពេញ" error={errors.fullName?.message} required>
            <Input
              {...register("fullName")}
              placeholder="គន្ធី សុខា"
              className={cn(
                "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600",
                errors.fullName && "border-rose-500/50",
              )}
            />
          </Field>

          {/* Phone */}
          <Field
            label="លេខទូរស័ព្ទ"
            error={errors.phoneNumber?.message}
            required
          >
            <Input
              {...register("phoneNumber")}
              placeholder="012 345 678"
              className={cn(
                "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600",
                errors.phoneNumber && "border-rose-500/50",
              )}
            />
          </Field>

          {/* Email — create mode only */}
          {!isEditMode && (
            <Field
              label="អ៊ីម៉ែល"
              error={errors.email?.message}
              hint="អ្នកជួលនឹងទទួលបានលិខិតអញ្ជើញតាមអ៊ីម៉ែលនេះ។"
              required
            >
              <Input
                type="email"
                {...register("email")}
                placeholder="example@email.com"
                className={cn(
                  "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600",
                  errors.email && "border-rose-500/50",
                )}
              />
            </Field>
          )}

          {/* ID Card Images — edit mode only */}
          {isEditMode && (
            <Field label="រូប អត្តសញ្ញាណប័ណ្ណ">
              {/* Preview grid */}
              {idCardImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {idCardImages.map((url) => (
                    <div
                      key={url}
                      className="relative group aspect-video rounded-lg overflow-hidden border border-white/[0.08]"
                    >
                      <img
                        src={url}
                        alt="ID card"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(url)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleImageUpload(e.target.files)
                }
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={imageUploading}
                className="w-full py-2.5 border border-dashed border-white/[0.12] rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:border-white/25 transition-all flex items-center justify-center gap-2"
              >
                {imageUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {imageUploading ? "កំពុង upload..." : "បន្ថែមរូប ID Card"}
              </button>
            </Field>
          )}
          {!isEditMode && (
            <p className="text-[11px] text-slate-500 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
              💡 បង្កើតគណនីជាមុនសិន រួចទើប upload រូប ID Card បាន។
            </p>
          )}

          {/* Root / server error */}
          {errors.root && (
            <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white hover:bg-white/[0.06]"
            >
              បោះបង់
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (isEditMode && !isDirty)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[120px] transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditMode ? (
                "រក្សាទុក"
              ) : (
                "បង្កើតគណនី"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
