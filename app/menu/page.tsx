import { Suspense } from "react";
import { getActiveProducts, getCategories, getTable } from "@/lib/supabase/queries";
import { CartProvider } from "@/app/components/menu/CartProvider";
import { MenuHeader } from "@/app/components/menu/MenuHeader";
import { MenuHero } from "@/app/components/menu/MenuHero";
import { ProductCatalog } from "@/app/components/menu/ProductCatalog";
import { CartBar } from "@/app/components/menu/CartBar";
import { SplashScreen } from "@/app/components/menu/SplashScreen";
import MenuLoading from "./loading";

export default function MenuPage(props: {
  searchParams: Promise<{ table?: string }>;
}) {
  return (
    <Suspense fallback={<MenuLoading />}>
      <MenuContent searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}

async function MenuContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ table?: string }>;
}) {
  const { table } = await searchParamsPromise;

  const tableNum = table ? parseInt(table, 10) : NaN;
  if (isNaN(tableNum) || tableNum < 1 || tableNum > 20) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-2xl font-bold text-brand mb-2">Geçersiz Masa</p>
          <p className="text-gray-500 text-sm">
            Lütfen masanızdaki QR kodu tekrar okutun.
          </p>
        </div>
      </div>
    );
  }

  const [tableData, categories, products] = await Promise.all([
    getTable(table),
    getCategories(),
    getActiveProducts(),
  ]);

  const tableId = tableNum;
  const tableLabel = tableData
    ? `Masa ${tableData.name}`
    : `Masa ${tableNum}`;

  return (
    <CartProvider tableId={tableId} orderType="pending">
      <SplashScreen />
      <div className="min-h-screen pb-28 max-w-lg mx-auto">
        <MenuHeader tableLabel={tableLabel} tableId={tableId} />
        <MenuHero
          title="San Lucas Cafe"
          subtitle="Lezzetli içecekler ve atıştırmalıklar sizi bekliyor."
        />
        <div className="mt-4">
          <ProductCatalog products={products} categories={categories} />
        </div>
        <CartBar tableLabel={tableLabel} />
      </div>
    </CartProvider>
  );
}
