-- Persist purchased extras and program-tier gifts (détox/gourmandise) on an
-- order, and extend create_order() to accept them.

create table order_extras (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  extra_id uuid not null references extras (id),
  quantity int not null default 1,
  is_gift boolean not null default false
);

create index idx_order_extras_order_id on order_extras (order_id);

alter table order_extras enable row level security;

create policy "order_extras_select" on order_extras for select using (is_admin());
create policy "order_extras_insert" on order_extras for insert with check (is_admin());

-- Replace create_order() to also accept extras/gifts. Drop first since the
-- parameter list is changing (would otherwise create a second overload).
drop function if exists create_order(
  program_type, int, int, int, text, text, text, text, text,
  boolean, boolean, boolean, jsonb
);

create function create_order(
  p_program program_type,
  p_pack_plates int,
  p_pack_price int,
  p_delivery_fee int,
  p_full_name text,
  p_phone text,
  p_address text,
  p_quartier text,
  p_city text,
  p_gift_detox boolean,
  p_gift_gourmandise boolean,
  p_free_delivery boolean,
  p_items jsonb,
  p_extras jsonb default '[]'::jsonb
)
returns table (order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
begin
  if p_pack_plates < 3 then
    raise exception 'pack_plates must be at least 3';
  end if;

  insert into orders (
    program, pack_plates, pack_price, delivery_fee,
    full_name, phone, address, quartier, city,
    gift_detox, gift_gourmandise, free_delivery
  ) values (
    p_program, p_pack_plates, p_pack_price, p_delivery_fee,
    p_full_name, p_phone, p_address, p_quartier, p_city,
    p_gift_detox, p_gift_gourmandise, p_free_delivery
  )
  returning id, orders.order_number into v_order_id, v_order_number;

  insert into order_items (order_id, meal_id, quantity)
  select v_order_id, (item->>'meal_id')::uuid, (item->>'quantity')::int
  from jsonb_array_elements(p_items) as item;

  insert into order_extras (order_id, extra_id, quantity, is_gift)
  select
    v_order_id,
    (extra->>'extra_id')::uuid,
    coalesce((extra->>'quantity')::int, 1),
    coalesce((extra->>'is_gift')::boolean, false)
  from jsonb_array_elements(p_extras) as extra;

  return query select v_order_id, v_order_number;
end;
$$;

grant execute on function create_order(
  program_type, int, int, int, text, text, text, text, text,
  boolean, boolean, boolean, jsonb, jsonb
) to anon, authenticated;
