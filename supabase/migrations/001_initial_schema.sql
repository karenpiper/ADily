-- EDITIONS: each weekly issue
create table editions (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  hero_summary text not null,
  hero_description text not null default 'A lightweight, always-on social intelligence and inspiration program designed to keep Amazon Ads'' social work modern, credible, and performance-driven',
  featured_meme_url text,
  is_current boolean default false,
  created_at timestamptz default now()
);

-- CATEGORIES: the 4 content sections
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  sort_order int not null
);

-- POSTS: content entries per category per edition
create table posts (
  id uuid default gen_random_uuid() primary key,
  edition_id uuid references editions(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  headline text not null,
  created_at timestamptz default now()
);

-- POST_INSIGHTS: orange bullet-point insights
create table post_insights (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  label text not null,
  description text not null,
  sort_order int default 0
);

-- MEDIA_ITEMS: images/videos in the grid
create table media_items (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  type text not null default 'image' check (type in ('image', 'video')),
  url text not null,
  thumbnail_url text,
  caption text,
  external_link text,
  sort_order int default 0,
  size text default 'medium' check (size in ('small', 'medium', 'large'))
);

-- ARTICLES: extended article entries for the Articles category
create table articles (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  title text not null,
  url text not null,
  summary text not null,
  image_url text,
  sort_order int default 0
);

-- ROW LEVEL SECURITY
alter table editions enable row level security;
alter table categories enable row level security;
alter table posts enable row level security;
alter table post_insights enable row level security;
alter table media_items enable row level security;
alter table articles enable row level security;

-- Public read access
create policy "Public read editions" on editions for select using (true);
create policy "Public read categories" on categories for select using (true);
create policy "Public read posts" on posts for select using (true);
create policy "Public read post_insights" on post_insights for select using (true);
create policy "Public read media_items" on media_items for select using (true);
create policy "Public read articles" on articles for select using (true);

-- Authenticated write access
create policy "Admin insert editions" on editions for insert with check (auth.role() = 'authenticated');
create policy "Admin update editions" on editions for update using (auth.role() = 'authenticated');
create policy "Admin delete editions" on editions for delete using (auth.role() = 'authenticated');

create policy "Admin insert categories" on categories for insert with check (auth.role() = 'authenticated');
create policy "Admin update categories" on categories for update using (auth.role() = 'authenticated');

create policy "Admin insert posts" on posts for insert with check (auth.role() = 'authenticated');
create policy "Admin update posts" on posts for update using (auth.role() = 'authenticated');
create policy "Admin delete posts" on posts for delete using (auth.role() = 'authenticated');

create policy "Admin insert post_insights" on post_insights for insert with check (auth.role() = 'authenticated');
create policy "Admin update post_insights" on post_insights for update using (auth.role() = 'authenticated');
create policy "Admin delete post_insights" on post_insights for delete using (auth.role() = 'authenticated');

create policy "Admin insert media_items" on media_items for insert with check (auth.role() = 'authenticated');
create policy "Admin update media_items" on media_items for update using (auth.role() = 'authenticated');
create policy "Admin delete media_items" on media_items for delete using (auth.role() = 'authenticated');

create policy "Admin insert articles" on articles for insert with check (auth.role() = 'authenticated');
create policy "Admin update articles" on articles for update using (auth.role() = 'authenticated');
create policy "Admin delete articles" on articles for delete using (auth.role() = 'authenticated');

-- SEED CATEGORIES
insert into categories (name, slug, description, sort_order) values
  ('Memes', 'memes', 'Current memes, and random silly social things to understand our audiences'' worlds and the current cultural mood.', 1),
  ('Design', 'design', 'Thought starters for design templates and use of motion outside of Amazon.', 2),
  ('Video', 'video', 'Social trends, and other things happening on video that are relevant to the people we speak to and their wider world.', 3),
  ('Articles', 'articles', 'Relevant platforms news and updates that our teams should know about.', 4);

-- STORAGE: create a public bucket for media
-- (Do this manually in Supabase Dashboard → Storage → New Bucket → "media" → public)
