-- Run this AFTER creating the "meal-photos" bucket in the dashboard
-- (Storage → New bucket → name "meal-photos" → Public bucket: ON).
-- Safe to re-run.
--
-- Public buckets serve file *content* at their public URL without an RLS
-- check, but reading object *metadata* through the API (which upload()
-- does internally, to return the created row) still goes through RLS — so
-- a SELECT policy is required too, or every upload fails with a
-- "row violates row-level security policy" error even though the insert
-- itself was allowed.

drop policy if exists "meal_photos_select" on storage.objects;
drop policy if exists "meal_photos_admin_insert" on storage.objects;
drop policy if exists "meal_photos_admin_update" on storage.objects;
drop policy if exists "meal_photos_admin_delete" on storage.objects;

create policy "meal_photos_select" on storage.objects
  for select
  using (bucket_id = 'meal-photos');

create policy "meal_photos_admin_insert" on storage.objects
  for insert
  with check (bucket_id = 'meal-photos' and public.is_admin());

create policy "meal_photos_admin_update" on storage.objects
  for update
  using (bucket_id = 'meal-photos' and public.is_admin());

create policy "meal_photos_admin_delete" on storage.objects
  for delete
  using (bucket_id = 'meal-photos' and public.is_admin());
