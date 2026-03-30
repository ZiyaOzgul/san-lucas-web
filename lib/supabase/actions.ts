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
  orderType: OrderType
): Promise<CreateOrderResult> {
  const supabase = makeClient();

  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
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
    quantity: item.quantity,
    unit_price: item.unitPrice,
    is_synced: false,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return { success: false, error: itemsError.message };
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
