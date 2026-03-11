-- Add author display name and avatar to edition_comments (from Google OAuth user_metadata)
alter table edition_comments
  add column if not exists author_name text,
  add column if not exists author_avatar_url text;
