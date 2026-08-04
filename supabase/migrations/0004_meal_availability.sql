-- Distinguish "hidden from the menu entirely" (existing `active` column)
-- from "shown but temporarily out of stock" (new `available` column) — a
-- meal can be visible but not addable to the cart.

alter table meals add column available boolean not null default true;
