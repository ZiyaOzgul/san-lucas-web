"use client";

import { useState } from "react";
import type { Category, Product } from "@/lib/types";
import { CategoryPills } from "./CategoryPills";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

type Props = {
  products: Product[];
  categories: Category[];
};

export function ProductCatalog({ products, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const filtered = products.filter((p) => {
    const matchesCat =
      selectedCategory === null || p.category_id === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedCategory_ = selectedProduct?.category_id
    ? (categoryMap.get(selectedProduct.category_id)?.color ?? null)
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="px-4">
        <div className="flex items-center gap-2 bg-white/70 border border-border rounded-pill px-4 py-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted flex-shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Menüde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text placeholder:text-muted outline-none"
          />
        </div>
      </div>

      {/* Category pills */}
      <CategoryPills
        categories={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />

      {/* Product list */}
      <div className="flex flex-col gap-3 px-4">
        {filtered.length === 0 ? (
          <p className="text-center text-muted py-10 text-sm">
            Ürün bulunamadı.
          </p>
        ) : (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryColor={
                product.category_id
                  ? (categoryMap.get(product.category_id)?.color ?? null)
                  : null
              }
              onSelect={setSelectedProduct}
            />
          ))
        )}
      </div>

      {/* Product modal */}
      <ProductModal
        product={selectedProduct}
        categoryColor={selectedCategory_}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
