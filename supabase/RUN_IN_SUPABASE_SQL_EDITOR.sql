-- =============================================================================
-- PETROSPHERE WEBSITE CMS — paste into YOUR Supabase project → SQL Editor → Run
-- (Not the TMS project — your own website/CMS project.)
-- =============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.site_stats (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists site_stats_sort_order_idx on public.site_stats (sort_order);

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

create table if not exists public.news_fetched_overrides (
  slug text primary key,
  category text,
  title text,
  published_at date,
  summary text,
  image_src text,
  body jsonb,
  external boolean,
  external_href text,
  cta jsonb,
  updated_at timestamptz not null default now()
);

alter table public.news_fetched_overrides add column if not exists external boolean;
alter table public.news_fetched_overrides add column if not exists external_href text;
alter table public.news_fetched_overrides add column if not exists cta jsonb;

create table if not exists public.news_fetched_hidden (
  slug text primary key,
  hidden_at timestamptz not null default now()
);

create table if not exists public.video_testimonials (
  id text primary key,
  student_name text not null,
  credential text not null default '',
  summary text not null default '',
  youtube_video_id text not null default '',
  video_src text,
  poster_src text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists video_testimonials_sort_order_idx on public.video_testimonials (sort_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
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

alter table public.site_stats enable row level security;
alter table public.news_authored enable row level security;
alter table public.news_fetched_overrides enable row level security;
alter table public.news_fetched_hidden enable row level security;
alter table public.video_testimonials enable row level security;

drop policy if exists "anon_select_site_stats" on public.site_stats;
drop policy if exists "anon_select_news_authored" on public.news_authored;
drop policy if exists "anon_select_news_fetched_overrides" on public.news_fetched_overrides;
drop policy if exists "anon_select_news_fetched_hidden" on public.news_fetched_hidden;
drop policy if exists "anon_select_video_testimonials" on public.video_testimonials;

create policy "anon_select_site_stats"
  on public.site_stats for select to anon, authenticated using (true);
create policy "anon_select_news_authored"
  on public.news_authored for select to anon, authenticated using (true);
create policy "anon_select_news_fetched_overrides"
  on public.news_fetched_overrides for select to anon, authenticated using (true);
create policy "anon_select_news_fetched_hidden"
  on public.news_fetched_hidden for select to anon, authenticated using (true);
create policy "anon_select_video_testimonials"
  on public.video_testimonials for select to anon, authenticated using (true);

insert into public.site_stats (id, value, label, sort_order)
values
  ('00000000-0000-4000-8000-000000000001', '12,000+', 'Graduates and Trainees', 0),
  ('00000000-0000-4000-8000-000000000002', '99.5%', 'Satisfaction Rate', 1),
  ('00000000-0000-4000-8000-000000000003', '6,000', 'Course Delivered', 2),
  ('00000000-0000-4000-8000-000000000004', '8,500', 'Companies Supported', 3)
on conflict (id) do update set
  value = excluded.value,
  label = excluded.label,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Admin dashboard allowlist (see supabase/migrations/20250521000000_admin_users.sql)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
create index if not exists admin_users_email_idx on public.admin_users (lower(email));
alter table public.admin_users enable row level security;
drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
  on public.admin_users for select to authenticated using (auth.uid() = user_id);

-- After creating a user in Authentication → Users, grant admin access:
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where email = 'you@petrosphere.com.ph';
