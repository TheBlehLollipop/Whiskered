-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It lets admins ban and unban accounts.
--   * A banned account can't log in, is signed out everywhere, and can't send support
--     messages or change its profile even if it still holds an old login for a while.
--   * Admins can ban normal accounts. Only the owner can ban another admin.
--     Nobody can ban the owner or themselves.
-- (Run supabase.sql, supabase-admin.sql, supabase-admins.sql and supabase-support-accounts.sql first.
--  Safe to run more than once.)

-- Who is banned, and why. Only admins can read it; nothing can write it except the functions below.
create table if not exists public.bans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  reason text,
  banned_by text not null,
  banned_at timestamptz not null default now()
);
alter table public.bans enable row level security;
drop policy if exists "Admins read bans" on public.bans;
create policy "Admins read bans" on public.bans for select using (public.is_admin());

create or replace function public.is_banned() returns boolean
language sql security definer stable set search_path = public, auth as $$
  select exists (select 1 from auth.users u where u.id = auth.uid() and u.banned_until is not null and u.banned_until > now())
$$;
grant execute on function public.is_banned() to anon, authenticated;

-- Banned accounts can't edit their profile or send support messages.
drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles
  for update using (auth.uid() = id and not public.is_banned())
  with check (auth.uid() = id and not public.is_banned());

drop policy if exists "Signed-in users can send a request" on public.support_requests;
create policy "Signed-in users can send a request" on public.support_requests
  for insert to authenticated
  with check (
    status = 'open'
    and not public.is_banned()
    and username = (select p.username from public.profiles p where p.id = auth.uid())
  );

-- Search accounts (admins only). An empty search lists the newest ones.
create or replace function public.list_users(q text default '')
returns table (name text, display text, created_at timestamptz, is_owner boolean, is_admin boolean, banned boolean, reason text)
language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  return query
    select p.username, p.display, p.created_at,
           lower(p.username) = 'theblehlollipop',
           exists (select 1 from public.admins a where a.user_id = p.id),
           exists (select 1 from auth.users u where u.id = p.id and u.banned_until is not null and u.banned_until > now()),
           (select b.reason from public.bans b where b.user_id = p.id)
    from public.profiles p
    where coalesce(trim(q), '') = '' or p.username ilike replace(replace(trim(q), '%', ''), '_', '\_') || '%'
    order by p.created_at desc
    limit 30;
end $$;

create or replace function public.list_bans()
returns table (name text, reason text, banned_by text, banned_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  return query select b.username, b.reason, b.banned_by, b.banned_at from public.bans b order by b.banned_at desc;
end $$;

create or replace function public.ban_user(target text, why text default null) returns jsonb
language plpgsql security definer set search_path = public, auth as $$
declare me public.profiles; t public.profiles; target_is_admin boolean;
begin
  if not public.is_admin() then return jsonb_build_object('ok', false, 'message', 'Admins only.'); end if;
  select * into me from public.profiles where id = auth.uid();
  select * into t from public.profiles where lower(username) = lower(trim(target));
  if not found then return jsonb_build_object('ok', false, 'message', 'No account with that username.'); end if;
  if t.id = auth.uid() then return jsonb_build_object('ok', false, 'message', 'You can''t ban yourself.'); end if;
  if lower(t.username) = 'theblehlollipop' then return jsonb_build_object('ok', false, 'message', 'The owner can''t be banned.'); end if;
  select exists (select 1 from public.admins a where a.user_id = t.id) into target_is_admin;
  if target_is_admin and not public.is_owner() then
    return jsonb_build_object('ok', false, 'message', 'Only the owner can ban another admin.');
  end if;
  update auth.users set banned_until = now() + interval '100 years' where id = t.id;
  delete from auth.sessions where user_id = t.id;      -- signs them out everywhere
  delete from public.admins where user_id = t.id;      -- a banned admin loses admin rights
  insert into public.bans (user_id, username, reason, banned_by)
    values (t.id, t.username, nullif(left(trim(coalesce(why, '')), 300), ''), me.username)
    on conflict (user_id) do update set reason = excluded.reason, banned_by = excluded.banned_by, banned_at = now();
  return jsonb_build_object('ok', true, 'message', '@' || t.username || ' is banned.');
end $$;

create or replace function public.unban_user(target text) returns jsonb
language plpgsql security definer set search_path = public, auth as $$
declare t public.profiles;
begin
  if not public.is_admin() then return jsonb_build_object('ok', false, 'message', 'Admins only.'); end if;
  select * into t from public.profiles where lower(username) = lower(trim(target));
  if not found then return jsonb_build_object('ok', false, 'message', 'No account with that username.'); end if;
  update auth.users set banned_until = null where id = t.id;
  delete from public.bans where user_id = t.id;
  return jsonb_build_object('ok', true, 'message', '@' || t.username || ' can log in again.');
end $$;

revoke all on function public.list_users(text) from public, anon;
revoke all on function public.list_bans() from public, anon;
revoke all on function public.ban_user(text, text) from public, anon;
revoke all on function public.unban_user(text) from public, anon;
grant execute on function public.list_users(text) to authenticated;
grant execute on function public.list_bans() to authenticated;
grant execute on function public.ban_user(text, text) to authenticated;
grant execute on function public.unban_user(text) to authenticated;
