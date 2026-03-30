import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { LoginForm } from "@/app/components/waiter/LoginForm";

export default function WaiterLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <WaiterLoginContent />
    </Suspense>
  );
}

async function WaiterLoginContent() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/waiter/tables");
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brand">San Lucas</h1>
            <p className="text-muted text-sm mt-0.5">Waiter Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-card p-6 shadow-sm">
          <h2 className="font-bold text-text mb-1">Sign In</h2>
          <p className="text-muted text-sm mb-5">
            Enter your credentials to continue
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
