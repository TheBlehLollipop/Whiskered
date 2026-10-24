-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It lets the account "theblehlollipop" reorder sites, links and games for everyone.
-- (Run supabase.sql and supabase-admin.sql first.)

create table public.order_edits (
  scope text primary key check (char_length(scope) between 3 and 80),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  updated_at timestamptz not null default now()
);

alter table public.order_edits enable row level security;

create policy "Anyone can read order" on public.order_edits
  for select using (true);
create policy "Admin can add order" on public.order_edits
  for insert with check (public.is_admin());
create policy "Admin can change order" on public.order_edits
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete order" on public.order_edits
  for delete using (public.is_admin());
