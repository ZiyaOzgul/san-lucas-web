import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";
import { cacheTag } from "next/cache";
import type { Category, Product, Table } from "@/lib/types";

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
    .select("id, name, price, category_id, image_url, product_variants(id, name, price)")
    .eq("is_active", true)
    .order("name");

  console.log('[getActiveProducts]', data?.length ?? 0, 'rows, error:', error?.message ?? null);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const supabase = makeClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, color")
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
