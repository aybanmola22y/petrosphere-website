-- Petrosphere Website (Own Supabase) content tables
-- Run this in Supabase SQL Editor (your OWN project).
--
-- Tables created:
-- - public.news_fetched        (synced from petrosphere.com.ph, editable in admin)
-- - public.news_authored       (created in admin)
-- - public.video_testimonials  (created/edited in admin)
-- - public.site_content_overrides (site-wide settings: removed slugs + stats) [optional but recommended]

create extension if not exists pgcrypto;

-- =========================================================
-- 1) Fetched PR news (synced from Petrosphere)
-- =========================================================
create table if not exists public.news_fetched (
  id text primary key,                 -- e.g. "petrosphere-<slug>"
  slug text not null unique,
  source_url text,
  category text not null default '',
  title text not null,
  published_at date,
  summary text not null default '',
  image_src text not null default '',
  body jsonb not null default '[]'::jsonb,
  external boolean not null default false,
  fetched_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_fetched_published_at_idx
  on public.news_fetched (published_at desc nulls last);

-- =========================================================
-- 2) Authored PR news (created in Admin dashboard)
-- =========================================================
create table if not exists public.news_authored (
  id text primary key,                 -- e.g. "news-<timestamp>"
  slug text not null unique,
  category text not null,
  title text not null,
  published_at date not null,
  summary text not null,
  image_src text not null,
  body jsonb not null,                 -- ["p1","p2",...]
  external boolean not null default false,
  external_href text,
  cta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_authored_published_at_idx
  on public.news_authored (published_at desc);

-- =========================================================
-- 3) Video testimonials (created/edited in Admin dashboard)
-- =========================================================
create table if not exists public.video_testimonials (
  id text primary key,                 -- e.g. "sv1" or "sv-<timestamp>"
  student_name text not null,
  credential text not null default '',
  summary text not null default '',
  youtube_video_id text not null,
  poster_src text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 4) Optional: site-wide overrides/settings
--    (used by code for removed slugs + stats)
-- =========================================================
create table if not exists public.site_content_overrides (
  id int primary key,
  removed_news_slugs text[] not null default '{}'::text[],
  stats jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_content_overrides (id)
values (1)
on conflict (id) do nothing;

-- =========================================================
-- RLS (optional)
-- If you want the public website to read these tables using anon key,
-- keep the SELECT policies below.
-- Admin writes use SERVICE ROLE key (bypasses RLS).
-- =========================================================
alter table public.news_fetched enable row level security;
alter table public.news_authored enable row level security;
alter table public.video_testimonials enable row level security;
alter table public.site_content_overrides enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='news_fetched' and policyname='anon_read_news_fetched') then
    create policy anon_read_news_fetched on public.news_fetched
      for select to anon using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='news_authored' and policyname='anon_read_news_authored') then
    create policy anon_read_news_authored on public.news_authored
      for select to anon using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='video_testimonials' and policyname='anon_read_video_testimonials') then
    create policy anon_read_video_testimonials on public.video_testimonials
      for select to anon using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_content_overrides' and policyname='anon_read_site_content_overrides') then
    create policy anon_read_site_content_overrides on public.site_content_overrides
      for select to anon using (true);
  end if;
end $$;

