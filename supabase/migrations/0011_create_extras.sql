-- Gourmandises & boissons détox, offered as an optional add-on step
-- between "Repas" and "Panier".

create type extra_category as enum ('gourmandise', 'detox');

create table extras (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  ingredients text,
  portion text,
  price int not null,
  category extra_category not null,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_extras_category on extras (category);

alter table extras enable row level security;

create policy "extras_select" on extras for select using (true);
create policy "extras_insert" on extras for insert with check (is_admin());
create policy "extras_update" on extras for update using (is_admin());
create policy "extras_delete" on extras for delete using (is_admin());

insert into extras (name, description, ingredients, portion, price, category, photo_url) values
  (
    'Banana Fit Cake',
    'Un gâteau healthy, moelleux et naturellement sucré, idéal pour une pause gourmande sans culpabiliser.',
    'Banane, farine complète, noix, sauce au chocolat noir',
    'Morceau de 80 g',
    20,
    'gourmandise',
    '/placeholder-meal.svg'
  ),
  (
    'Boules d''énergie Dattes',
    'Des bouchées énergétiques riches en fibres et en bons lipides, parfaites avant ou après une séance de sport.',
    'Dattes, beurre de cacahuète, flocons d''avoine, graines de sésame',
    '5 boules (25 g chacune)',
    35,
    'gourmandise',
    '/placeholder-meal.svg'
  ),
  (
    'Boules d''énergie Goji',
    'Une collation énergisante et riche en antioxydants, idéale pour une pause saine.',
    'Baies de goji, beurre de cacahuète, graines de chia',
    '5 boules (25 g chacune)',
    35,
    'gourmandise',
    '/placeholder-meal.svg'
  ),
  (
    'Détox Betterave',
    null,
    'Betterave, pomme rouge, citron, gingembre',
    null,
    25,
    'detox',
    '/placeholder-meal.svg'
  ),
  (
    'Détox Concombre',
    null,
    'Concombre, pomme verte, épinards, citron, gingembre',
    null,
    25,
    'detox',
    '/placeholder-meal.svg'
  ),
  (
    'Détox Carotte',
    null,
    'Carotte, orange, citron, curcuma',
    null,
    25,
    'detox',
    '/placeholder-meal.svg'
  );
