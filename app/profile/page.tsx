"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/app/contexts/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { CustomerOrder } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = getBrowserSupabase();
    supabase
      .from("orders")
      .select(
        "id, total, status, created_at, closed_at, table_id, order_items(id, quantity, unit_price, products(id, name, points_value), order_item_modifiers(name, price_delta, quantity))"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setOrders((data ?? []) as unknown as CustomerOrder[]);
        setOrdersLoading(false);
      });
  }, [user]);

  async function handleLogout() {
    if (!confirm("Çıkış yapmak istediğine emin misin?")) return;
    await signOut();
    router.replace("/");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70 text-sm">
        Yükleniyor...
      </div>
    );
  }

  const initial = (profile?.full_name || user.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();
  const points = profile?.loyalty_points ?? 0;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="Geri">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <Image src="/san-lucas-logo.png" alt="San Lucas" width={32} height={32} className="object-contain" />
          <span className="font-bold text-base text-brand tracking-tight">Profil</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-5">
        {/* Profile card */}
        <motion.section
          className="bg-card rounded-2xl py-6 px-5 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-full bg-brand text-white text-3xl font-extrabold flex items-center justify-center mb-3">
            {initial}
          </div>
          <p className="text-lg font-bold text-text">
            {profile?.full_name || "Misafir"}
          </p>
          <p className="text-xs text-muted mt-1">{user.email}</p>
          {profile?.phone ? (
            <p className="text-xs text-muted mt-0.5">{profile.phone}</p>
          ) : null}
        </motion.section>

        {/* Loyalty card */}
        <motion.section
          className="bg-brand rounded-2xl p-5 text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3 1.9 5.9H20l-5.05 3.66L17 18.5 12 14.84 7 18.5l1.9-5.95L4 8.9h6.1Z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-[2px] uppercase opacity-90">
                San Lucas Puanı
              </p>
              <p className="text-[11px] opacity-75 mt-0.5">
                Her ürünün kendi puan değeri vardır
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-5xl font-extrabold leading-none">
              {points}
            </span>
            <span className="text-sm font-bold opacity-80">puan</span>
          </div>
        </motion.section>

        {/* Order history */}
        <section>
          <p className="text-[10px] font-bold tracking-[2px] uppercase text-white/70 mb-2 pl-1">
            Geçmiş Siparişler
          </p>
          {ordersLoading ? (
            <div className="bg-card rounded-2xl p-5 text-center text-sm text-muted">
              Yükleniyor...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-card rounded-2xl p-6 text-center">
              <p className="text-sm text-muted">Henüz siparişin yok.</p>
              <Link
                href="/"
                className="inline-block mt-3 bg-brand text-white text-xs font-bold px-4 py-2 rounded-pill"
              >
                Menüyü Gör
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {orders.map((o) => {
                const earned = o.order_items.reduce(
                  (sum, oi) =>
                    sum + oi.quantity * (oi.products?.points_value ?? 0),
                  0
                );
                const date = o.created_at
                  ? new Date(o.created_at).toLocaleString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";
                const statusLabel =
                  o.status === "completed"
                    ? "Tamamlandı"
                    : o.status === "cancelled"
                    ? "İptal"
                    : "Hazırlanıyor";
                const statusColor =
                  o.status === "completed"
                    ? "text-green-600"
                    : o.status === "cancelled"
                    ? "text-red-600"
                    : "text-brand";
                return (
                  <div
                    key={o.id}
                    className="bg-card rounded-2xl p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-text">
                          #{o.id}
                          {o.table_id ? ` · Masa ${o.table_id}` : ""}
                        </p>
                        <p className="text-[11px] text-muted">{date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand">
                          ₺{Number(o.total).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-[11px] font-semibold ${statusColor}`}>
                          {statusLabel}
                        </p>
                      </div>
                    </div>
                    {o.order_items.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        {o.order_items.map((oi) => {
                          const mods = oi.order_item_modifiers ?? [];
                          return (
                            <div key={oi.id} className="text-[11px] text-muted leading-snug">
                              <span>
                                {oi.quantity}× {oi.products?.name ?? "Ürün"}
                              </span>
                              {mods.length > 0 && (
                                <div className="pl-3 mt-0.5 flex flex-col gap-0.5">
                                  {mods.map((m, idx) => {
                                    const q = Number(m.quantity) || 1;
                                    const delta = (Number(m.price_delta) || 0) * q;
                                    return (
                                      <div
                                        key={idx}
                                        className="text-[10.5px] text-brand font-semibold"
                                      >
                                        + {m.name}
                                        {q > 1 ? ` ×${q}` : ""}
                                        {delta !== 0 && (
                                          <span className="ml-1 font-bold">
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
                    )}
                    {earned > 0 && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                          <path d="m12 3 1.9 5.9H20l-5.05 3.66L17 18.5 12 14.84 7 18.5l1.9-5.95L4 8.9h6.1Z" />
                        </svg>
                        <span className="text-[11px] font-bold text-brand">
                          {o.status === "completed"
                            ? `+${earned} puan kazandın`
                            : `${earned} puan kazanacaksın`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-card border border-red-200 rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 text-red-600 font-bold text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Çıkış Yap
        </button>
      </main>
    </div>
  );
}
