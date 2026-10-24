-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It lets the public Team page list the owner and admins (name and role only, never emails).
-- (Run supabase.sql, supabase-admin.sql and supabase-admins.sql first. Safe to run more than once.)

create or replace function public.team_members() returns table (name text, display text, owner boolean)
language sql security definer stable set search_path = public as $$
  select p.username, p.display, lower(p.username) = 'theblehlollipop'
  from public.profiles p
  where lower(p.username) = 'theblehlollipop'
     or p.id in (select a.user_id from public.admins a)
  order by 3 desc, 1
$$;
grant execute on function public.team_members() to anon, authenticated;
