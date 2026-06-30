"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

type OrderItemModifier = {
  name: string;
  price_delta: number;
  quantity: number;
};

type OrderItem = {
  quantity: number;
  unit_price: number;
  products: { name: string } | null;
  order_item_modifiers: OrderItemModifier[];
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("orders")
      .select(
        "id, status, total, created_at, order_items(quantity, unit_price, products(name), order_item_modifiers(name, price_delta, quantity))"
      )
      .eq("table_id", tableId)
      .in("status", ["pending", "active"])
      .order("created_at", { ascending: true });

    setOrders((data ?? []) as unknown as Order[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();

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
        () => fetchOrders()
      )
      .subscribe();

    // Polling fallback — catches UPDATE events that Realtime may miss
    const poll = setInterval(fetchOrders, 5000);

    // Re-fetch immediately when user returns to this tab
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchOrders();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [tableId]); // eslint-disable-line react-hooks/exhaustive-deps

  const grandTotal = orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card px-4 py-3 flex items-center justify-between shadow-sm">
        <Link
          href={`/menu?table=${tableId}&from=landing`}
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

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/70 text-sm">
            Yükleniyor...
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🍽️</p>
            <p className="font-bold text-lg text-brand mb-1">
              Henüz sipariş yok
            </p>
            <p className="text-white/70 text-sm mb-6">
              Menüden sipariş verdikten sonra buradan takip edebilirsiniz.
            </p>
            <Link
              href={`/menu?table=${tableId}&from=landing`}
              className="inline-block bg-brand text-white text-sm font-bold px-5 py-2.5 rounded-pill"
            >
              Menüye Dön
            </Link>
          </div>
        ) : (
          <>
            {/* Summary row when more than one order */}
            {orders.length > 1 && (
              <div className="bg-card rounded-card px-4 py-3 flex items-center justify-between border border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  {orders.length} Sipariş
                </span>
                <span className="text-sm font-bold text-brand">
                  Toplam ₺{grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Order cards */}
            {orders.map((order, orderIdx) => {
              const orderTime = new Date(order.created_at).toLocaleTimeString(
                "tr-TR",
                { hour: "2-digit", minute: "2-digit" }
              );
              return (
                <div
                  key={order.id}
                  className="bg-card rounded-card shadow-sm overflow-hidden"
                >
                  {/* Status row */}
                  <div className="px-4 py-4 flex items-center justify-between border-b border-border">
                    <div>
                      <p className="text-[11px] text-muted mb-0.5 font-semibold uppercase tracking-wide">
                        Sipariş {orderIdx + 1} · {orderTime}
                      </p>
                      <p className="font-semibold text-brand text-sm">
                        #{order.id}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-border">
                    {order.order_items.map((item, i) => {
                      const mods = item.order_item_modifiers ?? [];
                      const modsDelta = mods.reduce(
                        (s, m) =>
                          s + (Number(m.price_delta) || 0) * (Number(m.quantity) || 1),
                        0
                      );
                      const lineTotal =
                        item.quantity * (Number(item.unit_price) + modsDelta);
                      return (
                        <div key={i} className="px-4 py-3 flex flex-col gap-1.5">
                          <div className="flex items-center gap-3">
                            <span className="bg-brand/10 text-brand text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                              {item.quantity}
                            </span>
                            <span className="flex-1 text-sm font-medium text-text">
                              {item.products?.name ?? "Ürün"}
                            </span>
                            <span className="text-sm text-muted shrink-0">
                              ₺{lineTotal.toFixed(2)}
                            </span>
                          </div>
                          {mods.length > 0 && (
                            <div className="pl-10 flex flex-col gap-0.5">
                              {mods.map((m, idx) => {
                                const q = Number(m.quantity) || 1;
                                const delta = (Number(m.price_delta) || 0) * q;
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-baseline justify-between gap-2 text-[11px] text-brand font-semibold"
                                  >
                                    <span>
                                      + {m.name}
                                      {q > 1 ? ` ×${q}` : ""}
                                    </span>
                                    {delta !== 0 && (
                                      <span className="font-bold">
                                        {delta > 0 ? "+" : "−"}₺
                                        {Math.abs(delta).toLocaleString("tr-TR")}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Total */}
                  <div className="px-4 py-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted">Toplam</span>
                    <span className="font-bold text-lg text-brand">
                      ₺{Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add more CTA */}
            <Link
              href={`/menu?table=${tableId}&from=landing`}
              className="bg-card border-2 border-dashed border-brand/60 text-brand rounded-card py-4 px-4 flex items-center justify-center gap-2 font-bold text-sm hover:bg-brand/5 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Daha Sipariş Ver
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
