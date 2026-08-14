-- Client checkout no longer requires an account (no email OTP, no /compte).
-- Orders are anonymous — the client is tracked via WhatsApp instead of a
-- login. Admin accounts are unaffected (still email/password + role check).
-- Safe to re-run.

drop policy if exists "orders_select" on orders;
drop policy if exists "orders_insert" on orders;
drop policy if exists "order_items_select" on order_items;
drop policy if exists "order_items_insert" on order_items;

alter table orders drop column if exists user_id;

create policy "orders_select" on orders for select
  using (is_admin());
create policy "orders_insert" on orders for insert
  with check (true);

create policy "order_items_select" on order_items for select
  using (is_admin());
create policy "order_items_insert" on order_items for insert
  with check (true);
