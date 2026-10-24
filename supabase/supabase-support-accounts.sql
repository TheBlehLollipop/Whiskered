-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Support messages now need a signed-in account, and the username is always filled in
-- from that account (nobody can send a message as someone else).
-- (Run supabase-support.sql first.)

-- Old anonymous messages keep working in the inbox; they just show as "unknown".
update public.support_requests set username = 'unknown' where username is null;
alter table public.support_requests alter column username set not null;

drop policy if exists "Anyone can send a request" on public.support_requests;
create policy "Signed-in users can send a request" on public.support_requests
  for insert to authenticated
  with check (
    status = 'open'
    and username = (select p.username from public.profiles p where p.id = auth.uid())
  );
