-- LIKES and COMMENTS on editions (authenticated users only)

-- Edition likes: one row per user per edition
create table edition_likes (
  edition_id uuid references editions(id) on delete cascade not null,
  user_id uuid not null,
  created_at timestamptz default now(),
  primary key (edition_id, user_id)
);

-- Edition comments
create table edition_comments (
  id uuid default gen_random_uuid() primary key,
  edition_id uuid references editions(id) on delete cascade not null,
  user_id uuid not null,
  body text not null,
  created_at timestamptz default now()
);

create index edition_likes_edition_id on edition_likes(edition_id);
create index edition_comments_edition_id on edition_comments(edition_id);

alter table edition_likes enable row level security;
alter table edition_comments enable row level security;

-- Only authenticated users can read likes and comments
create policy "Authenticated read edition_likes"
  on edition_likes for select
  using (auth.role() = 'authenticated');

create policy "Authenticated read edition_comments"
  on edition_comments for select
  using (auth.role() = 'authenticated');

-- Authenticated users can insert/delete their own like
create policy "Authenticated insert own like"
  on edition_likes for insert
  with check (auth.uid() = user_id);

create policy "Authenticated delete own like"
  on edition_likes for delete
  using (auth.uid() = user_id);

-- Authenticated users can insert comment; can delete own comment
create policy "Authenticated insert comment"
  on edition_comments for insert
  with check (auth.uid() = user_id);

create policy "Authenticated delete own comment"
  on edition_comments for delete
  using (auth.uid() = user_id);
