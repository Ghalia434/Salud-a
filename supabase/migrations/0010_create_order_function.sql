-- Root cause of the persistent "new row violates row-level security policy
-- for table orders" error: the app does `.insert(...).select().single()`,
-- and in Postgres an INSERT ... RETURNING must also satisfy the table's
-- SELECT policy — which is admin-only (is_admin()). So the insert itself
-- was allowed, but reading the row back to return it was not, and Postgres
-- surfaces that as a generic RLS violation.
--
-- Fix: a SECURITY DEFINER function that inserts the order + its items and
-- returns just the id/order_number, bypassing RLS internally. This also
-- lets us lock direct table INSERT back down to admin-only, so random
-- clients can no longer write arbitrary rows straight into orders/
-- order_items — every anonymous order must go through this function.

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
  p_items jsonb
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

  return query select v_order_id, v_order_number;
end;
$$;

grant execute on function create_order(
  program_type, int, int, int, text, text, text, text, text,
  boolean, boolean, boolean, jsonb
) to anon, authenticated;

-- Lock direct table writes back down to admin-only — all client order
-- creation now goes through create_order() above.
drop policy if exists "orders_insert" on orders;
create policy "orders_insert" on orders for insert
  with check (is_admin());

drop policy if exists "order_items_insert" on order_items;
create policy "order_items_insert" on order_items for insert
  with check (is_admin());
