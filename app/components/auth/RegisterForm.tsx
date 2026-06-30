"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

type Props = {
  onSuccess: () => void;
};

export function RegisterForm({ onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError("Ad, e-posta ve şifre gereklidir.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = getBrowserSupabase();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          role: "customer",
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message || "Hesap oluşturulamadı.");
      return;
    }

    if (data.session) {
      setLoading(false);
      onSuccess();
      return;
    }

    // Email confirmation off → sign in directly. If on, show helpful note.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError("Hesabınız oluşturuldu. Lütfen e-postanızı doğrulayıp giriş yapın.");
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-[10px] font-bold tracking-[2px] text-muted uppercase mb-1.5">
          Ad Soyad
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Adınız Soyadınız"
          autoCapitalize="words"
          className="w-full bg-white border border-border rounded-sm px-3 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-brand transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold tracking-[2px] text-muted uppercase mb-1.5">
          E-posta
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@email.com"
          autoCapitalize="none"
          autoCorrect="off"
          className="w-full bg-white border border-border rounded-sm px-3 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-brand transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold tracking-[2px] text-muted uppercase mb-1.5">
          Telefon (Opsiyonel)
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+90 5xx xxx xx xx"
          className="w-full bg-white border border-border rounded-sm px-3 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-brand transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold tracking-[2px] text-muted uppercase mb-1.5">
          Şifre
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="En az 6 karakter"
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full bg-white border border-border rounded-sm px-3 py-2.5 pr-10 text-sm text-text placeholder:text-muted outline-none focus:border-brand transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted"
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-600 text-center">{error}</p>
      ) : null}

      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.97 }}
        className="mt-2 bg-brand text-white font-bold rounded-pill py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? "Oluşturuluyor..." : "Hesabı Oluştur"}
        {!loading && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </motion.button>
    </form>
  );
}
