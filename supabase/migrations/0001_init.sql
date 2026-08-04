-- Saludèa schema: profiles, meals, program packs, orders.

create extension if not exists "pgcrypto";

create type program_type as enum ('perte_de_poids', 'equilibre', 'prise_de_masse');
create type order_status as enum ('en_attente', 'confirmee', 'en_preparation', 'en_livraison', 'livree');
create type user_role as enum ('client', 'admin');

-- profiles ------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text unique,
  address text,
  quartier text,
  city text not null default 'Casablanca',
  role user_role not null default 'client',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up (phone OTP
-- for clients, email/password for admin), so the app never has to handle
-- a "user exists but has no profile" state.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- meals -----------------------------------------------------------------

create table meals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  photo_url text,
  calories int not null,
  protein_g int not null,
  program program_type not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- program_packs -----------------------------------------------------------

create table program_packs (
  id uuid primary key default gen_random_uuid(),
  program program_type not null,
  plates int not null,
  price int not null,
  label text,
  gift_detox boolean not null default false,
  gift_gourmandise boolean not null default false,
  free_delivery boolean not null default false,
  unique (program, plates)
);

-- orders ------------------------------------------------------------------

create sequence order_number_seq start 1;

create function generate_order_number()
returns text
language sql
as $$
  select 'SLD-' || lpad(nextval('order_number_seq')::text, 6, '0');
$$;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references profiles (id) on delete cascade,
  program program_type not null,
  pack_plates int not null,
  pack_price int not null,
  full_name text not null,
  phone text not null,
  address text not null,
  quartier text not null,
  city text not null default 'Casablanca',
  gift_detox boolean not null default false,
  gift_gourmandise boolean not null default false,
  free_delivery boolean not null default false,
  status order_status not null default 'en_attente',
  created_at timestamptz not null default now()
);

create function set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := generate_order_number();
  end if;
  return new;
end;
$$;

create trigger trg_set_order_number
  before insert on orders
  for each row execute procedure set_order_number();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  meal_id uuid not null references meals (id),
  quantity int not null default 1
);

create index idx_orders_user_id on orders (user_id);
create index idx_orders_status on orders (status);
create index idx_order_items_order_id on order_items (order_id);
create index idx_meals_program on meals (program);

-- Row Level Security --------------------------------------------------------

alter table profiles enable row level security;
alter table meals enable row level security;
alter table program_packs enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: a client can see/edit only their own row; admins see/edit all.
create policy "profiles_select" on profiles for select
  using (auth.uid() = id or is_admin());
create policy "profiles_insert" on profiles for insert
  with check (auth.uid() = id);
create policy "profiles_update" on profiles for update
  using (auth.uid() = id or is_admin());

-- meals: readable by anyone (menu is public), writable by admins only.
create policy "meals_select" on meals for select using (true);
create policy "meals_insert" on meals for insert with check (is_admin());
create policy "meals_update" on meals for update using (is_admin());
create policy "meals_delete" on meals for delete using (is_admin());

-- program_packs: readable by anyone, writable by admins only.
create policy "program_packs_select" on program_packs for select using (true);
create policy "program_packs_insert" on program_packs for insert with check (is_admin());
create policy "program_packs_update" on program_packs for update using (is_admin());
create policy "program_packs_delete" on program_packs for delete using (is_admin());

-- orders: a client can see/create only their own orders; only admins update status.
create policy "orders_select" on orders for select
  using (auth.uid() = user_id or is_admin());
create policy "orders_insert" on orders for insert
  with check (auth.uid() = user_id);
create policy "orders_update" on orders for update
  using (is_admin());

-- order_items: follow the parent order's visibility/ownership.
create policy "order_items_select" on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_id and (o.user_id = auth.uid() or is_admin())
    )
  );
create policy "order_items_insert" on order_items for insert
  with check (
    exists (
      select 1 from orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );
