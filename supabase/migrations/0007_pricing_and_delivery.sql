-- Run this AFTER 0006_add_transformation_corporelle.sql.
-- Safe to re-run (uses ON CONFLICT / IF NOT EXISTS throughout).
--
-- Business changes:
-- - Formulas capped at 3/6/9 plates (drop 12/15/18/21 tiers).
-- - Delivery is now always a paid fee (20 MAD Casablanca / 35 MAD
--   Bouskoura), charged per order — so the old "free delivery at 21
--   plates" gift no longer applies.
-- - New "Transformation corporelle" program: 3=270, 6=540, 9=810 MAD.

delete from program_packs where plates > 9;

update program_packs set free_delivery = false;

insert into program_packs (program, plates, price, label, gift_detox, gift_gourmandise, free_delivery) values
  ('transformation_corporelle', 3, 270, 'Pack Découverte', false, false, false),
  ('transformation_corporelle', 6, 540, null, true, false, false),
  ('transformation_corporelle', 9, 810, null, true, true, false)
on conflict (program, plates) do update set
  price = excluded.price,
  label = excluded.label,
  gift_detox = excluded.gift_detox,
  gift_gourmandise = excluded.gift_gourmandise,
  free_delivery = excluded.free_delivery;

alter table orders add column if not exists delivery_fee int not null default 0;
