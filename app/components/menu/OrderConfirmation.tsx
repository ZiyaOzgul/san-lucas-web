"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { AuthModal } from "@/app/components/auth/AuthModal";

type Props = {
  orderId: number;
  tableId: number;
  tableLabel: string;
  earnedPoints: number;
  wasLoggedIn: boolean;
  onNewOrder: () => void;
};

export function OrderConfirmation({
  orderId,
  tableId,
  tableLabel,
  earnedPoints,
  wasLoggedIn,
  onNewOrder,
}: Props) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-brand flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>

      <motion.div
        className="w-full max-w-xs bg-card border border-border rounded-card px-5 py-4 shadow-sm text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-2xl font-bold text-text">Sipariş Alındı!</h2>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          {tableLabel} için #{orderId} numaralı siparişiniz alındı.
          <br />
          En kısa sürede getiriyoruz.
        </p>
      </motion.div>

      {earnedPoints > 0 && (
        <motion.div
          className="w-full max-w-xs bg-brand/10 border border-brand/40 rounded-2xl px-4 py-3.5 flex items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3 1.9 5.9H20l-5.05 3.66L17 18.5 12 14.84 7 18.5l1.9-5.95L4 8.9h6.1Z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            {wasLoggedIn ? (
              <>
                <p className="text-sm font-bold text-text">
                  +{earnedPoints} San Lucas Puanı
                </p>
                <p className="text-[11px] text-muted leading-snug mt-0.5">
                  Sipariş tamamlanınca puanın hesabına eklenecek.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-text">
                  {earnedPoints} San Lucas Puanı kaçırdın
                </p>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="text-[11px] font-bold text-brand mt-0.5 underline underline-offset-2"
                >
                  Giriş yapsaydın puanın hesabına eklenecekti — Giriş Yap
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Status hint */}
      <motion.div
        className="w-full max-w-xs bg-surface border border-brand/40 rounded-2xl px-4 py-4 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-white/80 font-medium leading-snug">
          Siparişinin durumunu takip etmek için sağ üstteki
          {" "}
          <span className="inline-flex items-center bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-pill align-middle">
            {tableLabel}
          </span>
          {" "}
          butonuna dokun.
        </p>
        <Link
          href={`/status?table=${tableId}`}
          className="w-full text-center bg-brand text-white text-sm font-bold py-2.5 rounded-pill"
        >
          Siparişimi Takip Et
        </Link>
      </motion.div>

      <motion.button
        onClick={onNewOrder}
        className="text-muted text-sm underline underline-offset-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        whileTap={{ scale: 0.97 }}
      >
        Tekrar Sipariş Ver
      </motion.button>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </motion.div>
  );
}
