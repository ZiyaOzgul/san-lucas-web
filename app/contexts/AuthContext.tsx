"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { Profile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = getBrowserSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, loyalty_points")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile(user.id).then(setProfile);
    } else {
      setProfile(null);
    }
  }, [user]);

  const signOut = useCallback(async () => {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
