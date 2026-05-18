-- Adds hidden-slug table (admin delete of fetched posts). Safe to run if 20250515000000 already applied.

create table if not exists public.news_fetched_hidden (
  slug text primary key,
  hidden_at timestamptz not null default now()
);

comment on table public.news_fetched_hidden is 'Fetched slugs hidden from the public site (admin delete).';

alter table public.news_fetched_hidden enable row level security;

drop policy if exists "anon_select_news_fetched_hidden" on public.news_fetched_hidden;
create policy "anon_select_news_fetched_hidden"
  on public.news_fetched_hidden for select to anon, authenticated using (true);
