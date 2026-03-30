"use client";

import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
  selected: number | null;
  onChange: (id: number | null) => void;
};

export function CategoryPills({ categories, selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-semibold transition-colors ${
          selected === null
            ? "bg-brand text-white"
            : "bg-card text-brand border border-brand/30"
        }`}
      >
        Tümü
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-semibold transition-colors ${
            selected === cat.id
              ? "bg-brand text-white"
              : "bg-card text-brand border border-brand/30"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
