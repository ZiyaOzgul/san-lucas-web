import Link from "next/link";

type Props = {
  tableLabel: string;
  tableId: number;
  rightSlot?: React.ReactNode;
};

export function MenuHeader({ tableLabel, tableId, rightSlot }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-card px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <svg
          width="22"
          height="22"
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
        <span className="font-bold text-lg text-brand tracking-tight">
          San Lucas
        </span>
      </div>

      <div className="flex items-center gap-2">
        {rightSlot}
        <Link
          href={`/status?table=${tableId}`}
          className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-pill tracking-wider uppercase"
        >
          {tableLabel}
        </Link>
      </div>
    </header>
  );
}
