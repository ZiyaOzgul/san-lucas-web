import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";
import { cacheTag } from "next/cache";
import type { Category, CustomerOrder, Modifier, Product, Profile, Table } from "@/lib/types";

function makeClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getActiveProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const supabase = makeClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, category_id, image_url, points_value, product_variants(id, name, price)")
    .eq("is_active", true)
    .order("name");

  console.log('[getActiveProducts]', data?.length ?? 0, 'rows, error:', error?.message ?? null);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getActiveModifiers(): Promise<Modifier[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("modifiers");

  const supabase = makeClient();
  const { data, error } = await supabase
    .from("modifiers")
    .select("id, category_id, product_id, name, price_delta, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  console.log('[getActiveModifiers]', data?.length ?? 0, 'rows, error:', error?.message ?? null);
  if (error) throw new Error(error.message);
  return (data ?? []).map((m) => ({
    id: Number(m.id),
    category_id: m.category_id !== null ? Number(m.category_id) : null,
    product_id: m.product_id !== null ? Number(m.product_id) : null,
    name: m.name,
    price_delta: Number(m.price_delta) || 0,
    sort_order: Number(m.sort_order) || 0,
  }));
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const supabase = makeClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, color, image_url")
    .order("name");

  console.log('[getCategories]', data?.length ?? 0, 'rows, error:', error?.message ?? null);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTable(id: string | undefined): Promise<Table | null> {
  if (!id) return null;

  const supabase = makeClient();
  const { data, error } = await supabase
    .from("tables")
    .select("id, name, status")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getTables(): Promise<Table[]> {
  const supabase = makeClient();
  const { data, error } = await supabase
    .from("tables")
    .select("id, name, status")
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = makeClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, loyalty_points")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function getCustomerOrders(userId: string): Promise<CustomerOrder[]> {
  const supabase = makeClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, total, status, created_at, closed_at, table_id, order_items(id, quantity, unit_price, products(id, name, points_value), order_item_modifiers(name, price_delta, quantity))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return (data ?? []) as unknown as CustomerOrder[];
}
