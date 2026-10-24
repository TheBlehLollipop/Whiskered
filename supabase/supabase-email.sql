-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It adds an optional contact email to accounts.
-- Users can read and change their own; the admin can read them (to answer support messages).
-- (Run supabase.sql and supabase-admin.sql first.)

alter table public.profiles
  add column email text
  check (email is null or (char_length(email) <= 120 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'));

grant update (email) on public.profiles to authenticated;

create policy "Admin can read profiles" on public.profiles
  for select using (public.is_admin());
