-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It lets the account "theblehlollipop" add, edit, reorder and delete changelog entries.
-- (Run supabase.sql and supabase-admin.sql first.)

create table public.changelog_entries (
  id bigint generated always as identity primary key,
  position integer not null default 0,
  badge text not null check (char_length(badge) between 1 and 30),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.changelog_entries enable row level security;

create policy "Anyone can read changelog" on public.changelog_entries
  for select using (true);
create policy "Admin can add changelog" on public.changelog_entries
  for insert with check (public.is_admin());
create policy "Admin can change changelog" on public.changelog_entries
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete changelog" on public.changelog_entries
  for delete using (public.is_admin());
