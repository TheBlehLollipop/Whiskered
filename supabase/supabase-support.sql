-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It stores messages sent from the Support page.
-- Only signed-in users can send one (the username is taken from their account); only the account "theblehlollipop" can read, update or delete them.
-- (Run supabase.sql and supabase-admin.sql first.)

create table public.support_requests (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('broken', 'suggest', 'account', 'other')),
  message text not null check (char_length(message) between 5 and 1000),
  username text not null check (char_length(username) between 3 and 30),
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now()
);

alter table public.support_requests enable row level security;

create policy "Signed-in users can send a request" on public.support_requests
  for insert to authenticated
  with check (
    status = 'open'
    and username = (select p.username from public.profiles p where p.id = auth.uid())
  );
create policy "Admin can read requests" on public.support_requests
  for select using (public.is_admin());
create policy "Admin can update requests" on public.support_requests
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete requests" on public.support_requests
  for delete using (public.is_admin());
