-- Add author and source to articles for link scraping
alter table articles
  add column if not exists author text,
  add column if not exists source text;
