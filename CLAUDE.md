@AGENTS.md

## Project Overview

QR menu web app for San Lucas Cafe. Customers scan a QR code at their table, browse the menu, and submit orders. This app **only creates orders** — it writes `orders` + `order_items` to the shared Supabase project with `status = 'pending'`. Everything else (approval, kitchen display, payment, reports) is handled by the Electron POS app (`../san-lucas`).

---

## Relationship to POS App

- Shares the same Supabase project: `gscuotgjxmcemmkbajtd`
- Shares tables: `products`, `categories`, `orders`, `order_items`, `tables`
- **This app only writes** — never reads orders back, never modifies existing records
- POS app receives pending orders via Supabase Realtime and acts on them

---

## Tech Stack

- **Next.js 16.2.1** — App Router (read `node_modules/next/dist/docs/` before writing any Next.js code)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase JS Client** — database writes only

---

## Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://gscuotgjxmcemmkbajtd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Never hardcode these. User will provide the `.env.local` file.

---

## App Flow

1. Customer scans QR code → URL encodes `table_id` (e.g. `/menu?table=3`)
2. App reads `table_id` from URL — no auth, no login
3. Customer browses products grouped by category
4. Customer adds items to cart (client-side state only)
5. Customer submits order:
   - Insert `orders` row: `{ table_id, status: 'pending', total, local_id: uuid }`
   - Insert `order_items` rows: `{ order_id, product_id, quantity, unit_price, local_id: uuid }`
6. Show confirmation screen — order is done from this app's perspective

---

## Database Schema (Shared with POS App)

```sql
create table categories (
  id serial primary key,
  name text not null,
  color text default '#e8975a'
);

create table products (
  id serial primary key,
  name text not null,
  price decimal(10,2) not null,
  stock integer default 0,
  category_id integer references categories(id),
  image_url text,
  is_active boolean default true,
  created_at timestamp default now()
);

create table tables (
  id serial primary key,
  name text not null,
  status text default 'empty'
);

create table orders (
  id serial primary key,
  local_id text unique,
  table_id integer references tables(id),
  status text default 'active', -- this app writes 'pending'
  payment_method text,
  total decimal(10,2) default 0,
  is_synced boolean default false,
  created_at timestamp default now(),
  closed_at timestamp
);

create table order_items (
  id serial primary key,
  local_id text unique,
  order_id integer references orders(id),
  product_id integer references products(id),
  quantity integer not null,
  unit_price decimal(10,2) not null,
  is_synced boolean default false
);
```

---

## Planned Folder Structure

```
san-lucas-web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              -- redirect or landing
│   ├── menu/
│   │   └── page.tsx          -- main QR menu page (?table=X)
│   └── api/
│       └── orders/
│           └── route.ts      -- POST: create order + items
├── components/
│   ├── MenuPage/
│   ├── CategoryTabs/
│   ├── ProductCard/
│   ├── Cart/
│   └── OrderConfirmation/
├── lib/
│   └── supabase.ts           -- supabase client (singleton)
├── types/
│   └── index.ts              -- Product, Category, CartItem, etc.
├── .env.local
└── CLAUDE.md
```

---

## Design System

Mirrors the POS app's color palette for brand consistency. Designs will be provided by the user — implement exactly from designs.

POS app accent color for reference: `#e8975a` (amber/orange).

---

## Coding Rules

1. **Tailwind CSS v4 only** — no custom CSS files, no inline styles.
2. **TypeScript strict** — no `any`.
3. **Supabase keys** in `.env.local` only, use `NEXT_PUBLIC_` prefix for client-side access.
4. **`local_id`**: generate a `crypto.randomUUID()` for every `order` and `order_item` at creation time.
5. **`status: 'pending'`**: all orders created by this app use this status.
6. **`unit_price`**: snapshot the product's current price at order time — never recalculate from product table later.
7. **No auth** — this is a public-facing menu. Table identity comes from the URL param only.
8. **No order reads** — don't fetch orders back. Show confirmation from local state after a successful insert.
9. **Currency**: always `₺` symbol.
10. **Locale**: dates/times in `tr-TR` locale if displayed.
11. **Only show active products**: filter `is_active = true` when fetching products.
12. **Mobile-first** — this app is used on phones. Design for small screens first.
