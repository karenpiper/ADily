-- ALLOWED_USERS: who can access the admin dashboard (replaces hardcoded ALLOWED_ADMIN_EMAILS)
create table allowed_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  role text default 'admin' check (role in ('admin', 'editor', 'viewer')),
  added_by text,
  created_at timestamptz default now()
);

alter table allowed_users enable row level security;

-- Anyone can check if an email is allowed (needed during OAuth callback before session exists)
create policy "Users can check own email"
  on allowed_users for select
  using (true);

-- Only existing admins can insert/update/delete
create policy "Admins can manage users"
  on allowed_users for insert
  with check (
    auth.jwt() ->> 'email' in (select email from allowed_users where role = 'admin')
  );

create policy "Admins can update users"
  on allowed_users for update
  using (
    auth.jwt() ->> 'email' in (select email from allowed_users where role = 'admin')
  );

create policy "Admins can delete users"
  on allowed_users for delete
  using (
    auth.jwt() ->> 'email' in (select email from allowed_users where role = 'admin')
  );

-- Seed with current hardcoded admin emails (from lib/auth-config.ts)
insert into allowed_users (email, name, role) values
  ('millie.tunnell@codeandtheory.com', 'Millie Tunnell', 'admin'),
  ('benaelle.benoit@codeandtheory.com', 'Benaelle Benoit', 'admin'),
  ('karen.piper@codeandtheory.com', 'Karen Piper', 'admin'),
  ('julie.stfelix@codeandtheory.com', 'Julie St Felix', 'admin');
