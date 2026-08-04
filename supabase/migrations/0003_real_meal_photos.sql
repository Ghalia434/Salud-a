-- Attach real dish photos, and correct two placeholder meal names/
-- descriptions now that real menu data is available. Matched by the
-- current (placeholder) name, since ids differ per project.

update meals set
  photo_url = '/meals/salade-exotique.jpeg'
where name = 'Salade exotique';

update meals set
  photo_url = '/meals/pates-saumon.jpeg'
where name = 'Pâtes au saumon';

update meals set
  photo_url = '/meals/lentilles-crevettes.jpeg'
where name = 'Lentilles & crevettes';

update meals set
  photo_url = '/meals/riz-noir-poulet.jpeg'
where name = 'Riz noir au poulet';

update meals set
  photo_url = '/meals/patate-douce-steak.jpeg',
  description = 'Patate douce, steak de bœuf, sauce signature, herbes fraîches'
where name = 'Patate douce avec steak de viande';

update meals set
  name = 'Blé au poulet',
  description = 'Blé, poulet, sauce champignons, herbes fraîches',
  photo_url = '/meals/ble-poulet.jpeg'
where name = 'Ebly au poulet';

update meals set
  name = 'Mousseline pomme de terre & boulettes de viande hachée',
  description = 'Mousseline de pomme de terre, boulettes de viande hachée, sauce soubise, herbes fraîches',
  photo_url = '/meals/mousseline-boulettes.jpeg'
where name = 'Purée & viande hachée';

update meals set
  name = 'Purée de navet au fromage de chèvre',
  description = 'Purée de navet, fromage de chèvre, émincé de viande, sauce café, herbes fraîches',
  photo_url = '/meals/puree-navet-chevre.jpeg'
where name = 'Patates rôties & viande hachée de poulet';
