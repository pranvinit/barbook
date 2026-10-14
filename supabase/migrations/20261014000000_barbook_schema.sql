-- Barbook schema: profiles, songs, bars, revisions, likes, LLM call log.
-- Ownership is enforced with row-level security; API routes use the
-- caller's session, so auth.uid() is always the signed-in user.

create extension if not exists citext with schema extensions;
create extension if not exists vector with schema extensions;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  handle       extensions.citext unique check (handle ~* '^[a-z0-9_]{3,24}$'),
  display_name text check (char_length(display_name) <= 60),
  avatar_url   text,
  statement    text not null default '' check (char_length(statement) <= 1000),
  influences   text[] not null default '{}',
  styles       text[] not null default '{}',
  artist_read  jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.songs (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 120),
  mood       text,
  bpm        int check (bpm between 40 and 220),
  created_at timestamptz not null default now()
);

create table public.bars (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  song_id    uuid references public.songs (id) on delete set null,
  position   int,
  text       text not null check (char_length(text) between 1 and 500),
  scores     jsonb,                    -- {rhyme, flow, wordplay, punch, originality}
  overall    numeric(3, 1) check (overall between 0 and 10),
  feedback   text,
  rhyme_map  jsonb,                    -- [{group: "A", spans: [[start, end], ...]}]
  embedding  extensions.vector(768),
  is_public  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bar_revisions (
  id         bigint generated always as identity primary key,
  bar_id     uuid not null references public.bars (id) on delete cascade,
  text       text not null,
  overall    numeric(3, 1),
  created_at timestamptz not null default now()
);

create table public.likes (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  bar_id     uuid not null references public.bars (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, bar_id)
);

create table public.llm_calls (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  kind          text not null,
  model         text not null,
  input_tokens  int,
  output_tokens int,
  latency_ms    int,
  created_at    timestamptz not null default now()
);

create index bars_owner_created_idx on public.bars (owner_id, created_at desc);
create index bars_owner_overall_idx on public.bars (owner_id, overall desc nulls last);
create index bars_public_created_idx on public.bars (created_at desc) where is_public;
create index songs_owner_idx on public.songs (owner_id, created_at desc);
create index bar_revisions_bar_idx on public.bar_revisions (bar_id, created_at desc);
create index llm_calls_user_kind_idx on public.llm_calls (user_id, kind, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger bars_set_updated_at before update on public.bars
  for each row execute function public.set_updated_at();

-- Create a profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.songs enable row level security;
alter table public.bars enable row level security;
alter table public.bar_revisions enable row level security;
alter table public.likes enable row level security;
alter table public.llm_calls enable row level security;

create policy "Profiles are readable by everyone" on public.profiles
  for select using (true);
create policy "Users update their own profile" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Owners manage their songs" on public.songs
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "Owners manage their bars" on public.bars
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Public bars are readable by everyone" on public.bars
  for select using (is_public);

create policy "Owners manage revisions of their bars" on public.bar_revisions
  for all using (
    exists (select 1 from public.bars b where b.id = bar_id and b.owner_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.bars b where b.id = bar_id and b.owner_id = (select auth.uid()))
  );

create policy "Likes are readable by everyone" on public.likes
  for select using (true);
create policy "Users like public bars as themselves" on public.likes
  for insert with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.bars b where b.id = bar_id and b.is_public)
  );
create policy "Users remove their own likes" on public.likes
  for delete using ((select auth.uid()) = user_id);

create policy "Users read their own LLM calls" on public.llm_calls
  for select using ((select auth.uid()) = user_id);
create policy "Users log their own LLM calls" on public.llm_calls
  for insert with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- RPCs (security invoker, so RLS still applies)
-- ---------------------------------------------------------------------------
create or replace function public.avg_score()
returns numeric
language sql
stable
set search_path = ''
as $$
  select coalesce(round(avg(overall), 1), 0)
  from public.bars
  where owner_id = (select auth.uid()) and overall is not null;
$$;

create or replace function public.has_llm_quota(p_kind text, p_limit int)
returns boolean
language sql
stable
set search_path = ''
as $$
  select count(*) < p_limit
  from public.llm_calls
  where user_id = (select auth.uid())
    and kind = p_kind
    and created_at > now() - interval '1 day';
$$;

-- ---------------------------------------------------------------------------
-- Storage: avatars/<user id>/<file>
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Users upload their own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users replace their own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete their own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
