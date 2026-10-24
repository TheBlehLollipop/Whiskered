-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It lets the account "theblehlollipop" add and delete whole sites.
-- (Run supabase.sql and supabase-admin.sql first.)

create table public.custom_sites (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  label text not null check (char_length(label) between 1 and 40),
  tagline text not null default '' check (char_length(tagline) <= 120),
  description text not null default '' check (char_length(description) <= 600),
  created_at timestamptz not null default now()
);

alter table public.custom_sites enable row level security;

create policy "Anyone can read sites" on public.custom_sites
  for select using (true);
create policy "Admin can add sites" on public.custom_sites
  for insert with check (public.is_admin());
create policy "Admin can delete sites" on public.custom_sites
  for delete using (public.is_admin());
