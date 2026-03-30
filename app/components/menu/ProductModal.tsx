"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

type Props = {
  product: Product | null;
  categoryColor: string | null;
  onClose: () => void;
};

export function ProductModal({ product, categoryColor, onClose }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [visible, setVisible] = useState(false);

  // Animate in when product is set
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes("");
      // Small delay to allow the DOM to mount before triggering transition
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [product]);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  function handleAdd() {
    if (!product) return;
    addItem(product, quantity, notes.trim() || undefined);
    handleClose();
  }

  if (!product) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl max-h-[90vh] overflow-y-auto transition-transform duration-300"
        style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-text active:scale-95 transition-transform"
          aria-label="Kapat"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Product image */}
        <div
          className="mx-4 mt-2 rounded-2xl overflow-hidden h-52"
          style={{ backgroundColor: categoryColor ?? "#e5e7eb" }}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={400}
              height={208}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                <path d="M3 2h18l-2 14H5L3 2z" />
                <path d="M3 2 2 1" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="17" cy="20" r="1" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-8">
          {/* Name + price */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <h2 className="text-lg font-bold text-text leading-snug flex-1">
              {product.name}
            </h2>
            <span className="text-xl font-bold text-brand whitespace-nowrap">
              ₺{product.price.toLocaleString("tr-TR")}
            </span>
          </div>

          {/* Notes */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
              Not
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
              rows={2}
              placeholder="Notunuz var mı? (opsiyonel)"
              className="w-full border border-border rounded-sm px-3 py-2 text-sm text-text placeholder:text-muted bg-white resize-none outline-none focus:border-brand transition-colors"
            />
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3">
            {/* Quantity selector */}
            <div className="flex items-center gap-3 bg-white border border-border rounded-pill px-3 py-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full border-2 border-brand text-brand flex items-center justify-center text-lg font-light active:scale-95 transition-transform"
                aria-label="Azalt"
              >
                −
              </button>
              <span className="w-6 text-center font-bold text-base text-text">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-lg font-light active:scale-95 transition-transform"
                aria-label="Artır"
              >
                +
              </button>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              className="flex-1 bg-brand text-white font-semibold rounded-pill py-3 text-sm active:scale-95 transition-transform shadow-sm"
            >
              Sepete Ekle · ₺{(product.price * quantity).toLocaleString("tr-TR")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
