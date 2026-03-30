import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getActiveProducts, getCategories, getTable } from "@/lib/supabase/queries";
import { CartProvider } from "@/app/components/menu/CartProvider";
import { MenuHeader } from "@/app/components/menu/MenuHeader";
import { ProductCatalog } from "@/app/components/menu/ProductCatalog";
import { CartBar } from "@/app/components/menu/CartBar";
import { logoutAction } from "@/lib/supabase/actions";
import Link from "next/link";

export default function WaiterOrderPage(props: {
  searchParams: Promise<{ table?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <WaiterOrderContent searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}

async function WaiterOrderContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ table?: string }>;
}) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/waiter");
  }

  const { table } = await searchParamsPromise;
  const [tableData, categories, products] = await Promise.all([
    getTable(table),
    getCategories(),
    getActiveProducts(),
  ]);

  const tableId = tableData?.id ?? 1;
  const tableLabel = tableData
    ? `Table ${tableData.name}`
    : `Table ${table ?? "?"}`;

  const RightSlot = (
    <div className="flex items-center gap-1">
      <Link
        href="/waiter/tables"
        className="text-xs text-muted font-medium px-2 py-1 rounded-sm hover:text-brand transition-colors"
      >
        ← Tables
      </Link>
      <form action={logoutAction} className="contents">
        <button
          type="submit"
          className="text-xs text-white/70 font-medium px-2 py-1 rounded-sm hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </form>
    </div>
  );

  return (
    <CartProvider tableId={tableId} orderType="active">
      <div className="min-h-screen pb-28 max-w-lg mx-auto">
        <MenuHeader tableLabel={tableLabel} rightSlot={RightSlot} />

        <div className="px-4 pt-4 pb-1">
          <p className="text-xs font-semibold text-brand uppercase tracking-widest">
            Waiter Mode — Order goes directly to kitchen
          </p>
        </div>

        <div className="mt-3">
          <ProductCatalog products={products} categories={categories} />
        </div>
        <CartBar tableLabel={tableLabel} />
      </div>
    </CartProvider>
  );
}
