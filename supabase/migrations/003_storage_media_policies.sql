-- Storage RLS policies for the "media" bucket so authenticated admins can upload,
-- list, and delete. Public read so getPublicUrl works for anonymous visitors.

-- Allow authenticated users to upload (insert) to the media bucket
create policy "Authenticated can upload to media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'media');

-- Allow anyone to read from the media bucket (public bucket)
create policy "Public read media bucket"
  on storage.objects
  for select
  using (bucket_id = 'media');

-- Allow authenticated users to update objects in the media bucket (e.g. upsert)
create policy "Authenticated can update media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

-- Allow authenticated users to delete from the media bucket
create policy "Authenticated can delete from media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'media');
