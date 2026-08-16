-- Refines the Formule Athlète portion-customization step (built in 0014):
-- not every meal has a dedicated vegetable side, and each meal's sauce has
-- its own real name rather than a generic "sauce" add-on. Also removes the
-- "extra vegetables" repeatable add-on entirely, per product decision.

alter table meals add column if not exists veg_label text;
alter table meals add column if not exists sauce_label text;

-- Derived from each dish's existing description (already stored in meals).
update meals set veg_label = 'Légumes frais', sauce_label = 'Sauce ananas'
  where name = 'Salade exotique';
update meals set veg_label = 'Épinards', sauce_label = 'Sauce fromage frais'
  where name = 'Pâtes au saumon';
update meals set sauce_label = 'Sauce champignons' where name = 'Blé au poulet';
update meals set sauce_label = 'Sauce coco' where name = 'Lentilles & crevettes';
update meals set sauce_label = 'Sauce soubise'
  where name = 'Mousseline pomme de terre & boulettes de viande hachée';
update meals set sauce_label = 'Sauce signature' where name = 'Patate douce avec steak de viande';
update meals set sauce_label = 'Sauce café' where name = 'Purée de navet au fromage de chèvre';
update meals set sauce_label = 'Sauce datte' where name = 'Riz noir au poulet';
-- Every other meal keeps veg_label/sauce_label null (no dedicated veg side /
-- no sauce offered), which hides those options in the portions UI.

alter table order_items drop column if exists extra_veg_grams;

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
    protein_grams, starch_grams, veg_grams, sauce, unit_price
  )
  select
    v_order_id,
    (item->>'meal_id')::uuid,
    (item->>'quantity')::int,
    (item->>'protein_grams')::int,
    (item->>'starch_grams')::int,
    (item->>'veg_grams')::int,
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
