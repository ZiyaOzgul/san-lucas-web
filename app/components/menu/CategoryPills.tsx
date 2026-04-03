"use client";

import { motion } from "motion/react";
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
        className="relative flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-semibold overflow-hidden"
      >
        {selected === null && (
          <motion.div
            layoutId="category-pill-indicator"
            className="absolute inset-0 bg-brand rounded-pill"
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          />
        )}
        <span className={`relative z-10 ${selected === null ? "text-white" : "text-brand"}`}>
          Tümü
        </span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className="relative flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-semibold border border-brand/30 overflow-hidden"
        >
          {selected === cat.id && (
            <motion.div
              layoutId="category-pill-indicator"
              className="absolute inset-0 bg-brand rounded-pill"
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            />
          )}
          <span className={`relative z-10 ${selected === cat.id ? "text-white" : "text-brand"}`}>
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
}
