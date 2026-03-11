-- Show who liked: store display name and avatar on like (from Google OAuth)
alter table edition_likes
  add column if not exists liker_name text,
  add column if not exists liker_avatar_url text;
