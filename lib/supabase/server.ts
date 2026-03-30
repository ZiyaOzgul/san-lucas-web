import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createServerClient() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const cookieStore = await cookies();
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!
    .split("//")[1]
    .split(".")[0];
  const authCookie = cookieStore.get(`sb-${projectRef}-auth-token`);

  if (authCookie?.value) {
    try {
      const session = JSON.parse(authCookie.value);
      await supabase.auth.setSession(session);
    } catch {
      // invalid cookie, ignore
    }
  }

  return supabase;
}
