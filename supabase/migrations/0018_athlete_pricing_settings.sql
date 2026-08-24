-- Moves the Formule Athlète global per-component rates (protein/starch/veg)
-- and the flat extra-sauce price out of hardcoded app constants into an
-- admin-editable settings row, priced per 10g since that's the increment
-- the client actually adjusts in the portions UI.

create table if not exists athlete_pricing_settings (
  id boolean primary key default true check (id),
  protein_price_per_10g numeric not null default 2.2,
  starch_price_per_10g numeric not null default 1.8,
  veg_price_per_10g numeric not null default 0.6,
  sauce_price numeric not null default 8,
  updated_at timestamptz not null default now()
);

insert into athlete_pricing_settings (id) values (true)
  on conflict (id) do nothing;

alter table athlete_pricing_settings enable row level security;

-- Readable by anyone (the client ordering flow needs it to price meals
-- live), writable by admins only — same pattern as program_packs.
drop policy if exists "athlete_pricing_settings_select" on athlete_pricing_settings;
create policy "athlete_pricing_settings_select" on athlete_pricing_settings
  for select using (true);

drop policy if exists "athlete_pricing_settings_update" on athlete_pricing_settings;
create policy "athlete_pricing_settings_update" on athlete_pricing_settings
  for update using (is_admin());
