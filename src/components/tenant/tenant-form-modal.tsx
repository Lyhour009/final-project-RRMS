"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UploadCloud, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FORM_MODAL_BODY,
  FORM_MODAL_CONTENT,
  FORM_MODAL_DESCRIPTION,
  FORM_MODAL_FOOTER,
  FORM_MODAL_HEADER,
  FORM_MODAL_ICON,
  FORM_MODAL_SCROLL_AREA,
  FORM_MODAL_TITLE,
  MODAL_PRIMARY_BUTTON,
  MODAL_SECONDARY_BUTTON,
} from "@/components/ui/modal-styles";

import {
  Tenant,
  tenantSchema,
  TenantFormValues,
} from "@/lib/validations/tenants";
import { upsertTenant } from "@/actions/tenants";

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Tenant | null;
  onSuccess?: (tenant: Tenant) => void;
}

export default function TenantModal({
  isOpen,
  onClose,
  tenant,
  onSuccess,
}: TenantModalProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isEditMode = !!tenant;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      password: "",
    },
  });

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      if (!isOpen) return;

      if (tenant) {
        reset({
          full_name: tenant.full_name || "",
          email: tenant.email || "",
          phone_number: tenant.phone_number || "",
          password: "",
        });

        setPreview(tenant.id_card_images?.[0] || null);
      } else {
        reset({
          full_name: "",
          email: "",
          phone_number: "",
          password: "",
        });

        setPreview(null);
      }

      setShowPassword(false);
    }, 0);

    return () => window.clearTimeout(resetTimer);
  }, [isOpen, tenant, reset]);

  async function onSubmit(values: TenantFormValues) {
    setLoading(true);

    const formData = new FormData();

    formData.append("full_name", values.full_name);
    formData.append("email", values.email);
    formData.append("phone_number", values.phone_number);
    formData.append("password", values.password || "");

    if (values.id_card_image) {
      formData.append("id_card_image", values.id_card_image);
    }

    try {
      const result = await upsertTenant(tenant?.id || null, formData);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        isEditMode ? "បានកែប្រែអ្នកជួលជោគជ័យ" : "បានបង្កើតអ្នកជួលថ្មីជោគជ័យ",
      );

      if (onSuccess) {
        onSuccess(result.data as Tenant);
      }

      onClose();
    } catch {
      toast.error("មានបញ្ហាខុសបច្ចេកទេស");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${FORM_MODAL_CONTENT} sm:max-w-xl`}>
        <DialogHeader className={FORM_MODAL_HEADER}>
          <DialogTitle className={FORM_MODAL_TITLE}>
            <span className={FORM_MODAL_ICON}><UserPlus className="h-5 w-5" /></span>
            {isEditMode ? "កែប្រែអ្នកជួល" : "បន្ថែមអ្នកជួលថ្មី"}
          </DialogTitle>
          <DialogDescription className={FORM_MODAL_DESCRIPTION}>
            បញ្ចូលព័ត៌មានទំនាក់ទំនង និងអត្តសញ្ញាណប័ណ្ណអ្នកជួល
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={FORM_MODAL_BODY}>
          <div className={FORM_MODAL_SCROLL_AREA}>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--panel-border) bg-(--panel) p-3 transition hover:border-indigo-500/35">
            {preview ? (
              <div className="relative w-full h-44">
                <img
                  src={preview}
                  className="w-full h-full object-cover rounded-lg"
                  alt="ID Card Preview"
                />

                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setValue("id_card_image", undefined, {
                      shouldValidate: true,
                    });
                  }}
                  className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex w-full cursor-pointer flex-col items-center rounded-xl py-8 transition hover:bg-(--panel-hover)/45">
                <UploadCloud size={40} className="text-(--panel-text-subtle) mb-2" />

                <span className="text-sm text-(--panel-text-muted)">
                  ផ្ទេរឡើងរូបអត្តសញ្ញាណប័ណ្ណ
                </span>

                <span className="text-xs text-(--panel-text-subtle) mt-1">
                  JPG, PNG, WEBP / អតិបរមា 5MB
                </span>

                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      setValue("id_card_image", file, {
                        shouldValidate: true,
                      });
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            )}

            {errors.id_card_image && (
              <p className="text-xs text-red-400 mt-1">
                {errors.id_card_image.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-(--panel-text-muted)">ឈ្មោះពេញ</Label>

            <Input
              className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
              placeholder="ឧទាហរណ៍៖ សុខ សំណាង"
              {...register("full_name")}
            />

            {errors.full_name && (
              <p className="text-xs text-red-400">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-(--panel-text-muted)">អ៊ីមែល</Label>

            <Input
              type="email"
              className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
              placeholder="tenant@example.com"
              {...register("email")}
            />

            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-(--panel-text-muted)">លេខទូរស័ព្ទ</Label>

            <Input
              className="bg-(--panel) border-(--panel-border) text-(--panel-text)"
              placeholder="ឧទាហរណ៍៖ 087640628"
              {...register("phone_number")}
            />

            {errors.phone_number && (
              <p className="text-xs text-red-400">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-(--panel-text-muted)">
              លេខកូដសម្ងាត់{" "}
              {isEditMode && (
                <span className="text-xs text-(--panel-text-subtle)">
                  (ទុកទទេ បើមិនចង់ប្តូរ)
                </span>
              )}
            </Label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                className="bg-(--panel) border-(--panel-border) text-(--panel-text) pr-10"
                placeholder={
                  isEditMode
                    ? "បញ្ចូលលេខកូដថ្មី ប្រសិនបើចង់ប្តូរ"
                    : "យ៉ាងតិច 6 ខ្ទង់"
                }
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--panel-text-muted) hover:text-(--panel-text)"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          </div>
          <div className={FORM_MODAL_FOOTER}>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className={MODAL_SECONDARY_BUTTON}
            >
              បោះបង់
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className={MODAL_PRIMARY_BUTTON}
            >
              {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
