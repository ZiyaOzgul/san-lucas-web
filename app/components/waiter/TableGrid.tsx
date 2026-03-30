import Link from "next/link";
import type { Table } from "@/lib/types";

type Props = {
  tables: Table[];
};

export function TableGrid({ tables }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {tables.map((table) => (
        <Link
          key={table.id}
          href={`/waiter/order?table=${table.id}`}
          className="bg-card rounded-card p-4 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              table.status === "occupied"
                ? "bg-green-100"
                : "bg-brand/10"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={
                table.status === "occupied" ? "text-green-600" : "text-brand"
              }
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
          </div>
          <span className="font-semibold text-text text-sm text-center leading-tight">
            {table.name}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-pill ${
              table.status === "occupied"
                ? "bg-green-100 text-green-700"
                : "bg-brand/10 text-brand"
            }`}
          >
            {table.status === "occupied" ? "Occupied" : "Empty"}
          </span>
        </Link>
      ))}
    </div>
  );
}
