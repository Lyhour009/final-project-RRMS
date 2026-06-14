"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roomSchema, RoomFormValues, Room } from "@/lib/validations/room";
import { upsertRoom } from "@/actions/rooms";
import { toast } from "sonner";
import { X, UploadCloud } from "lucide-react";
import Image from "next/image";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room | null;
  onSuccess?: (room: Room) => void;
}

export default function RoomModal({
  isOpen,
  onClose,
  room,
  onSuccess,
}: RoomModalProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [amenityInput, setAmenityInput] = useState("");
  const isEditMode = !!room;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      room_number: "",
      room_type: "",
      base_price: 0,
      status: "available",
      floor: 1,
      max_occupants: 1,
      description: "",
      amenities: [],
    },
  });

  const statusValue = watch("status");
  const roomTypeValue = watch("room_type");
  const floorValue = watch("floor") ? String(watch("floor")) : undefined;
  const currentAmenities = watch("amenities") || [];

  useEffect(() => {
    if (isOpen) {
      if (room) {
        reset({
          room_number: room.room_number,
          room_type: room.room_type,
          base_price: room.base_price,
          status: room.status,
          floor: room.floor,
          max_occupants: room.max_occupants,
          description: room.description || "",
          amenities: room.amenities || [],
        });

        setPreview(room.images?.[0] || null);
        setAmenityInput("");
      } else {
        reset({
          room_number: "",
          room_type: "",
          base_price: 0,
          status: "available",
          floor: 1,
          max_occupants: 1,
          description: "",
          amenities: [],
        });

        setPreview(null);
        setAmenityInput("");
      }
    }
  }, [room, isOpen, reset]);

  const handleAddAmenity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && amenityInput.trim()) {
      e.preventDefault();

      const newAmenity = amenityInput.trim();

      if (!currentAmenities.includes(newAmenity)) {
        setValue("amenities", [...currentAmenities, newAmenity], {
          shouldValidate: true,
        });
      }

      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (indexToRemove: number) => {
    setValue(
      "amenities",
      currentAmenities.filter((_, index) => index !== indexToRemove),
      { shouldValidate: true },
    );
  };

  async function onSubmit(values: RoomFormValues) {
    setLoading(true);

    const formData = new FormData();

    formData.append("room_number", values.room_number);
    formData.append("room_type", values.room_type);
    formData.append("base_price", String(values.base_price));
    formData.append("status", values.status);
    formData.append("floor", String(values.floor));
    formData.append("max_occupants", String(values.max_occupants));
    formData.append("description", values.description || "");
    formData.append("amenities", JSON.stringify(values.amenities || []));

    if (values.image) {
      formData.append("image", values.image);
    } else if (room?.images?.[0]) {
      formData.append("existing_image_url", room.images[0]);
    }

    try {
      const result = await upsertRoom(room?.id || null, formData);

      toast.success(
        isEditMode ? "បានកែប្រែបន្ទប់ជោគជ័យ" : "បានបង្កើតបន្ទប់ថ្មីជោគជ័យ",
      );

      if (onSuccess && result) {
        onSuccess(result);
      }

      onClose();
    } catch (error: any) {
      if (error.message?.includes("23505") || error.code === "23505") {
        toast.error(
          `លេខបន្ទប់ #${values.room_number} មានក្នុងប្រព័ន្ធរួចរាល់ហើយ! សូមប្រើលេខផ្សេង។`,
        );
      } else {
        toast.error(error.message || "មានបញ្ហាខុសបច្ចេកទេស");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0d19] text-white border-zinc-800 max-w-xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-100">
            {isEditMode ? "📝 កែប្រែព័ត៌មានបន្ទប់" : "🏢 លម្អិតការបន្ថែមបន្ទប់"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl p-4 bg-[#131626]">
            {preview ? (
              <div className="relative w-full h-44">
                <img
                  src={preview}
                  className="w-full h-full object-cover rounded-lg"
                  alt="Preview"
                />

                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setValue("image", undefined, { shouldValidate: true });
                  }}
                  className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center py-6 w-full">
                <UploadCloud size={40} className="text-zinc-500 mb-2" />

                <span className="text-sm text-zinc-400">
                  ផ្ទេរឡើងរូបភាព (Upload Image)
                </span>

                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      setValue("image", file, { shouldValidate: true });
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            )}

            {errors.image && (
              <p className="text-xs text-red-400 mt-1">
                {errors.image.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400">លេខបន្ទប់</Label>

              <Input
                disabled={isEditMode}
                className="bg-[#131626] border-zinc-800 text-white disabled:opacity-50 disabled:bg-zinc-900"
                placeholder="ឧទាហរណ៍៖ 006"
                {...register("room_number")}
              />

              {errors.room_number && (
                <p className="text-xs text-red-400">
                  {errors.room_number.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400">ចំនួនអ្នកស្នាក់នៅអតិបរមា</Label>

              <Input
                type="number"
                min={1}
                step={1}
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("max_occupants", { valueAsNumber: true })}
              />

              {errors.max_occupants && (
                <p className="text-xs text-red-400">
                  {errors.max_occupants.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400">ប្រភេទបន្ទប់</Label>

              <Select
                value={roomTypeValue}
                onValueChange={(value) =>
                  setValue("room_type", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-[#131626] border-zinc-800 text-white">
                  <SelectValue placeholder="ជ្រើសរើសប្រភេទបន្ទប់" />
                </SelectTrigger>

                <SelectContent className="bg-[#131626] border-zinc-800 text-white">
                  <SelectItem className="text-xs" value="បន្ទប់គ្រែមួយ">
                    បន្ទប់គ្រែមួយ
                  </SelectItem>

                  <SelectItem className="text-xs" value="បន្ទប់គ្រែពីរ">
                    បន្ទប់គ្រែពីរ
                  </SelectItem>

                  <SelectItem className="text-xs" value="បន្ទប់គ្រួសារ">
                    បន្ទប់គ្រួសារ (Family)
                  </SelectItem>

                  <SelectItem className="text-xs" value="បន្ទប់វីអាយភី">
                    បន្ទប់វីអាយភី (VIP)
                  </SelectItem>
                </SelectContent>
              </Select>

              {errors.room_type && (
                <p className="text-xs text-red-400">
                  {errors.room_type.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400">ស្ថានភាព</Label>

              <Select
                value={statusValue}
                onValueChange={(value: Room["status"]) =>
                  setValue("status", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-[#131626] border-zinc-800 text-white">
                  <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                </SelectTrigger>

                <SelectContent className="bg-[#131626] border-zinc-800 text-white">
                  <SelectItem className="text-xs" value="available">
                    ទំនេរ (Available)
                  </SelectItem>

                  <SelectItem className="text-xs" value="occupied">
                    មានមនុស្ស (Occupied)
                  </SelectItem>

                  <SelectItem className="text-xs" value="maintenance">
                    ជួសជុល (Maintenance)
                  </SelectItem>
                </SelectContent>
              </Select>

              {errors.status && (
                <p className="text-xs text-red-400">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400">ជាន់</Label>

              <Select
                value={floorValue}
                onValueChange={(value) =>
                  setValue("floor", Number(value), { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-[#131626] border-zinc-800 text-white">
                  <SelectValue placeholder="ជ្រើសរើសជាន់" />
                </SelectTrigger>

                <SelectContent className="bg-[#131626] border-zinc-800 text-white text-xs">
                  <SelectItem className="text-xs" value="1">
                    ជាន់ផ្ទាល់ដី (ជាន់ទី ១)
                  </SelectItem>

                  <SelectItem className="text-xs" value="2">
                    ជាន់ទី ២
                  </SelectItem>

                  <SelectItem className="text-xs" value="3">
                    ជាន់ទី ៣
                  </SelectItem>

                  <SelectItem className="text-xs" value="4">
                    ជាន់ទី ៤
                  </SelectItem>

                  <SelectItem className="text-xs" value="5">
                    ជាន់ទី ៥
                  </SelectItem>
                </SelectContent>
              </Select>

              {errors.floor && (
                <p className="text-xs text-red-400">{errors.floor.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400">តម្លៃ/ខែ ($)</Label>

              <Input
                type="number"
                min={1}
                step="0.01"
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("base_price", { valueAsNumber: true })}
              />

              {errors.base_price && (
                <p className="text-xs text-red-400">
                  {errors.base_price.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-400">
              គ្រឿងបរិក្ខារ (វាយរួចចុច Enter)
            </Label>

            <Input
              className="bg-[#131626] border-zinc-800 text-white"
              placeholder="ឧទាហរណ៍៖ ម៉ាស៊ីនត្រជាក់, ទូទឹកកក"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={handleAddAmenity}
            />

            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {currentAmenities.map((amenity: string, index: number) => (
                <span
                  key={`${amenity}-${index}`}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                >
                  {amenity}

                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(index)}
                    className="hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {errors.amenities && (
              <p className="text-xs text-red-400">
                {errors.amenities.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-400">ពិពណ៌នាបន្ទប់ (Description)</Label>

            <textarea
              rows={5}
              className="w-full rounded-md bg-[#131626] border border-zinc-800 text-white p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 resize-y"
              placeholder="ព័ត៌មានបន្ថែមពីបន្ទប់..."
              {...register("description")}
            />

            {errors.description && (
              <p className="text-xs text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800/60">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              បោះបង់
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
            >
              {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
