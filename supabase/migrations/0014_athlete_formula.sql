-- Formule Athlète: a 5th objective where the client customizes each meal's
-- protein/starch/vegetable portions (in grams) instead of picking a fixed
-- bundle price. Run this AFTER 0013_add_athlete_program.sql.
--
-- Pricing model: program_packs still holds the "plates" tiers (3/6/9) for
-- UI/step reuse, but at price = 0 — the real total is the sum of each
-- customized order_item's unit_price × quantity, computed client-side and
-- passed as orders.pack_price (same column every other program already
-- uses), not a new column. This keeps every downstream total/receipt/admin
-- display working unchanged.
--
-- No calorie/protein-per-gram values are invented here (none exist yet in
-- the source data) — meals.protein_label/starch_label only drive the UI
-- labels ("Poulet", "Blé", ...). When real per-100g nutrition data is
-- available, add meals.protein_kcal_per_100g / protein_protein_g_per_100g
-- (and the starch equivalents) and wire them into the portions page.

alter table meals add column if not exists protein_label text;
alter table meals add column if not exists starch_label text;

alter table order_items add column if not exists protein_grams int;
alter table order_items add column if not exists starch_grams int;
alter table order_items add column if not exists veg_grams int;
alter table order_items add column if not exists extra_veg_grams int;
alter table order_items add column if not exists sauce boolean not null default false;
alter table order_items add column if not exists unit_price numeric;

-- Labels derived from each dish's existing description. Meals with no
-- protein_label/starch_label (Salade exotique) are treated as a single
-- vegetable-priced component in the Athlete portion-customization UI.
update meals set protein_label = 'Poulet', starch_label = 'Riz noir' where name = 'Riz noir au poulet';
update meals set protein_label = 'Poulet', starch_label = 'Blé' where name = 'Blé au poulet';
update meals set protein_label = 'Crevettes', starch_label = 'Lentilles' where name = 'Lentilles & crevettes';
update meals set protein_label = 'Saumon', starch_label = 'Pâtes' where name = 'Pâtes au saumon';
update meals set protein_label = 'Steak de bœuf', starch_label = 'Patate douce' where name = 'Patate douce avec steak de viande';
update meals set protein_label = 'Viande hachée', starch_label = 'Pomme de terre' where name = 'Mousseline pomme de terre & boulettes de viande hachée';
update meals set protein_label = 'Viande', starch_label = 'Purée de navet' where name = 'Purée de navet au fromage de chèvre';
-- Salade exotique intentionally left null/null.

insert into program_packs (program, plates, price, label, gift_detox, gift_gourmandise, free_delivery) values
  ('athlete', 3, 0, 'Pack Découverte', false, false, false),
  ('athlete', 6, 0, null, false, false, false),
  ('athlete', 9, 0, null, false, false, false)
on conflict (program, plates) do update set
  price = excluded.price,
  label = excluded.label,
  gift_detox = excluded.gift_detox,
  gift_gourmandise = excluded.gift_gourmandise,
  free_delivery = excluded.free_delivery;

-- Extend create_order() to persist per-item customization when present
-- (Athlete orders) — absent for every other program, so their items are
-- inserted exactly as before (all six new columns stay null/false).
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
    protein_grams, starch_grams, veg_grams, extra_veg_grams, sauce, unit_price
  )
  select
    v_order_id,
    (item->>'meal_id')::uuid,
    (item->>'quantity')::int,
    (item->>'protein_grams')::int,
    (item->>'starch_grams')::int,
    (item->>'veg_grams')::int,
    (item->>'extra_veg_grams')::int,
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
