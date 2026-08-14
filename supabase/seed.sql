-- Seed data derived from the Saludèa marketing flyers and real menu photos.
--
-- NOTE on meals: which program (Perte de poids / Équilibré / Prise de masse)
-- each dish belongs to is a placeholder split (roughly 3/3/2) with
-- calories/protein set to that program's target from the objective flyer.
-- Reassign freely via /admin/repas.

insert into meals (name, description, photo_url, calories, protein_g, program) values
  ('Riz noir au poulet', 'Riz noir, pilon caramélisé, oignons, paprika, sauce aux dattes, herbes fraîches', '/meals/riz-noir-poulet.jpeg', 450, 30, 'perte_de_poids'),
  ('Salade exotique', 'Poulet grillé, mélange de légumes frais, mozzarella, sauce ananas, herbes fraîches', '/meals/salade-exotique.jpeg', 450, 30, 'perte_de_poids'),
  ('Lentilles & crevettes', 'Lentilles corail, crevettes, sauce de coco, herbes fraîches', '/meals/lentilles-crevettes.jpeg', 450, 30, 'perte_de_poids'),
  ('Blé au poulet', 'Blé, poulet, sauce champignons, herbes fraîches', '/meals/ble-poulet.jpeg', 600, 38, 'equilibre'),
  ('Pâtes au saumon', 'Pâtes complètes, épinards, saumon, sauce au fromage frais, herbes fraîches', '/meals/pates-saumon.jpeg', 600, 38, 'equilibre'),
  ('Purée de navet au fromage de chèvre', 'Purée de navet, fromage de chèvre, émincé de viande, sauce café, herbes fraîches', '/meals/puree-navet-chevre.jpeg', 600, 38, 'equilibre'),
  ('Patate douce avec steak de viande', 'Patate douce, steak de bœuf, sauce signature, herbes fraîches', '/meals/patate-douce-steak.jpeg', 750, 45, 'prise_de_masse'),
  ('Mousseline pomme de terre & boulettes de viande hachée', 'Mousseline de pomme de terre, boulettes de viande hachée, sauce soubise, herbes fraîches', '/meals/mousseline-boulettes.jpeg', 750, 45, 'prise_de_masse');

-- Bundle-tier pricing, one row per (program, plate count). Formulas are
-- capped at 3/6/9 plates. Gifts unlock at 6+ plates (detox drink) and 9+
-- (+ gourmandise). Delivery is always a separate paid fee (see
-- DELIVERY_CITIES in src/lib/constants.ts), never a gift.
insert into program_packs (program, plates, price, label, gift_detox, gift_gourmandise, free_delivery) values
  ('perte_de_poids', 3, 210, 'Pack Découverte', false, false, false),
  ('perte_de_poids', 6, 420, null, true, false, false),
  ('perte_de_poids', 9, 630, null, true, true, false),

  ('equilibre', 3, 240, 'Pack Découverte', false, false, false),
  ('equilibre', 6, 480, null, true, false, false),
  ('equilibre', 9, 720, null, true, true, false),

  ('prise_de_masse', 3, 285, 'Pack Découverte', false, false, false),
  ('prise_de_masse', 6, 570, null, true, false, false),
  ('prise_de_masse', 9, 855, null, true, true, false),

  ('transformation_corporelle', 3, 270, 'Pack Découverte', false, false, false),
  ('transformation_corporelle', 6, 540, null, true, false, false),
  ('transformation_corporelle', 9, 810, null, true, true, false);

-- Gourmandises & boissons détox — optional add-ons offered between the
-- meal-selection and cart steps. 6-plate packs gift one détox, 9-plate
-- packs gift one détox + one gourmandise.
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
  ('Détox Betterave', null, 'Betterave, pomme rouge, citron, gingembre', null, 25, 'detox', '/placeholder-meal.svg'),
  ('Détox Concombre', null, 'Concombre, pomme verte, épinards, citron, gingembre', null, 25, 'detox', '/placeholder-meal.svg'),
  ('Détox Carotte', null, 'Carotte, orange, citron, curcuma', null, 25, 'detox', '/placeholder-meal.svg');
