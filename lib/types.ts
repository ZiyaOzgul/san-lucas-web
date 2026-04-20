export type Category = {
  id: number;
  name: string;
  color: string | null;
  image_url?: string | null;
};

export type DbVariant = {
  id: number;
  name: string;
  price: number;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  category_id: number | null;
  image_url: string | null;
  product_variants: DbVariant[];
};

export type Table = {
  id: number;
  name: string;
  status: string;
};

export type ProductVariant = {
  product: Product;
  sizeLabel: string;
  variantId: number | null;
};

export type ProductGroup = {
  baseName: string;
  image_url: string | null;
  category_id: number | null;
  variants: ProductVariant[];
};

export type CartItem = {
  productId: number;
  productName: string;
  variantId: number | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  notes?: string;
};

export type OrderType = "pending" | "active";

export type CreateOrderResult =
  | { success: true; orderId: number }
  | { success: false; error: string };
