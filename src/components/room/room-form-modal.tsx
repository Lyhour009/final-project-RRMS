"use client";

import React, { useEffect, useState, useRef, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, BedDouble, X, Plus } from "lucide-react";
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
  createRoomAction,
  updateRoomAction,
  uploadRoomImagesAction,
  deleteRoomImageAction,
} from "@/actions/rooms";
import {
  roomSchema,
  ROOM_FORM_DEFAULTS,
  type Room,
  type RoomFormValues,
  type RoomStatus,
} from "@/types/room";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RoomFormModalProps {
  room?: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (room: Room, type: "add" | "edit") => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROOM_TYPES = ["single", "double", "studio", "suite"] as const;

const STATUS_OPTIONS: { value: RoomStatus; label: string; color: string }[] = [
  { value: "available", label: "ទំនេរ", color: "text-emerald-400" },
  { value: "occupied", label: "កំពុងភ្ជាប់", color: "text-indigo-400" },
  { value: "maintenance", label: "ជួសជុល", color: "text-amber-400" },
];

// Common amenity suggestions for quick-add chips
const AMENITY_SUGGESTIONS = [
  "WiFi",
  "AC",
  "TV",
  "ទឹកក្តៅ",
  "ទូទឹកកក",
  "បន្ទប់ទឹក",
  "បាល់កុង",
  "កង្ហារ",
  "ទូ",
  "គ្រែ",
  "តុ",
  "កៅអី",
];

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
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
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ─── Amenities Tag Input ──────────────────────────────────────────────────────

function AmenitiesInput({
  value = [],
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInputValue("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    // Backspace on empty input removes last tag
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  // Suggestions not yet selected
  const remainingSuggestions = AMENITY_SUGGESTIONS.filter(
    (s) => !value.includes(s),
  );

  return (
    <div className="space-y-2">
      {/* Tag display + text input */}
      <div
        className="min-h-[42px] w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-2 flex flex-wrap gap-1.5 cursor-text focus-within:border-indigo-500/50 transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[11px] font-medium px-2 py-0.5 rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="text-indigo-400 hover:text-rose-400 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue) addTag(inputValue);
          }}
          placeholder={value.length === 0 ? "វាយ រួចចុច Enter ឬ ," : ""}
          className="flex-1 min-w-[100px] bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
        />
      </div>

      {/* Quick-add suggestion chips */}
      {remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-slate-200 border border-white/[0.06] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] px-2 py-0.5 rounded-md transition-all"
            >
              <Plus className="w-2.5 h-2.5" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Image Uploader ───────────────────────────────────────────────────────────

function ImageUploader({
  images,
  onUpload,
  onDelete,
  uploading,
}: {
  images: string[];
  onUpload: (files: FileList) => void;
  onDelete: (url: string) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url) => (
            <div
              key={url}
              className="relative group aspect-video rounded-lg overflow-hidden border border-white/[0.08]"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onDelete(url)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onUpload(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full py-2.5 border border-dashed border-white/[0.12] rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:border-white/25 transition-all flex items-center justify-center gap-2"
      >
        {uploading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        {uploading ? "កំពុង upload..." : "បន្ថែមរូបភាព"}
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RoomFormModal({
  room,
  open,
  onOpenChange,
  onSuccess,
}: RoomFormModalProps) {
  const isEditMode = !!room;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: ROOM_FORM_DEFAULTS,
  });

  const currentStatus = watch("status");
  const currentAmenities = watch("amenities") ?? [];

  // ─── Images state (managed outside RHF — uploaded separately) ──────────
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  // ─── Populate on open ──────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;

    if (isEditMode && room) {
      reset({
        roomNumber: room.room_number ?? "",
        roomType: room.room_type ?? "",
        basePrice: room.base_price?.toString() ?? "",
        status: room.status ?? "available",
        floor: room.floor?.toString() ?? "",
        maxOccupants: room.max_occupants?.toString() ?? "",
        description: room.description ?? "",
        amenities: Array.isArray(room.amenities) ? room.amenities : [],
      });
      setRoomImages(Array.isArray(room.images) ? room.images : []);
    } else {
      reset(ROOM_FORM_DEFAULTS);
      setRoomImages([]);
    }
  }, [open, room, isEditMode, reset]);

  // ─── Image handlers ────────────────────────────────────────────────────

  async function handleImageUpload(files: FileList) {
    if (!room?.id) return; // create mode: upload after room is created
    setImageUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const result = await uploadRoomImagesAction(room.id, fd);
    if (result.success) setRoomImages(result.urls ?? []);
    setImageUploading(false);
  }

  async function handleImageDelete(url: string) {
    if (!room?.id) return;
    const result = await deleteRoomImageAction(room.id, url);
    if (result.success) setRoomImages(result.urls ?? []);
  }

  // ─── Submit ────────────────────────────────────────────────────────────

  async function onSubmit(values: RoomFormValues) {
    try {
      const result = isEditMode
        ? await updateRoomAction(room!.id, values)
        : await createRoomAction(values);

      if (result.success && result.data) {
        onSuccess(result.data as Room, isEditMode ? "edit" : "add");
        onOpenChange(false);
      } else {
        setError("root", { message: result.error ?? "មានបញ្ហាមិនស្គាល់។" });
      }
    } catch (err: unknown) {
      setError("root", {
        message: err instanceof Error ? err.message : "មានបញ្ហាមិនស្គាល់។",
      });
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] font-khmer bg-slate-950/95 backdrop-blur-xl border-white/[0.08] text-white p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-white">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <BedDouble className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            {isEditMode
              ? `កែប្រែបន្ទប់ #${room?.room_number}`
              : "បង្កើតបន្ទប់ថ្មី"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "កែប្រែព័ត៌មានបន្ទប់ រួចចុចរក្សាទុក។"
              : "បំពេញព័ត៌មានបន្ទប់ថ្មី រួចចុចបង្កើត។"}
          </DialogDescription>
        </DialogHeader>

        <Separator className="mt-4 bg-white/[0.06]" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 pb-6 space-y-4 mt-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Row 1: Room number + Floor */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="លេខបន្ទប់"
              error={errors.roomNumber?.message}
              required
            >
              <Input
                {...register("roomNumber")}
                placeholder="101"
                className={cn(
                  "bg-white/[0.03] border-white/[0.08] text-white",
                  errors.roomNumber && "border-rose-500/50",
                )}
              />
            </Field>

            <Field label="ជាន់" error={errors.floor?.message}>
              <Input
                type="number"
                min="0"
                {...register("floor")}
                placeholder="1"
                className={cn(
                  "bg-white/[0.03] border-white/[0.08] text-white",
                  errors.floor && "border-rose-500/50",
                )}
              />
            </Field>
          </div>

          {/* Row 2: Room type + Max occupants */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="ប្រភេទបន្ទប់"
              error={errors.roomType?.message}
              required
            >
              <select
                {...register("roomType")}
                className={cn(
                  "w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-md px-3 py-2 text-sm outline-none focus:border-indigo-500/50 transition-colors",
                  errors.roomType && "border-rose-500/50",
                )}
              >
                <option value="" className="bg-slate-900">
                  ជ្រើសរើស...
                </option>
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="ចំនួនអ្នករស់នៅ" error={errors.maxOccupants?.message}>
              <Input
                type="number"
                min="1"
                {...register("maxOccupants")}
                placeholder="2"
                className={cn(
                  "bg-white/[0.03] border-white/[0.08] text-white",
                  errors.maxOccupants && "border-rose-500/50",
                )}
              />
            </Field>
          </div>

          {/* Base price */}
          <Field
            label="តម្លៃជួល ($/ខែ)"
            error={errors.basePrice?.message}
            required
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
                $
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                {...register("basePrice")}
                placeholder="150"
                className={cn(
                  "bg-white/[0.03] border-white/[0.08] text-white pl-7",
                  errors.basePrice && "border-rose-500/50",
                )}
              />
            </div>
          </Field>

          {/* Status buttons */}
          <Field label="ស្ថានភាព" error={errors.status?.message} required>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue("status", opt.value, { shouldValidate: true })
                  }
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-medium border transition-all",
                    currentStatus === opt.value
                      ? "border-indigo-500/50 bg-indigo-500/10 text-white"
                      : "border-white/[0.08] bg-white/[0.02] text-slate-500 hover:text-slate-300 hover:border-white/20",
                  )}
                >
                  <span
                    className={currentStatus === opt.value ? opt.color : ""}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          {/* Description */}
          <Field label="ការពណ៌នា" error={errors.description?.message}>
            <textarea
              {...register("description")}
              placeholder="ពណ៌នាអំពីបន្ទប់..."
              rows={2}
              className={cn(
                "w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-md px-3 py-2 text-sm outline-none resize-none focus:border-indigo-500/50 transition-colors",
                errors.description && "border-rose-500/50",
              )}
            />
          </Field>

          {/* Amenities — tag input backed by string[] */}
          <Field label="សម្ភារៈ" error={errors.amenities?.message}>
            <AmenitiesInput
              value={currentAmenities}
              onChange={(tags) =>
                setValue("amenities", tags, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
          </Field>

          {/* Room images — edit mode only (need ID to upload) */}
          {isEditMode && (
            <Field label="រូបភាពបន្ទប់">
              <ImageUploader
                images={roomImages}
                onUpload={handleImageUpload}
                onDelete={handleImageDelete}
                uploading={imageUploading}
              />
            </Field>
          )}
          {!isEditMode && (
            <p className="text-[11px] text-slate-500 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
              💡 បង្កើតបន្ទប់ជាមុនសិន រួចទើប upload រូបភាពបាន។
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
                "បង្កើតបន្ទប់"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
