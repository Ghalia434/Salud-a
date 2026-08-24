-- Formule Athlète: protein/starch/veg were priced at one global rate for
-- every dish (athlete_pricing_settings). The admin now needs to price each
-- dish's actual ingredient individually (e.g. Poulet in one dish vs Saumon
-- in another), so these per-meal override prices are added — priced per
-- 10g like the global rate they override. When null, the app falls back
-- to athlete_pricing_settings' rate. Run this AFTER
-- 0018_athlete_pricing_settings.sql.

alter table meals add column if not exists protein_price_per_10g numeric;
alter table meals add column if not exists starch_price_per_10g numeric;
alter table meals add column if not exists veg_price_per_10g numeric;
