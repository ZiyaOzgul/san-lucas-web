import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getTables } from "@/lib/supabase/queries";
import { TableGrid } from "@/app/components/waiter/TableGrid";
import { logoutAction } from "@/lib/supabase/actions";

export default function WaiterTablesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <WaiterTablesContent />
    </Suspense>
  );
}

async function WaiterTablesContent() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/waiter");
  }

  const tables = await getTables();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-card px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand"
          >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
          <span className="font-bold text-brand">San Lucas</span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-muted font-medium px-3 py-1.5 rounded-sm hover:bg-brand/5 transition-colors"
          >
            Sign Out
          </button>
        </form>
      </header>

      <main className="px-4 pt-6 pb-10 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-text mb-1">Select a Table</h1>
        <p className="text-muted text-sm mb-5">
          Choose a table to take an order
        </p>

        {tables.length === 0 ? (
          <p className="text-center text-muted py-10 text-sm">
            No tables found. Add tables in the POS app.
          </p>
        ) : (
          <TableGrid tables={tables} />
        )}
      </main>
    </div>
  );
}
