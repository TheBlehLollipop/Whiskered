-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It lets the account "theblehlollipop" add and remove links for everyone.
-- (Run supabase.sql first if you haven't.)

-- 1. Lock the username so nobody can rename themselves into the admin name.
revoke update on public.profiles from authenticated, anon;
grant update (display, prefs, sync) on public.profiles to authenticated;

-- 2. Who is the admin?
create function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and lower(username) = 'theblehlollipop'
  )
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- 3. Link changes. op = 'add' puts a new link on a site/genre,
--    op = 'remove' hides a link that is hard-coded in index.html.
create table public.link_edits (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('site', 'game')),
  target text not null check (char_length(target) between 1 and 60),
  op text not null check (op in ('add', 'remove')),
  label text check (label is null or char_length(label) <= 80),
  url text not null check (url ~* '^https?://' and char_length(url) <= 2000),
  img text check (img is null or (img ~* '^https?://' and char_length(img) <= 2000)),
  created_at timestamptz not null default now()
);
create unique index link_edits_unique on public.link_edits (kind, target, op, url);

alter table public.link_edits enable row level security;

create policy "Anyone can read link edits" on public.link_edits
  for select using (true);
create policy "Admin can add link edits" on public.link_edits
  for insert with check (public.is_admin());
create policy "Admin can delete link edits" on public.link_edits
  for delete using (public.is_admin());
