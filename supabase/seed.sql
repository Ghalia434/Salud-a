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

-- Bundle-tier pricing, one row per (program, plate count), from the three
-- pricing flyers. Gifts unlock at 6+ plates (detox drink), 9+ (+ gourmandise),
-- 21+ (free delivery); 21 also gets a discounted per-plate rate.
insert into program_packs (program, plates, price, label, gift_detox, gift_gourmandise, free_delivery) values
  ('perte_de_poids', 3, 210, 'Pack Découverte', false, false, false),
  ('perte_de_poids', 6, 420, null, true, false, false),
  ('perte_de_poids', 9, 630, null, true, true, false),
  ('perte_de_poids', 12, 840, null, true, true, false),
  ('perte_de_poids', 15, 1050, null, true, true, false),
  ('perte_de_poids', 18, 1260, null, true, true, false),
  ('perte_de_poids', 21, 1380, null, true, true, true),

  ('equilibre', 3, 240, 'Pack Découverte', false, false, false),
  ('equilibre', 6, 480, null, true, false, false),
  ('equilibre', 9, 720, null, true, true, false),
  ('equilibre', 12, 960, null, true, true, false),
  ('equilibre', 15, 1200, null, true, true, false),
  ('equilibre', 18, 1440, null, true, true, false),
  ('equilibre', 21, 1590, null, true, true, true),

  ('prise_de_masse', 3, 285, 'Pack Découverte', false, false, false),
  ('prise_de_masse', 6, 570, null, true, false, false),
  ('prise_de_masse', 9, 855, null, true, true, false),
  ('prise_de_masse', 12, 1140, null, true, true, false),
  ('prise_de_masse', 15, 1425, null, true, true, false),
  ('prise_de_masse', 18, 1710, null, true, true, false),
  ('prise_de_masse', 21, 1905, null, true, true, true);
