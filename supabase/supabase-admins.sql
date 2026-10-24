-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It lets the owner ("theblehlollipop") promote other accounts to admin and remove them again.
-- Admins can edit links, sites, the changelog and read support messages.
-- Only the owner can promote or remove admins.
-- (Run supabase.sql and supabase-admin.sql first. Safe to run more than once.)

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now()
);
-- No policies on purpose: nobody can touch this table directly, only the functions below.
alter table public.admins enable row level security;

create or replace function public.is_owner() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and lower(username) = 'theblehlollipop'
  )
$$;

-- The existing policies call is_admin(), so every admin feature picks this up automatically.
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select public.is_owner()
      or exists (select 1 from public.admins where user_id = auth.uid())
$$;

create or replace function public.list_admins() returns table (name text, owner boolean)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'Only the owner can do that.'; end if;
  return query
    select p.username, lower(p.username) = 'theblehlollipop'
    from public.profiles p
    where lower(p.username) = 'theblehlollipop'
       or p.id in (select a.user_id from public.admins a)
    order by 2 desc, 1;
end $$;

create or replace function public.promote_admin(target text) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public.is_owner() then raise exception 'Only the owner can do that.'; end if;
  select id into uid from public.profiles where lower(username) = lower(target);
  if uid is null then raise exception 'No account with that username.'; end if;
  insert into public.admins (user_id) values (uid) on conflict do nothing;
end $$;

create or replace function public.demote_admin(target text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'Only the owner can do that.'; end if;
  if lower(target) = 'theblehlollipop' then raise exception 'The owner cannot be removed.'; end if;
  delete from public.admins where user_id = (select id from public.profiles where lower(username) = lower(target));
end $$;

grant execute on function public.is_owner() to anon, authenticated;
revoke execute on function public.list_admins() from public, anon;
revoke execute on function public.promote_admin(text) from public, anon;
revoke execute on function public.demote_admin(text) from public, anon;
grant execute on function public.list_admins() to authenticated;
grant execute on function public.promote_admin(text) to authenticated;
grant execute on function public.demote_admin(text) to authenticated;
