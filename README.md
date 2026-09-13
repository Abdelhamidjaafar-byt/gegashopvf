# ElectroGega — E-Commerce Platform

Full-stack electronics store: React 19 + TypeScript + Vite + Tailwind + shadcn/ui on the front,
Supabase (PostgreSQL + Auth + Realtime) on the back. English/French i18n, MAD pricing,
Cathedis delivery options, WhatsApp order handoff to the platform admin, reviews, wishlist, address book, and a
realtime admin hub with role-based access.

## Quick start

```bash
npm install
cp .env.example .env   # fill in your Supabase credentials
npm run dev
```

> `.env` is required — the app throws at startup if the Supabase credentials are
> missing or invalid.

## Connecting your Supabase project

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. In the **SQL Editor**, run `supabase/schema.sql` first, then `supabase/seed.sql`.
   - `schema.sql` creates all tables (`users`, `products`, `categories`, `brands`,
     `orders`, `addresses`, `reviews`, `wishlists`), the auth trigger, RLS policies,
     and enables realtime for the catalog and orders.
   - `seed.sql` inserts the demo catalog (6 categories, 8 brands, 10 products).
3. Copy your **Project URL** and **anon/publishable key** (Settings → API) into `.env`.
4. Restart the dev server / rebuild.

### Authentication & the super admin

- Email + password sign-up/sign-in via Supabase Auth.
- For instant testing, disable **Confirm email** under Authentication → Sign In / Providers.
- **The first user who registers becomes the admin (super admin).** After that, admins
  grant or revoke the admin role from the Admin hub → Users tab — or via SQL:

  ```sql
  update public.users set role = 'admin' where email = 'you@example.com';
  ```

### Realtime

Products, categories, brands and orders are added to the `supabase_realtime`
publication by `schema.sql`. The admin hub and storefront update live — open two
browsers and place an order to see it appear instantly.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |

## Notes

- Product images uploaded in the admin panel are resized client-side (canvas, max 800px,
  JPEG) and stored as base64 in the `products.images` jsonb column.
- Seeded product images are static files in `public/products/` referenced as
  `/products/*.jpg`. If you host the built app under a subpath, update those paths.
- There is no online payment: checkout collects billing details, saves the order, and
  opens WhatsApp with a prefilled order message addressed to the platform admin's number
  (`public.admin_whatsapp()` in `supabase/schema.sql`, set per-admin under Profile →
  Account details). If no admin number is set, orders fall back to the fallback number
  in `src/lib/store.ts`.
