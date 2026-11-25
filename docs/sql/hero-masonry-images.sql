-- Homepage hero masonry ticker images (4 columns × N slots).
-- Run in Supabase SQL editor when using CMS storage mode.

create table if not exists public.hero_masonry_images (
  id uuid primary key default gen_random_uuid(),
  column_index int not null check (column_index >= 0 and column_index <= 5),
  sort_order int not null default 0,
  src text not null,
  tall boolean default false,
  alt text,
  updated_at timestamptz not null default now()
);

create index if not exists hero_masonry_images_col_sort_idx
  on public.hero_masonry_images (column_index, sort_order);

alter table public.hero_masonry_images enable row level security;
