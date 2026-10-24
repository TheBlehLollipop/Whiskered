-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It lets admins reply to support messages, and lets people read their own messages and the replies.
-- (Run supabase.sql, supabase-admin.sql and supabase-support.sql first. Safe to run more than once.)

create table if not exists public.support_replies (
  id bigint generated always as identity primary key,
  request_id bigint not null references public.support_requests (id) on delete cascade,
  author text not null check (char_length(author) between 3 and 30),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists support_replies_request_idx on public.support_replies (request_id);

alter table public.support_replies enable row level security;

-- People can read their own messages (admins could already read everything).
drop policy if exists "Users read own requests" on public.support_requests;
create policy "Users read own requests" on public.support_requests
  for select to authenticated
  using (username = (select p.username from public.profiles p where p.id = auth.uid()));

drop policy if exists "Admin reads replies" on public.support_replies;
create policy "Admin reads replies" on public.support_replies
  for select using (public.is_admin());

drop policy if exists "Users read replies to their messages" on public.support_replies;
create policy "Users read replies to their messages" on public.support_replies
  for select to authenticated
  using (exists (
    select 1 from public.support_requests r
    where r.id = request_id
      and r.username = (select p.username from public.profiles p where p.id = auth.uid())
  ));

-- Only admins reply, and the author is always their own username.
drop policy if exists "Admin sends replies" on public.support_replies;
create policy "Admin sends replies" on public.support_replies
  for insert to authenticated
  with check (
    public.is_admin()
    and author = (select p.username from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Admin deletes replies" on public.support_replies;
create policy "Admin deletes replies" on public.support_replies
  for delete using (public.is_admin());
