-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It adds email verification and "forgot password" by email code.
-- (Run supabase.sql, supabase-admin.sql and supabase-email.sql first. Safe to run more than once.)
--
-- Emails are sent through Brevo (https://www.brevo.com, free). After running this, store your
-- Brevo key once (see the note at the bottom). Until then the site says email isn't set up yet.

create extension if not exists pg_net with schema extensions;

-- 1. An email only counts for password resets once its owner has typed back a code sent to it.
alter table public.profiles add column if not exists email_verified boolean not null default false;

create or replace function public.profiles_email_changed() returns trigger
language plpgsql as $$
begin
  if new.email is distinct from old.email then new.email_verified := false; end if;
  return new;
end $$;
drop trigger if exists profiles_email_changed on public.profiles;
create trigger profiles_email_changed before update of email on public.profiles
  for each row execute function public.profiles_email_changed();

-- 2. Private tables. Row security is on and there are no policies, so the website can't read them at all.
create table if not exists public.app_secrets (
  name text primary key,
  value text not null
);
alter table public.app_secrets enable row level security;

create table if not exists public.email_codes (
  user_id uuid not null references auth.users (id) on delete cascade,
  purpose text not null check (purpose in ('verify', 'reset')),
  code_hash text not null,
  email text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  sent_at timestamptz not null default now(),
  window_start timestamptz not null default now(),
  sends integer not null default 1,
  primary key (user_id, purpose)
);
alter table public.email_codes enable row level security;

-- 3. Private helpers (not callable from the website).
create or replace function public._new_code() returns text
language plpgsql volatile set search_path = public, extensions as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  b bytea := gen_random_bytes(8);
  out text := '';
  i int;
begin
  for i in 0..7 loop
    out := out || substr(alphabet, (get_byte(b, i) % 32) + 1, 1);
  end loop;
  return out;
end $$;

create or replace function public._code_hash(uid uuid, purp text, code text) returns text
language sql immutable set search_path = public, extensions as $$
  select encode(digest(uid::text || ':' || purp || ':' || upper(regexp_replace(code, '[^A-Za-z0-9]', '', 'g')), 'sha256'), 'hex')
$$;

create or replace function public._mail_ready() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.app_secrets where name = 'brevo_api_key')
     and exists (select 1 from public.app_secrets where name = 'mail_from_email')
$$;

create or replace function public._send_mail(to_addr text, subj text, body text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare k text; f text; n text;
begin
  select value into k from public.app_secrets where name = 'brevo_api_key';
  select value into f from public.app_secrets where name = 'mail_from_email';
  select coalesce((select value from public.app_secrets where name = 'mail_from_name'), 'Whiskered') into n;
  if k is null or f is null then return false; end if;
  perform net.http_post(
    url := 'https://api.brevo.com/v3/smtp/email',
    headers := jsonb_build_object('api-key', k, 'content-type', 'application/json', 'accept', 'application/json'),
    body := jsonb_build_object(
      'sender', jsonb_build_object('name', n, 'email', f),
      'to', jsonb_build_array(jsonb_build_object('email', to_addr)),
      'subject', subj,
      'textContent', body
    )
  );
  return true;
end $$;

-- Makes a code, remembers only its hash, and emails it. At most one a minute and five an hour per person.
create or replace function public._issue_code(uid uuid, purp text, addr text, subj text, intro text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare rec public.email_codes; code text;
begin
  if not public._mail_ready() then return 'unconfigured'; end if;
  select * into rec from public.email_codes where user_id = uid and purpose = purp;
  if found then
    if rec.sent_at > now() - interval '60 seconds' then return 'wait'; end if;
    if rec.window_start > now() - interval '1 hour' and rec.sends >= 5 then return 'limit'; end if;
  end if;
  code := public._new_code();
  insert into public.email_codes (user_id, purpose, code_hash, email, expires_at)
  values (uid, purp, public._code_hash(uid, purp, code), addr, now() + interval '15 minutes')
  on conflict (user_id, purpose) do update set
    code_hash = excluded.code_hash,
    email = excluded.email,
    expires_at = excluded.expires_at,
    attempts = 0,
    sent_at = now(),
    window_start = case when public.email_codes.window_start > now() - interval '1 hour' then public.email_codes.window_start else now() end,
    sends = case when public.email_codes.window_start > now() - interval '1 hour' then public.email_codes.sends + 1 else 1 end;
  if not public._send_mail(addr, subj,
       intro || E'\n\nYour code: ' || substr(code, 1, 4) || '-' || substr(code, 5, 4)
       || E'\n\nIt works for 15 minutes. If you didn''t ask for this, you can ignore this email.') then
    return 'unconfigured';
  end if;
  return 'sent';
end $$;

-- 4. What the website calls.
create or replace function public.request_email_verification() returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); p public.profiles; st text;
begin
  if uid is null then return jsonb_build_object('ok', false, 'message', 'Log in first.'); end if;
  select * into p from public.profiles where id = uid;
  if p.email is null then return jsonb_build_object('ok', false, 'message', 'Save an email first.'); end if;
  if p.email_verified then return jsonb_build_object('ok', true, 'message', 'That email is already verified.'); end if;
  st := public._issue_code(uid, 'verify', p.email, 'Verify your Whiskered email',
          'Confirm this email address for the Whiskered account @' || p.username || '.');
  return case st
    when 'sent' then jsonb_build_object('ok', true, 'message', 'Code sent. Check your inbox and spam folder.')
    when 'wait' then jsonb_build_object('ok', false, 'message', 'Wait a minute before asking for another code.')
    when 'limit' then jsonb_build_object('ok', false, 'message', 'Too many codes. Try again in an hour.')
    else jsonb_build_object('ok', false, 'message', 'Email sending isn''t set up yet.')
  end;
end $$;

create or replace function public.confirm_email(code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); rec public.email_codes; cur text;
begin
  if uid is null then return jsonb_build_object('ok', false, 'message', 'Log in first.'); end if;
  select * into rec from public.email_codes where user_id = uid and purpose = 'verify';
  if not found or rec.expires_at < now() then
    return jsonb_build_object('ok', false, 'message', 'That code has expired. Ask for a new one.');
  end if;
  select email into cur from public.profiles where id = uid;
  if cur is distinct from rec.email or rec.attempts >= 5 then
    delete from public.email_codes where user_id = uid and purpose = 'verify';
    return jsonb_build_object('ok', false, 'message', 'That code can''t be used any more. Ask for a new one.');
  end if;
  if rec.code_hash <> public._code_hash(uid, 'verify', code) then
    update public.email_codes set attempts = attempts + 1 where user_id = uid and purpose = 'verify';
    return jsonb_build_object('ok', false, 'message', 'That code isn''t right.');
  end if;
  update public.profiles set email_verified = true where id = uid;
  delete from public.email_codes where user_id = uid and purpose = 'verify';
  return jsonb_build_object('ok', true, 'message', 'Email verified. You can now reset your password by email.');
end $$;

-- Always answers the same way, so nobody can use it to find out which usernames exist.
create or replace function public.request_password_reset(uname text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  if not public._mail_ready() then
    return jsonb_build_object('ok', false, 'message', 'Password reset by email isn''t set up yet.');
  end if;
  select * into p from public.profiles where lower(username) = lower(trim(uname));
  if found and p.email is not null and p.email_verified then
    perform public._issue_code(p.id, 'reset', p.email, 'Reset your Whiskered password',
      'Someone asked to reset the password for the Whiskered account @' || p.username || '.');
  end if;
  return jsonb_build_object('ok', true, 'message', 'If that account has a verified email, a code is on its way. Check your inbox and spam folder.');
end $$;

create or replace function public.complete_password_reset(uname text, code text, new_password text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid; rec public.email_codes; p public.profiles;
  bad constant jsonb := jsonb_build_object('ok', false, 'message', 'That code isn''t right or has expired.');
begin
  if new_password is null or length(new_password) < 6 or length(new_password) > 72 then
    return jsonb_build_object('ok', false, 'message', 'The password must be 6 to 72 characters.');
  end if;
  select * into p from public.profiles where lower(username) = lower(trim(uname));
  if not found then return bad; end if;
  uid := p.id;
  select * into rec from public.email_codes where user_id = uid and purpose = 'reset';
  if not found or rec.expires_at < now() then return bad; end if;
  if p.email is distinct from rec.email or not p.email_verified or rec.attempts >= 5 then
    delete from public.email_codes where user_id = uid and purpose = 'reset';
    return bad;
  end if;
  if rec.code_hash <> public._code_hash(uid, 'reset', code) then
    update public.email_codes set attempts = attempts + 1 where user_id = uid and purpose = 'reset';
    return bad;
  end if;
  update auth.users set encrypted_password = crypt(new_password, gen_salt('bf', 10)), updated_at = now() where id = uid;
  delete from auth.sessions where user_id = uid;   -- signs the account out everywhere
  delete from public.email_codes where user_id = uid and purpose = 'reset';
  return jsonb_build_object('ok', true, 'message', 'Password changed. You can log in now.');
end $$;

-- 5. Who may call what.
revoke all on function public._new_code() from public, anon, authenticated;
revoke all on function public._code_hash(uuid, text, text) from public, anon, authenticated;
revoke all on function public._mail_ready() from public, anon, authenticated;
revoke all on function public._send_mail(text, text, text) from public, anon, authenticated;
revoke all on function public._issue_code(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.request_email_verification() from public, anon;
revoke all on function public.confirm_email(text) from public, anon;
grant execute on function public.request_email_verification() to authenticated;
grant execute on function public.confirm_email(text) to authenticated;
grant execute on function public.request_password_reset(text) to anon, authenticated;
grant execute on function public.complete_password_reset(text, text, text) to anon, authenticated;

-- To switch email sending on, store these once (replace the values), in the SQL Editor:
--   insert into public.app_secrets (name, value) values
--     ('brevo_api_key', 'YOUR-BREVO-API-KEY'),
--     ('mail_from_email', 'the-address-you-verified-in-brevo@example.com'),
--     ('mail_from_name', 'Whiskered')
--   on conflict (name) do update set value = excluded.value;
