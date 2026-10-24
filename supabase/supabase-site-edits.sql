-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It lets the account "theblehlollipop" edit the name, tagline and description of any site.
-- (Run supabase.sql and supabase-admin.sql first.)

create table public.site_overrides (
  slug text primary key check (slug ~ '^[a-z0-9-]{2,40}$'),
  label text not null check (char_length(label) between 1 and 40),
  tagline text not null default '' check (char_length(tagline) <= 120),
  description text not null default '' check (char_length(description) <= 600),
  updated_at timestamptz not null default now()
);

alter table public.site_overrides enable row level security;

create policy "Anyone can read site overrides" on public.site_overrides
  for select using (true);
create policy "Admin can add site overrides" on public.site_overrides
  for insert with check (public.is_admin());
create policy "Admin can change site overrides" on public.site_overrides
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete site overrides" on public.site_overrides
  for delete using (public.is_admin());
