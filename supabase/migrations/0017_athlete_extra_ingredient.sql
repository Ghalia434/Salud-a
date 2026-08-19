-- Formule Athlète: some dishes need a 4th customizable component beyond
-- protein/starch/veg, priced at its own rate (e.g. Salade exotique's
-- mozzarella at 20 DH/100g, vs. the fixed global protein/starch/veg rates).
-- meals.extra_price_per_100g carries that per-meal rate; the app divides it
-- by 100 to get DH/g.

alter table meals add column if not exists extra_label text;
alter table meals add column if not exists extra_price_per_100g numeric;
alter table meals add column if not exists extra_default_grams int;

alter table order_items add column if not exists extra_grams int;

-- Salade exotique: add Poulet as its protein component, and Mozzarella
-- (20 DH/100g) as the new custom-priced extra component.
update meals set protein_label = 'Poulet', extra_label = 'Mozzarella', extra_price_per_100g = 20
  where name = 'Salade exotique';

create or replace function create_order(
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

  insert into order_items (
    order_id, meal_id, quantity,
    protein_grams, starch_grams, veg_grams, extra_grams, sauce, unit_price
  )
  select
    v_order_id,
    (item->>'meal_id')::uuid,
    (item->>'quantity')::int,
    (item->>'protein_grams')::int,
    (item->>'starch_grams')::int,
    (item->>'veg_grams')::int,
    (item->>'extra_grams')::int,
    coalesce((item->>'sauce')::boolean, false),
    (item->>'unit_price')::numeric
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
