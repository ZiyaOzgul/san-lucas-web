import Link from "next/link";
import Image from "next/image";

type Props = {
  tableLabel: string;
  tableId: number;
  rightSlot?: React.ReactNode;
};

export function MenuHeader({ tableLabel, tableId, rightSlot }: Props) {
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
