"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";
import { contractSchema } from "@/lib/validations/contracts";

export async function getContracts() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("contracts")
    .select(
      `
      *,
      profiles:tenant_id (
        id,
        full_name,
        phone_number,
        email
      ),
      rooms:room_id (
        id,
        room_number,
        room_type,
        base_price,
        floor
      )
    `,
    )
    // Safety cap: admin list view shows the 500 most recent contracts. A
    // contract older than that won't appear here or in search — revisit
    // with real pagination if this becomes a problem.
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);

  return data || [];
}

export async function getContractFormData() {
  const { supabase } = await requireAdmin();

  const { data: activeContracts, error: activeContractsError } = await supabase
    .from("contracts")
    .select("tenant_id, room_id")
    .eq("status", "active");

  if (activeContractsError) {
    throw new Error(activeContractsError.message);
  }

  const usedTenantIds = (activeContracts || []).map((item) => item.tenant_id);
  const usedRoomIds = (activeContracts || []).map((item) => item.room_id);

  let tenantsQuery = supabase
    .from("profiles")
    .select("id, full_name, phone_number, email")
    .eq("role", "tenant")
    .order("full_name", { ascending: true });

  if (usedTenantIds.length > 0) {
    tenantsQuery = tenantsQuery.not("id", "in", `(${usedTenantIds.join(",")})`);
  }

  const { data: tenants, error: tenantsError } = await tenantsQuery;

  if (tenantsError) {
    throw new Error(tenantsError.message);
  }

  let roomsQuery = supabase
    .from("rooms")
    .select("id, room_number, room_type, base_price, floor, status")
    .eq("status", "available")
    .order("room_number", { ascending: true });

  if (usedRoomIds.length > 0) {
    roomsQuery = roomsQuery.not("id", "in", `(${usedRoomIds.join(",")})`);
  }

  const { data: rooms, error: roomsError } = await roomsQuery;

  if (roomsError) {
    throw new Error(roomsError.message);
  }

  return {
    tenants: tenants || [],
    rooms: rooms || [],
  };
}

export async function upsertContract(id: string | null, formData: FormData) {
  const { supabase } = await requireAdmin();

  const parsed = contractSchema.safeParse({
    tenant_id: formData.get("tenant_id"),
    room_id: formData.get("room_id"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    deposit_amount: formData.get("deposit_amount"),
    status: formData.get("status"),
    due_day: formData.get("due_day"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "ទិន្នន័យមិនត្រឹមត្រូវ");
  }

  const {
    tenant_id,
    room_id,
    start_date,
    end_date,
    deposit_amount,
    status,
    due_day,
  } = parsed.data;

  const { data: tenant, error: tenantError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", tenant_id)
    .eq("role", "tenant")
    .single();

  if (tenantError || !tenant) {
    throw new Error("រកមិនឃើញអ្នកជួលនេះទេ");
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, status")
    .eq("id", room_id)
    .single();

  if (roomError || !room) {
    throw new Error("រកមិនឃើញបន្ទប់នេះទេ");
  }

  let oldRoomId: string | null = null;

  if (id) {
    const { data: oldContract, error: oldContractError } = await supabase
      .from("contracts")
      .select("id, room_id")
      .eq("id", id)
      .single();

    if (oldContractError || !oldContract) {
      throw new Error("រកមិនឃើញកិច្ចសន្យានេះទេ");
    }

    oldRoomId = oldContract.room_id;

    if (oldRoomId !== room_id && room.status !== "available") {
      throw new Error("បន្ទប់ថ្មីនេះមិនទំនេរទេ");
    }
  } else {
    if (room.status !== "available") {
      throw new Error("បន្ទប់នេះមិនទំនេរទេ");
    }
  }

  const contractData = {
    tenant_id,
    room_id,
    start_date,
    end_date,
    deposit_amount,
    status,
    due_day,
  };

  if (id) {
    const { data, error } = await supabase
      .from("contracts")
      .update(contractData)
      .eq("id", id)
      .select(
        `
        *,
        profiles:tenant_id (
          id,
          full_name,
          phone_number,
          email
        ),
        rooms:room_id (
          id,
          room_number,
          room_type,
          base_price,
          floor
        )
      `,
      )
      .single();

    if (error) throw new Error(error.message);

    if (oldRoomId && oldRoomId !== room_id) {
      await supabase
        .from("rooms")
        .update({ status: "available" })
        .eq("id", oldRoomId);

      await supabase
        .from("rooms")
        .update({ status: "occupied" })
        .eq("id", room_id);
    }

    revalidatePath("/admin/contracts");
    revalidatePath("/admin/rooms");

    return data;
  }

  const { data, error } = await supabase
    .from("contracts")
    .insert([contractData])
    .select(
      `
      *,
      profiles:tenant_id (
        id,
        full_name,
        phone_number,
        email
      ),
      rooms:room_id (
        id,
        room_number,
        room_type,
        base_price,
        floor
      )
    `,
    )
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("rooms").update({ status: "occupied" }).eq("id", room_id);

  revalidatePath("/admin/contracts");
  revalidatePath("/admin/rooms");

  return data;
}

export async function deleteContract(id: string) {
  const { supabase } = await requireAdmin();

  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select("id, room_id")
    .eq("id", id)
    .single();

  if (contractError || !contract) {
    throw new Error("រកមិនឃើញកិច្ចសន្យានេះទេ");
  }

  const { data: bills, error: billsError } = await supabase
    .from("bills")
    .select("id")
    .eq("contract_id", id)
    .limit(1);

  if (billsError) throw new Error(billsError.message);

  if (bills && bills.length > 0) {
    throw new Error("មិនអាចលុបកិច្ចសន្យានេះបានទេ ព្រោះមានវិក្កយបត្រពាក់ព័ន្ធ");
  }

  const { error } = await supabase.from("contracts").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await supabase
    .from("rooms")
    .update({ status: "available" })
    .eq("id", contract.room_id);

  revalidatePath("/admin/contracts");
  revalidatePath("/admin/rooms");
}

// See bill-generator.ts for why this cast exists: no generated DB types,
// so Supabase-js can't tell these FK joins resolve to a single row.
type ActiveContract = {
  id: string;
  tenant_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  due_day: number;
  status: string;
  profiles?: {
    id: string;
    full_name: string;
    phone_number: string;
    email?: string;
  };
  rooms?: {
    id: string;
    room_number: string;
    room_type: string;
    base_price: number;
    floor: number;
    status: string;
  };
};

export async function getActiveContracts() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("contracts")
    .select(
      `
      id,
      tenant_id,
      room_id,
      start_date,
      end_date,
      due_day,
      status,
      profiles:tenant_id (
        id,
        full_name,
        phone_number,
        email
      ),
      rooms:room_id (
        id,
        room_number,
        room_type,
        base_price,
        floor,
        status
      )
    `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []) as unknown as ActiveContract[];
}
