"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { CartItemModifier, Modifier, ProductGroup } from "@/lib/types";
import { useCart } from "./CartProvider";

type Props = {
  group: ProductGroup;
  categoryColor: string | null;
  modifiers: Modifier[];
  onClose: () => void;
};

export function ProductModal({ group, categoryColor, modifiers, onClose }: Props) {
  const { addItem } = useCart();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [modifierQty, setModifierQty] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    setSelectedVariantIdx(0);
    setQuantity(1);
    setNotes("");
    setModifierQty(new Map());
  }, [group.baseName, group.category_id]);

  const selectedVariant = group.variants[selectedVariantIdx];
  const hasVariants = group.variants.length > 1;
  const productId = selectedVariant.product.id;
  const categoryId = group.category_id;

  const applicableModifiers = useMemo(() => {
    return modifiers
      .filter(
        (m) =>
          m.product_id === productId ||
          (categoryId !== null && m.category_id === categoryId)
      )
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "tr"));
  }, [modifiers, productId, categoryId]);

  function toggleModifier(id: number) {
    setModifierQty((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, 1);
      return next;
    });
  }

  function bumpModifier(id: number, delta: number) {
    setModifierQty((prev) => {
      const next = new Map(prev);
      const current = next.get(id) ?? 0;
      const updated = current + delta;
      if (updated <= 0) next.delete(id);
      else next.set(id, updated);
      return next;
    });
  }

  const modifiersDelta = applicableModifiers
    .filter((m) => modifierQty.has(m.id))
    .reduce(
      (s, m) => s + (Number(m.price_delta) || 0) * (modifierQty.get(m.id) ?? 1),
      0
    );
  const lineUnit = selectedVariant.product.price + modifiersDelta;

  function handleAdd() {
    const selectedMods: CartItemModifier[] = applicableModifiers
      .filter((m) => modifierQty.has(m.id))
      .map((m) => ({
        modifierId: m.id,
        name: m.name,
        priceDelta: Number(m.price_delta) || 0,
        quantity: modifierQty.get(m.id) ?? 1,
      }));
    addItem({
      product: selectedVariant.product,
      quantity,
      notes: notes.trim() || undefined,
      variantId: selectedVariant.variantId ?? null,
      variantName: selectedVariant.sizeLabel,
      modifiers: selectedMods,
    });
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Close button */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-text"
          whileTap={{ scale: 0.9 }}
          aria-label="Kapat"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </motion.button>

        {/* Product image */}
        <div
          className="mx-4 mt-2 rounded-2xl overflow-hidden h-52"
          style={{ backgroundColor: categoryColor ?? "#e5e7eb" }}
        >
          {group.image_url ? (
            <Image
              src={group.image_url}
              alt={group.baseName}
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
              {group.baseName}
            </h2>
            <span className="text-xl font-bold text-brand whitespace-nowrap">
              ₺{selectedVariant.product.price.toLocaleString("tr-TR")}
            </span>
          </div>

          {/* Size selector */}
          {hasVariants && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Boyut
              </label>
              <div className="flex flex-wrap gap-2">
                {group.variants.map((variant, idx) => (
                  <motion.button
                    key={variant.variantId ?? idx}
                    onClick={() => setSelectedVariantIdx(idx)}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-pill text-sm font-semibold border transition-colors ${
                      idx === selectedVariantIdx
                        ? "bg-brand text-white border-brand"
                        : "border-brand text-brand bg-white"
                    }`}
                  >
                    {variant.sizeLabel} · ₺{variant.product.price.toLocaleString("tr-TR")}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Modifiers */}
          {applicableModifiers.length > 0 && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Ekstra
              </label>
              <div className="flex flex-wrap gap-2">
                {applicableModifiers.map((m) => {
                  const qty = modifierQty.get(m.id) ?? 0;
                  const selected = qty > 0;
                  const delta = Number(m.price_delta) || 0;
                  const deltaTotal = delta * Math.max(qty, 1);
                  if (!selected) {
                    return (
                      <motion.button
                        key={m.id}
                        onClick={() => toggleModifier(m.id)}
                        whileTap={{ scale: 0.95 }}
                        className="px-3.5 py-2 rounded-pill text-sm font-semibold border border-brand text-brand bg-white transition-colors"
                      >
                        + {m.name}
                        {delta !== 0 && (
                          <span className="ml-1.5 font-bold">
                            {delta > 0 ? "+" : "−"}₺{Math.abs(delta).toLocaleString("tr-TR")}
                          </span>
                        )}
                      </motion.button>
                    );
                  }
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-1.5 pl-3.5 pr-1.5 py-1 rounded-pill bg-brand text-white text-sm font-semibold border border-brand"
                    >
                      <span>+ {m.name}</span>
                      <motion.button
                        onClick={() => bumpModifier(m.id, -1)}
                        whileTap={{ scale: 0.9 }}
                        className="w-6 h-6 ml-1 rounded-full bg-white/15 flex items-center justify-center text-base leading-none"
                        aria-label="Azalt"
                      >
                        −
                      </motion.button>
                      <span className="min-w-[14px] text-center font-bold">{qty}</span>
                      <motion.button
                        onClick={() => bumpModifier(m.id, +1)}
                        whileTap={{ scale: 0.9 }}
                        className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-base leading-none"
                        aria-label="Artır"
                      >
                        +
                      </motion.button>
                      {deltaTotal !== 0 && (
                        <span className="ml-1 mr-1 font-bold">
                          {deltaTotal > 0 ? "+" : "−"}₺{Math.abs(deltaTotal).toLocaleString("tr-TR")}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
              <motion.button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full border-2 border-brand text-brand flex items-center justify-center text-lg font-light"
                whileTap={{ scale: 0.9 }}
                aria-label="Azalt"
              >
                −
              </motion.button>
              <span className="w-6 text-center font-bold text-base text-text">
                {quantity}
              </span>
              <motion.button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-lg font-light"
                whileTap={{ scale: 0.9 }}
                aria-label="Artır"
              >
                +
              </motion.button>
            </div>

            {/* Add to cart */}
            <motion.button
              onClick={handleAdd}
              className="flex-1 bg-brand text-white font-semibold rounded-pill py-3 text-sm shadow-sm"
              whileTap={{ scale: 0.97 }}
            >
              Sepete Ekle · ₺{(lineUnit * quantity).toLocaleString("tr-TR")}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
