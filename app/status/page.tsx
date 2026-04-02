import { getTable } from "@/lib/supabase/queries";
import { OrderStatusView } from "@/app/components/status/OrderStatusView";

export default async function StatusPage(props: {
  searchParams: Promise<{ table?: string }>;
}) {
  const { table } = await props.searchParams;
  
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
  
  const tableData = await getTable(table);
  const tableName = tableData ? tableData.name : String(tableNum);
  
  return <OrderStatusView  tableId={tableNum} tableName={tableName} />;
}
