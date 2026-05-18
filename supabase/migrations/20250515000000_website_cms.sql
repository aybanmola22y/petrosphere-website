-- Website CMS tables (public schema).
-- TMS courses/schedules remain in the `tms` schema (managed by TMS; read via anon + accept-profile).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- video_testimonials
-- ---------------------------------------------------------------------------
create table if not exists public.video_testimonials (
  id text primary key,
  student_name text not null,
  credential text not null default '',
  summary text not null default '',
  youtube_video_id text not null,
  poster_src text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists video_testimonials_sort_order_idx on public.video_testimonials (sort_order);

-- ---------------------------------------------------------------------------
-- site_stats (homepage counters)
-- ---------------------------------------------------------------------------
create table if not exists public.site_stats (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists site_stats_sort_order_idx on public.site_stats (sort_order);

-- ---------------------------------------------------------------------------
-- news_authored (admin-created articles)
-- ---------------------------------------------------------------------------
create table if not exists public.news_authored (
  id text primary key,
  slug text not null unique,
  category text not null check (
    category in ('CSR', 'HSE NEWS', 'NEWS', 'PARTNERSHIP', 'TRAINING')
  ),
  title text not null,
  published_at date not null,
  summary text not null default '',
  image_src text not null default '',
  body jsonb not null default '[]'::jsonb,
  external boolean not null default false,
  external_href text,
  cta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_authored_published_at_idx on public.news_authored (published_at desc);

-- ---------------------------------------------------------------------------
-- news_fetched_overrides (edits/hides for Petrosphere-synced articles)
-- ---------------------------------------------------------------------------
create table if not exists public.news_fetched_overrides (
  slug text primary key,
  category text,
  title text,
  published_at date,
  summary text,
  image_src text,
  body jsonb,
  hidden boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists video_testimonials_set_updated_at on public.video_testimonials;
create trigger video_testimonials_set_updated_at
  before update on public.video_testimonials
  for each row execute function public.set_updated_at();

drop trigger if exists site_stats_set_updated_at on public.site_stats;
create trigger site_stats_set_updated_at
  before update on public.site_stats
  for each row execute function public.set_updated_at();

drop trigger if exists news_authored_set_updated_at on public.news_authored;
create trigger news_authored_set_updated_at
  before update on public.news_authored
  for each row execute function public.set_updated_at();

drop trigger if exists news_fetched_overrides_set_updated_at on public.news_fetched_overrides;
create trigger news_fetched_overrides_set_updated_at
  before update on public.news_fetched_overrides
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — public read; writes via service role (admin API)
-- ---------------------------------------------------------------------------
alter table public.video_testimonials enable row level security;
alter table public.site_stats enable row level security;
alter table public.news_authored enable row level security;
alter table public.news_fetched_overrides enable row level security;

create policy "anon_select_video_testimonials"
  on public.video_testimonials for select to anon, authenticated using (true);

create policy "anon_select_site_stats"
  on public.site_stats for select to anon, authenticated using (true);

create policy "anon_select_news_authored"
  on public.news_authored for select to anon, authenticated using (true);

create policy "anon_select_news_fetched_overrides"
  on public.news_fetched_overrides for select to anon, authenticated using (true);
