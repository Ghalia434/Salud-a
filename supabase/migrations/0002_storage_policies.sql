-- Run this AFTER creating the "meal-photos" bucket in the dashboard
-- (Storage → New bucket → name "meal-photos" → Public bucket: ON).
--
-- Public buckets serve files at their public URL without an RLS check, so
-- no SELECT policy is needed for read access. Writes still go through
-- storage.objects RLS, so only admins may upload/replace/delete photos.

create policy "meal_photos_admin_insert" on storage.objects
  for insert
  with check (bucket_id = 'meal-photos' and public.is_admin());

create policy "meal_photos_admin_update" on storage.objects
  for update
  using (bucket_id = 'meal-photos' and public.is_admin());

create policy "meal_photos_admin_delete" on storage.objects
  for delete
  using (bucket_id = 'meal-photos' and public.is_admin());
