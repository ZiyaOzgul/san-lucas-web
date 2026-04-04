"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Category, Product, ProductGroup } from "@/lib/types";
import { CategoryPills } from "./CategoryPills";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

type Props = {
  products: Product[];
  categories: Category[];
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const SIZE_REGEX = /^(.+?)[\s\-–]+(büyük|buyuk|large|orta|medium|küçük|kucuk|small)$/i;
const LMS_REGEX = /^(.+?)\s*[-–]\s*(l|m|s)$/i;
const SIZE_MAP: Record<string, string> = {
  büyük: 'Büyük', buyuk: 'Büyük', large: 'Büyük',
  orta: 'Orta', medium: 'Orta',
  küçük: 'Küçük', kucuk: 'Küçük', small: 'Küçük',
  l: 'Büyük', m: 'Orta', s: 'Küçük',
};

function parseVariant(name: string): { baseName: string; sizeLabel: string | null } {
  let match = name.match(SIZE_REGEX);
  if (match) {
    return { baseName: match[1].trim(), sizeLabel: SIZE_MAP[match[2].toLowerCase()] ?? match[2] };
  }
  match = name.match(LMS_REGEX);
  if (match) {
    return { baseName: match[1].trim(), sizeLabel: SIZE_MAP[match[2].toLowerCase()] ?? match[2] };
  }
  return { baseName: name, sizeLabel: null };
}

function groupProducts(products: Product[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>();
  for (const product of products) {
    const { baseName, sizeLabel } = parseVariant(product.name);
    // Key by baseName only — variants of the same product may have different category_ids
    const key = baseName;
    if (!map.has(key)) {
      map.set(key, { baseName, image_url: product.image_url, category_id: product.category_id, variants: [] });
    }
    map.get(key)!.variants.push({ product, sizeLabel: sizeLabel ?? 'Standart' });
  }
  return Array.from(map.values());
}

export function ProductCatalog({ products, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);

  useEffect(() => {
    console.log('[ProductCatalog] categories:', categories.map(c => ({ id: c.id, name: c.name })));
    console.log('[ProductCatalog] products:', products.map(p => ({ id: p.id, name: p.name, category_id: p.category_id })));
  }, []);

  // Normalize category_id to number — Supabase returns it as string when column is TEXT
  const normalizedProducts = products.map((p) => ({
    ...p,
    category_id: p.category_id !== null ? Number(p.category_id) : null,
  }));

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const knownCategoryIds = new Set(categories.map((c) => c.id));

  const filtered = normalizedProducts.filter((p) => {
    const matchesCat =
      selectedCategory === null || p.category_id === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const groupedCategories = categories
    .filter((cat) => selectedCategory === null || cat.id === selectedCategory)
    .map((cat) => ({
      category: cat,
      groups: groupProducts(filtered.filter((p) => p.category_id === cat.id)),
    }))
    .filter((g) => g.groups.length > 0);

  const uncategorizedProducts = filtered.filter(
    (p) => p.category_id === null || !knownCategoryIds.has(p.category_id as number)
  );
  const uncategorizedGroups = groupProducts(uncategorizedProducts);

  const selectedCategoryColor = selectedGroup?.category_id
    ? (categoryMap.get(selectedGroup.category_id)?.color ?? null)
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

      {/* Grouped product list */}
      <motion.div
        key={selectedCategory ?? "all"}
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 px-4"
      >
        {groupedCategories.length === 0 && uncategorizedGroups.length === 0 ? (
          <p className="text-center text-white/60 py-10 text-sm">
            Ürün bulunamadı.
          </p>
        ) : (
          <>
            {groupedCategories.map(({ category, groups }) => (
              <motion.div key={category.id} variants={itemVariants} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color ?? "#e8975a" }}
                  />
                  <h2 className="text-white font-bold text-base tracking-wide">
                    {category.name}
                  </h2>
                  <div className="flex-1 h-px bg-white/20" />
                </div>
                {groups.map((group) => (
                  <ProductCard
                    key={group.baseName}
                    group={group}
                    categoryColor={category.color ?? null}
                    onSelect={setSelectedGroup}
                  />
                ))}
              </motion.div>
            ))}

            {uncategorizedGroups.length > 0 && (
              <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0 bg-brand" />
                  <h2 className="text-white font-bold text-base tracking-wide">Diğer</h2>
                  <div className="flex-1 h-px bg-white/20" />
                </div>
                {uncategorizedGroups.map((group) => (
                  <ProductCard
                    key={group.baseName}
                    group={group}
                    categoryColor="#e8975a"
                    onSelect={setSelectedGroup}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedGroup && (
          <ProductModal
            key={selectedGroup.baseName}
            group={selectedGroup}
            categoryColor={selectedCategoryColor}
            onClose={() => setSelectedGroup(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
