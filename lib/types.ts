export type Category = {
  id: number;
  name: string;
  color: string | null;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  category_id: number | null;
  image_url: string | null;
};

export type Table = {
  id: number;
  name: string;
  status: string;
};

export type ProductVariant = {
  product: Product;
  sizeLabel: string;
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
  quantity: number;
  unitPrice: number;
  notes?: string;
};

export type OrderType = "pending" | "active";

export type CreateOrderResult =
  | { success: true; orderId: number }
  | { success: false; error: string };
