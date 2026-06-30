"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { CartItem, CreateOrderResult, OrderType } from "@/lib/types";

function makeClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function createOrder(
  items: CartItem[],
  tableId: number,
  orderType: OrderType,
  userId?: string | null
): Promise<CreateOrderResult> {
  const supabase = makeClient();

  const modifiersSum = (mods: CartItem["modifiers"]) =>
    (mods ?? []).reduce(
      (s, m) => s + (Number(m.priceDelta) || 0) * (Number(m.quantity) || 1),
      0
    );

  const total = items.reduce(
    (sum, item) =>
      sum + (item.unitPrice + modifiersSum(item.modifiers)) * item.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      local_id: crypto.randomUUID(),
      table_id: tableId,
      status: orderType,
      total: Math.round(total * 100) / 100,
      is_synced: false,
      user_id: userId ?? null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { success: false, error: orderError?.message ?? "Order failed" };
  }

  const orderItems = items.map((item) => ({
    local_id: crypto.randomUUID(),
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    is_synced: false,
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)
    .select("id, local_id");

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  const idByLocalId = new Map<string, number>();
  for (const row of insertedItems ?? []) {
    idByLocalId.set(row.local_id as string, Number(row.id));
  }

  const modifierRows: {
    local_id: string;
    order_item_id: number;
    modifier_id: number | null;
    name: string;
    price_delta: number;
    quantity: number;
  }[] = [];

  for (let i = 0; i < items.length; i++) {
    const cartItem = items[i];
    const mods = cartItem.modifiers ?? [];
    if (mods.length === 0) continue;
    const localId = orderItems[i].local_id;
    const orderItemId = idByLocalId.get(localId);
    if (!orderItemId) continue;
    for (const m of mods) {
      modifierRows.push({
        local_id: crypto.randomUUID(),
        order_item_id: orderItemId,
        modifier_id: m.modifierId,
        name: m.name,
        price_delta: Number(m.priceDelta) || 0,
        quantity: Number(m.quantity) || 1,
      });
    }
  }

  if (modifierRows.length > 0) {
    const { error: modError } = await supabase
      .from("order_item_modifiers")
      .insert(modifierRows);
    if (modError) {
      return { success: false, error: modError.message };
    }
  }

  return { success: true, orderId: order.id };
}

export async function loginAction(
  prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = makeClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return { error: error?.message ?? "Giriş başarısız" };
  }

  const cookieStore = await cookies();
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!
    .split("//")[1]
    .split(".")[0];

  cookieStore.set(`sb-${projectRef}-auth-token`, JSON.stringify(data.session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: data.session.expires_in,
    path: "/",
  });

  redirect("/waiter/tables");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!
    .split("//")[1]
    .split(".")[0];

  cookieStore.delete(`sb-${projectRef}-auth-token`);
  redirect("/waiter");
}
