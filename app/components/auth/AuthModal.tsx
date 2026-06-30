"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { PointsTeaser } from "./PointsTeaser";

type Tab = "login" | "register";

type Props = {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
};

export function AuthModal({ open, onClose, initialTab = "login" }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl max-h-[92vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-text"
              whileTap={{ scale: 0.9 }}
              aria-label="Kapat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </motion.button>

            <div className="px-5 pt-4 pb-7 max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-text mb-1">
                {tab === "login" ? "Tekrar Hoş Geldin" : "San Lucas'a Katıl"}
              </h2>
              <p className="text-xs text-muted mb-4">
                {tab === "login"
                  ? "Hesabınla giriş yap, San Lucas Puanı kazanmaya devam et."
                  : "Hesabını oluştur, her siparişinde San Lucas Puanı kazanmaya başla."}
              </p>

              <div className="mb-4">
                <PointsTeaser />
              </div>

              <div className="flex bg-white border border-border rounded-pill p-1 mb-5">
                <button
                  onClick={() => setTab("login")}
                  className={`flex-1 text-xs font-bold py-2 rounded-pill transition-colors ${
                    tab === "login" ? "bg-brand text-white" : "text-muted"
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => setTab("register")}
                  className={`flex-1 text-xs font-bold py-2 rounded-pill transition-colors ${
                    tab === "register" ? "bg-brand text-white" : "text-muted"
                  }`}
                >
                  Kayıt Ol
                </button>
              </div>

              {tab === "login" ? (
                <LoginForm onSuccess={onClose} />
              ) : (
                <RegisterForm onSuccess={onClose} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
