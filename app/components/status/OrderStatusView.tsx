"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

type OrderItem = {
  quantity: number;
  unit_price: number;
  products: { name: string } | null;
};

type Order = {
  id: number;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

type Props = {
  tableId: number;
  tableName: string;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <span className="text-xs font-bold px-3 py-1 rounded-pill bg-amber-100 text-amber-700">
        Bekleniyor
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="text-xs font-bold px-3 py-1 rounded-pill bg-green-100 text-green-700">
        Kabul Edildi
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-3 py-1 rounded-pill bg-gray-100 text-gray-500">
      Tamamlandı
    </span>
  );
}

export function OrderStatusView({ tableId, tableName }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchOrder() {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("orders")
      .select(
        "id, status, total, created_at, order_items(quantity, unit_price, products(name))"
      )
      .eq("table_id", tableId)
      .in("status", ["pending", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setOrder(data as Order | null);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrder();

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`order-status-table-${tableId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `table_id=eq.${tableId}`,
        },
        () => fetchOrder()
      )
      .subscribe();

    // Polling fallback — catches UPDATE events that Realtime may miss
    const poll = setInterval(fetchOrder, 5000);

    // Re-fetch immediately when user returns to this tab
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchOrder();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [tableId]); // eslint-disable-line react-hooks/exhaustive-deps

  const orderTime = order
    ? new Date(order.created_at).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card px-4 py-3 flex items-center justify-between shadow-sm">
        <Link
          href={`/menu?table=${tableId}`}
          className="flex items-center gap-1 text-brand text-sm font-medium"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Menü
        </Link>
        <span className="font-bold text-base text-brand">Sipariş Durumu</span>
        <span className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-pill tracking-wider uppercase">
          Masa {tableName}
        </span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            Yükleniyor...
          </div>
        ) : !order ? (
          /* Empty state */
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🍽️</p>
            <p className="font-bold text-lg text-brand mb-1">
              Henüz sipariş yok
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Menüden sipariş verdikten sonra buradan takip edebilirsiniz.
            </p>
            <Link
              href={`/menu?table=${tableId}`}
              className="inline-block bg-brand text-white text-sm font-bold px-5 py-2.5 rounded-pill"
            >
              Menüye Dön
            </Link>
          </div>
        ) : (
          /* Order card */
          <div className="bg-card rounded-[var(--radius-card)] shadow-sm overflow-hidden">
            {/* Status row */}
            <div className="px-4 py-4 flex items-center justify-between border-b border-border">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Sipariş verildi</p>
                <p className="font-semibold text-brand text-sm">{orderTime}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Items */}
            <div className="divide-y divide-border">
              {order.order_items.map((item, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <span className="bg-brand/10 text-brand text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                    {item.quantity}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800">
                    {item.products?.name ?? "Ürün"}
                  </span>
                  <span className="text-sm text-gray-500 shrink-0">
                    ₺{(item.quantity * item.unit_price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="px-4 py-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-gray-500">Toplam</span>
              <span className="font-bold text-lg text-brand">
                ₺{Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
