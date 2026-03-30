"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/supabase/actions";

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="waiter@sanlucas.com"
          className="px-4 py-3 rounded-sm border border-border bg-white text-sm text-text placeholder:text-muted outline-none focus:border-brand transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="px-4 py-3 rounded-sm border border-border bg-white text-sm text-text placeholder:text-muted outline-none focus:border-brand transition-colors"
        />
      </div>

      {state?.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full py-3 bg-brand text-white rounded-sm font-semibold text-sm disabled:opacity-60 active:scale-[0.98] transition-transform"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
