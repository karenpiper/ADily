-- Reorganize around editions: each edition has 3 themes; themes have support points / proof / posts / content.
-- Support points = post_insights, proof = media_items, posts/content = headline + articles (unchanged).

-- THEMES: 3 per edition
create table themes (
  id uuid default gen_random_uuid() primary key,
  edition_id uuid references editions(id) on delete cascade not null,
  name text not null,
  slug text not null,
  description text,
  sort_order int not null default 0,
  unique(edition_id, slug)
);

-- Posts belong to a theme (keep category_id for now so admin can keep working)
alter table posts add column theme_id uuid references themes(id) on delete cascade;

-- RLS
alter table themes enable row level security;
create policy "Public read themes" on themes for select using (true);
create policy "Admin insert themes" on themes for insert with check (auth.role() = 'authenticated');
create policy "Admin update themes" on themes for update using (auth.role() = 'authenticated');
create policy "Admin delete themes" on themes for delete using (auth.role() = 'authenticated');

-- Create 3 themes per existing edition
insert into themes (edition_id, name, slug, sort_order)
select e.id, v.name, v.slug, v.sort_order
from editions e
cross join (
  values
    ('Audience & Culture', 'audience', 1),
    ('Creative & Design', 'creative', 2),
    ('Platforms & News', 'platforms', 3)
) as v(name, slug, sort_order);

-- Backfill theme_id: map category sort_order to theme (1→1, 2→2, 3→3, 4→1)
update posts p
set theme_id = (
  select th.id
  from themes th
  join categories c on c.id = p.category_id
  where th.edition_id = p.edition_id
    and th.sort_order = case
      when c.sort_order = 4 then 1
      else c.sort_order
    end
  limit 1
);

-- Make theme_id required for new structure (nullable for any posts that didn't match)
-- alter table posts alter column theme_id set not null;
