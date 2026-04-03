"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "./CartProvider";
import { createOrder } from "@/lib/supabase/actions";
import { OrderConfirmation } from "./OrderConfirmation";

type Props = {
  tableLabel: string;
};

export function CartBar({ tableLabel }: Props) {
  const { items, itemCount, total, clearCart, tableId, orderType } = useCart();
  const [isPending, startTransition] = useTransition();
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);

  if (confirmedOrderId !== null) {
    return (
      <OrderConfirmation
        orderId={confirmedOrderId}
        tableId={tableId}
        tableLabel={tableLabel}
        onNewOrder={() => {
          setConfirmedOrderId(null);
          clearCart();
        }}
      />
    );
  }

  function handleCheckout() {
    startTransition(async () => {
      const result = await createOrder(items, tableId, orderType);
      if (result.success) {
        setConfirmedOrderId(result.orderId);
      } else {
        alert(`Hata: ${result.error}`);
      }
    });
  }

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          key="cartbar"
          className="fixed bottom-0 left-0 right-0 z-20 p-3"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 260 }}
        >
          <div className="bg-brand rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg max-w-lg mx-auto">
            {/* Left: bag icon + count/total */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium">
                  {itemCount} ÜRÜN
                </p>
                <p className="text-white font-bold text-base leading-none">
                  ₺{total.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* Right: checkout button */}
            <motion.button
              onClick={handleCheckout}
              disabled={isPending}
              className="bg-brand-light text-brand font-bold text-sm px-5 py-2.5 rounded-pill flex items-center gap-1.5 disabled:opacity-60"
              whileTap={{ scale: 0.95 }}
            >
              {isPending ? "Gönderiliyor..." : "Siparişi Ver"}
              {!isPending && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
