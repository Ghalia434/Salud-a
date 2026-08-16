-- Lets the admin set, per meal, the default starting gram amount for each
-- Formule Athlète component (protein/starch/veg) when adding/editing a
-- meal, instead of every dish always starting the client at a flat 100g.
-- Nullable: falls back to the 100g floor (ATHLETE_PRICING.minGrams) in the
-- app when unset, so existing meals keep working unchanged until an admin
-- fills these in.

alter table meals add column if not exists protein_default_grams int;
alter table meals add column if not exists starch_default_grams int;
alter table meals add column if not exists veg_default_grams int;
