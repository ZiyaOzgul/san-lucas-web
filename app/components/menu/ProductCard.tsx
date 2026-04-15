"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { ProductGroup } from "@/lib/types";
import { useCart } from "./CartProvider";

export const productCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

type Props = {
  group: ProductGroup;
  categoryColor: string | null;
  onSelect: (group: ProductGroup) => void;
};

export function ProductCard({ group, categoryColor, onSelect }: Props) {
  const { items } = useCart();
  const qty = group.variants.reduce(
    (sum, v) => sum + (items.find((i) => i.productId === v.product.id && i.variantId === v.variantId)?.quantity ?? 0),
    0
  );

  const prices = group.variants.map((v) => v.product.price);
  const minPrice = Math.min(...prices);
  const allSamePrice = prices.every((p) => p === minPrice);
  const priceLabel = allSamePrice
    ? `₺${minPrice.toLocaleString("tr-TR")}`
    : `₺${minPrice.toLocaleString("tr-TR")}+`;

  const hasVariants = group.variants.length > 1;

  return (
    <motion.button
      onClick={() => onSelect(group)}
      className="bg-card rounded-card flex gap-3 p-3 shadow-sm text-left w-full relative"
      variants={productCardVariants}
      whileTap={{ scale: 0.97 }}
    >
      {/* Image */}
      <div
        className="flex-shrink-0 w-24 h-24 rounded-sm overflow-hidden relative"
        style={{ backgroundColor: categoryColor ?? "#e5e7eb" }}
      >
        {group.image_url ? (
          <Image
            src={group.image_url}
            alt={group.baseName}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" />
        )}

        {/* Quantity badge */}
        {qty > 0 && (
          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
            {qty}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-text text-sm leading-snug">
              {group.baseName}
            </h3>
            <span className="font-bold text-brand text-sm whitespace-nowrap ml-1">
              {priceLabel}
            </span>
          </div>
          {hasVariants && (
            <p className="text-xs text-muted mt-1">
              {group.variants.map((v) => v.sizeLabel).join(' · ')}
            </p>
          )}
        </div>

        {qty > 0 && (
          <p className="text-xs text-brand font-medium mt-2">
            {qty} sepette
          </p>
        )}
      </div>
    </motion.button>
  );
}
