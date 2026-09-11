-- ============================================================
-- ElectroGega — Database schema, triggers, RLS, realtime
-- Run this FIRST in your Supabase project (SQL Editor or CLI).
-- Safe to re-run: guarded against duplicate objects where needed.
-- ============================================================

-- ---------- Types ----------
do $$ begin
  create type public.user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

-- ---------- Tables ----------
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  display_name text,
  phone       text,
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now()
);

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  parent_id  uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  price       numeric(10,2) not null check (price >= 0),
  stock       integer not null default 0 check (stock >= 0),
  category_id uuid references public.categories(id) on delete set null,
  brand_id    uuid references public.brands(id) on delete set null,
  images      jsonb not null default '[]'::jsonb,   -- array of base64 data-URLs or paths
  specs       jsonb not null default '{}'::jsonb,   -- free-form key/value specifications
  is_featured boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  label       text not null default 'Home',
  full_name   text not null,
  phone       text not null,
  street      text not null,
  city        text not null,
  postal_code text,
  country     text not null default 'Morocco',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  customer_email   text not null,
  items            jsonb not null,                 -- [{product_id,name,price,qty,image}]
  subtotal         numeric(10,2) not null,
  shipping_method  text not null,                  -- 'cathedis_standard' | 'cathedis_express'
  shipping_cost    numeric(10,2) not null default 0,
  total            numeric(10,2) not null,
  payment_method   text not null,                  -- 'card' | 'cod'
  shipping_address jsonb not null,                 -- {full_name,phone,street,city,postal_code,country}
  status           text not null default 'processing'
                   check (status in ('processing','shipped','delivered','cancelled')),
  created_at       timestamptz not null default now()
);

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  comment    text not null default '',
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create table if not exists public.wishlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------- Indexes ----------
create index if not exists categories_parent_idx   on public.categories(parent_id);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_brand_idx    on public.products(brand_id);
create index if not exists orders_user_idx       on public.orders(user_id);
create index if not exists reviews_product_idx   on public.reviews(product_id);
create index if not exists wishlists_user_idx    on public.wishlists(user_id);
create index if not exists addresses_user_idx    on public.addresses(user_id);

-- ---------- Helpers ----------
-- Admin check used by RLS policies (security definer avoids RLS recursion).
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- Auth sync ----------
-- New auth user -> public.users row.
-- The FIRST registered user becomes 'admin' (the super admin).
-- After that, only existing admins can grant the admin role
-- (Admin dashboard -> Users tab), or via SQL:
--   update public.users set role = 'admin' where email = 'you@example.com';
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    case when (select count(*) from public.users) = 0
         then 'admin'::public.user_role
         else 'customer'::public.user_role
    end
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only admins may change roles (prevents privilege self-escalation).
create or replace function public.protect_user_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an admin can change user roles';
  end if;
  return new;
end $$;

drop trigger if exists users_protect_role on public.users;
create trigger users_protect_role
  before update on public.users
  for each row execute function public.protect_user_role();

-- ---------- Row Level Security ----------
alter table public.users      enable row level security;
alter table public.categories enable row level security;
alter table public.brands     enable row level security;
alter table public.products   enable row level security;
alter table public.addresses  enable row level security;
alter table public.orders     enable row level security;
alter table public.reviews    enable row level security;
alter table public.wishlists  enable row level security;

-- users: read/update own row; admins read/update everyone. No client inserts (trigger only).
drop policy if exists users_select on public.users;
create policy users_select on public.users
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists users_update on public.users;
create policy users_update on public.users
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- catalog: public read, admin write
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select using (true);
drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories
  for insert with check (public.is_admin());
drop policy if exists categories_update on public.categories;
create policy categories_update on public.categories
  for update using (public.is_admin());
drop policy if exists categories_delete on public.categories;
create policy categories_delete on public.categories
  for delete using (public.is_admin());

drop policy if exists brands_read on public.brands;
create policy brands_read on public.brands for select using (true);
drop policy if exists brands_write on public.brands;
create policy brands_write on public.brands
  for insert with check (public.is_admin());
drop policy if exists brands_update on public.brands;
create policy brands_update on public.brands
  for update using (public.is_admin());
drop policy if exists brands_delete on public.brands;
create policy brands_delete on public.brands
  for delete using (public.is_admin());

drop policy if exists products_read on public.products;
create policy products_read on public.products for select using (true);
drop policy if exists products_write on public.products;
create policy products_write on public.products
  for insert with check (public.is_admin());
drop policy if exists products_update on public.products;
create policy products_update on public.products
  for update using (public.is_admin());
drop policy if exists products_delete on public.products;
create policy products_delete on public.products
  for delete using (public.is_admin());

-- addresses: owner CRUD, admin read
drop policy if exists addresses_owner on public.addresses;
create policy addresses_owner on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists addresses_admin_read on public.addresses;
create policy addresses_admin_read on public.addresses
  for select using (public.is_admin());

-- orders: customer creates & reads own; admin reads all & updates status
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert with check (auth.uid() = user_id);
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders
  for update using (public.is_admin());

-- reviews: public read; authenticated users manage their own
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select using (true);
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews
  for insert with check (auth.uid() = user_id);
drop policy if exists reviews_update on public.reviews;
create policy reviews_update on public.reviews
  for update using (auth.uid() = user_id);
drop policy if exists reviews_delete on public.reviews;
create policy reviews_delete on public.reviews
  for delete using (auth.uid() = user_id or public.is_admin());

-- wishlists: strictly owner-only
drop policy if exists wishlists_owner on public.wishlists;
create policy wishlists_owner on public.wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Realtime ----------
do $$ begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.categories;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.brands;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;
