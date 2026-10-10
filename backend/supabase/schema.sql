-- Run this in Supabase: SQL Editor > New query > Run. Safe to run again.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text default '' check (char_length(display_name) <= 60),
  comfort text default 'steady' check (comfort in ('gentle','steady','bold')),
  about text default '' check (char_length(about) <= 500),
  updated_at timestamptz default now()
);

create table if not exists public.missions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  task text check (char_length(task) <= 100),
  fear text check (char_length(fear) <= 1000),
  happened text check (char_length(happened) <= 2000),
  learned text check (char_length(learned) <= 1000),
  b1 int check (b1 between 1 and 10),
  b2 int check (b2 between 1 and 10),
  minutes int check (minutes between 0 and 1440),
  created_at timestamptz default now()
);
alter table public.missions add column if not exists minutes int;
alter table public.missions add column if not exists feeling text check (char_length(feeling) <= 80);
alter table public.missions add column if not exists place text check (char_length(place) <= 120);
alter table public.missions add column if not exists moment boolean not null default false;
alter table public.missions add column if not exists saw text check (char_length(saw) <= 300);
alter table public.missions add column if not exists enjoyed text check (char_length(enjoyed) <= 300);
alter table public.missions add column if not exists noticed text check (char_length(noticed) <= 300);
-- Notes (fear/happened/learned) are only filled in when the person chooses "Save this moment".

-- Row Level Security: a signed-in user can only ever touch their own rows
alter table public.profiles enable row level security;
alter table public.missions enable row level security;

drop policy if exists "own profile read" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
drop policy if exists "own profile delete" on public.profiles;
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "own profile delete" on public.profiles for delete using (auth.uid() = id);

drop policy if exists "own missions read" on public.missions;
drop policy if exists "own missions insert" on public.missions;
drop policy if exists "own missions delete" on public.missions;
create policy "own missions read"   on public.missions for select using (auth.uid() = user_id);
create policy "own missions insert" on public.missions for insert with check (auth.uid() = user_id);
create policy "own missions delete" on public.missions for delete using (auth.uid() = user_id);

-- Least privilege: logged-out visitors get no access to these tables at all
revoke all on public.profiles, public.missions from anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, delete on public.missions to authenticated;

-- Auto-create a profile on signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'display_name',''), 60));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
