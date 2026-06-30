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
  points_value: number;
  product_variants: DbVariant[];
};

export type Modifier = {
  id: number;
  category_id: number | null;
  product_id: number | null;
  name: string;
  price_delta: number;
  sort_order: number;
};

export type CartItemModifier = {
  modifierId: number;
  name: string;
  priceDelta: number;
  quantity: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  loyalty_points: number | null;
};

export type CustomerOrder = {
  id: number;
  total: number;
  status: string;
  created_at: string | null;
  closed_at: string | null;
  table_id: number | null;
  order_items: {
    id: number;
    quantity: number;
    unit_price: number;
    products: { id: number; name: string; points_value: number } | null;
    order_item_modifiers: {
      name: string;
      price_delta: number;
      quantity: number;
    }[];
  }[];
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
  pointsValue: number;
  notes?: string;
  modifiers: CartItemModifier[];
};

export type OrderType = "pending" | "active";

export type CreateOrderResult =
  | { success: true; orderId: number }
  | { success: false; error: string };
