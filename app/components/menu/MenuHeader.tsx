"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { AuthModal } from "@/app/components/auth/AuthModal";

type Props = {
  tableLabel: string;
  tableId: number;
  rightSlot?: React.ReactNode;
};

export function MenuHeader({ tableLabel, tableId, rightSlot }: Props) {
  const { user, profile, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const initial = (profile?.full_name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 bg-card px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <Image
          src="/san-lucas-logo.png"
          alt="San Lucas"
          width={36}
          height={36}
          className="object-contain"
        />
        <span className="font-bold text-lg text-brand tracking-tight">
          San Lucas
        </span>
      </div>

      <div className="flex items-center gap-2">
        {rightSlot}

        {!loading && user ? (
          <Link
            href="/profile"
            aria-label="Profil"
            className="w-9 h-9 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center"
          >
            {initial}
          </Link>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            disabled={loading}
            aria-label="Giriş Yap"
            className="w-9 h-9 rounded-full bg-white border border-brand text-brand flex items-center justify-center disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        )}

        <Link
          href={`/status?table=${tableId}`}
          className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-pill tracking-wider uppercase"
        >
          {tableLabel}
        </Link>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
