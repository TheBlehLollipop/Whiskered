-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It creates the profiles table that Whiskered accounts use.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  display text not null check (char_length(display) between 1 and 24),
  prefs jsonb not null default '{}'::jsonb,
  sync boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index profiles_username_key on public.profiles (lower(username));

alter table public.profiles enable row level security;

create policy "Read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Create a profile automatically when someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  uname text := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));
begin
  insert into public.profiles (id, username, display) values (new.id, uname, uname);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up form check a username before creating the account.
create function public.username_available(name text) returns boolean
language sql security definer set search_path = public stable as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(name))
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- Lets a signed-in user delete their own account.
create function public.delete_own_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  delete from auth.users where id = auth.uid();
end $$;
revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
