"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
} from "@/components/ui/select";

import {
  Contract,
  contractSchema,
  ContractFormValues,
  ContractStatus,
} from "@/lib/validations/contracts";
import { upsertContract } from "@/actions/contracts";

interface TenantOption {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
}

interface RoomOption {
  id: string;
  room_number: string;
  room_type: string;
  base_price: number;
  floor: number;
  status: string;
}

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract | null;
  tenants: TenantOption[];
  rooms: RoomOption[];
  onSuccess?: (contract: Contract) => void;
}

const STATUS_LABELS: Record<ContractStatus, string> = {
  active: "សកម្ម (Active)",
  pending: "កំពុងរង់ចាំ (Pending)",
  expired: "អស់សុពលភាព (Expired)",
  terminated: "បានបញ្ចប់ (Terminated)",
};

export default function ContractModal({
  isOpen,
  onClose,
  contract,
  tenants,
  rooms,
  onSuccess,
}: ContractModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditMode = !!contract;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      tenant_id: "",
      room_id: "",
      start_date: "",
      end_date: "",
      deposit_amount: 0,
      status: "active",
      due_day: 5,
    },
  });

  const tenantIdValue = watch("tenant_id");
  const roomIdValue = watch("room_id");
  const statusValue = watch("status");

  useEffect(() => {
    if (isOpen) {
      if (contract) {
        reset({
          tenant_id: contract.tenant_id,
          room_id: contract.room_id,
          start_date: contract.start_date?.slice(0, 10) || "",
          end_date: contract.end_date?.slice(0, 10) || "",
          deposit_amount: contract.deposit_amount,
          status: contract.status,
          due_day: contract.due_day,
        });
      } else {
        reset({
          tenant_id: "",
          room_id: "",
          start_date: "",
          end_date: "",
          deposit_amount: 0,
          status: "active",
          due_day: 5,
        });
      }
    }
  }, [isOpen, contract, reset]);

  const roomsForDropdown = useMemo(() => {
    if (!isEditMode || !contract?.room_id) {
      return rooms.filter((room) => room.status === "available");
    }

    return rooms.filter(
      (room) => room.status === "available" || room.id === contract.room_id,
    );
  }, [rooms, isEditMode, contract]);

  const selectedTenant = tenants.find((tenant) => tenant.id === tenantIdValue);
  const selectedRoom = roomsForDropdown.find((room) => room.id === roomIdValue);

  const onSubmit = async (values: ContractFormValues) => {
    setLoading(true);

    const formData = new FormData();

    formData.append("tenant_id", values.tenant_id);
    formData.append("room_id", values.room_id);
    formData.append("start_date", values.start_date);
    formData.append("end_date", values.end_date);
    formData.append("deposit_amount", String(values.deposit_amount));
    formData.append("status", values.status);
    formData.append("due_day", String(values.due_day));

    try {
      const result = await upsertContract(contract?.id || null, formData);

      toast.success(
        isEditMode
          ? "បានកែប្រែកិច្ចសន្យាជោគជ័យ"
          : "បានបង្កើតកិច្ចសន្យាថ្មីជោគជ័យ",
      );

      if (onSuccess && result) {
        onSuccess(result);
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || "មានបញ្ហាខុសបច្ចេកទេស");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0d19] text-white border-zinc-800 max-w-xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-100">
            {isEditMode
              ? "📝 កែប្រែកិច្ចសន្យាជួល"
              : "📋 បន្ថែមកិច្ចសន្យាជួលថ្មី"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-zinc-400">អ្នកជួល</Label>

            <Select
              value={tenantIdValue}
              onValueChange={(value) =>
                setValue("tenant_id", value ? value : "", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="bg-[#131626] border-zinc-800 text-white">
                <span
                  className={selectedTenant ? "text-white" : "text-zinc-500"}
                >
                  {selectedTenant
                    ? `${selectedTenant.full_name} (${selectedTenant.phone_number})`
                    : "ជ្រើសរើសអ្នកជួល..."}
                </span>
              </SelectTrigger>

              <SelectContent className="bg-[#131626] border-zinc-800 text-white w-fit">
                {tenants.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    មិនមានអ្នកជួលឡើយ
                  </SelectItem>
                ) : (
                  tenants.map((tenant) => (
                    <SelectItem
                      key={tenant.id}
                      value={tenant.id}
                      className="text-xs"
                    >
                      {tenant.full_name}{" "}
                      <span className="text-zinc-500">
                        ({tenant.phone_number})
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {errors.tenant_id && (
              <p className="text-xs text-red-400">{errors.tenant_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-400">បន្ទប់</Label>

            <Select
              value={roomIdValue}
              onValueChange={(value) =>
                setValue("room_id", value ? value : "", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="bg-[#131626] border-zinc-800 text-white w-fit">
                <span className={selectedRoom ? "text-white" : "text-zinc-500"}>
                  {selectedRoom
                    ? `#${selectedRoom.room_number} — ${selectedRoom.room_type} (ជាន់ ${selectedRoom.floor}) — $${selectedRoom.base_price}`
                    : "ជ្រើសរើសបន្ទប់..."}
                </span>
              </SelectTrigger>

              <SelectContent className="bg-[#131626] border-zinc-800 text-white w-fit">
                {roomsForDropdown.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    មិនមានបន្ទប់ទំនេរឡើយ
                  </SelectItem>
                ) : (
                  roomsForDropdown.map((room) => (
                    <SelectItem
                      key={room.id}
                      value={room.id}
                      className="text-xs"
                    >
                      #{room.room_number} — {room.room_type} — ជាន់ {room.floor}{" "}
                      —{" "}
                      <span className="text-emerald-400">
                        ${room.base_price}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {errors.room_id && (
              <p className="text-xs text-red-400">{errors.room_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400">ថ្ងៃចាប់ផ្តើម</Label>

              <Input
                type="date"
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("start_date")}
              />

              {errors.start_date && (
                <p className="text-xs text-red-400">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400">ថ្ងៃបញ្ចប់</Label>

              <Input
                type="date"
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("end_date")}
              />

              {errors.end_date && (
                <p className="text-xs text-red-400">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400">ប្រាក់កក់ ($)</Label>

              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="ឧ. 400"
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("deposit_amount", { valueAsNumber: true })}
              />

              {errors.deposit_amount && (
                <p className="text-xs text-red-400">
                  {errors.deposit_amount.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400">ថ្ងៃបង់ប្រាក់/ខែ</Label>

              <Input
                type="number"
                min={1}
                max={31}
                step={1}
                placeholder="ឧ. 5"
                className="bg-[#131626] border-zinc-800 text-white"
                {...register("due_day", { valueAsNumber: true })}
              />

              {errors.due_day && (
                <p className="text-xs text-red-400">{errors.due_day.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-400">ស្ថានភាព</Label>

            <Select
              value={statusValue}
              onValueChange={(value: string | null) =>
                setValue("status", value as ContractStatus, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="bg-[#131626] border-zinc-800 text-white">
                <span className={statusValue ? "text-white" : "text-zinc-500"}>
                  {statusValue
                    ? STATUS_LABELS[statusValue]
                    : "ជ្រើសរើសស្ថានភាព"}
                </span>
              </SelectTrigger>

              <SelectContent className="bg-[#131626] border-zinc-800 text-white w-fit">
                <SelectItem className="text-xs" value="active">
                  សកម្ម (Active)
                </SelectItem>

                <SelectItem className="text-xs" value="pending">
                  កំពុងរង់ចាំ (Pending)
                </SelectItem>

                <SelectItem className="text-xs" value="expired">
                  អស់សុពលភាព (Expired)
                </SelectItem>

                <SelectItem className="text-xs" value="terminated">
                  បានបញ្ចប់ (Terminated)
                </SelectItem>
              </SelectContent>
            </Select>

            {errors.status && (
              <p className="text-xs text-red-400">{errors.status.message}</p>
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
