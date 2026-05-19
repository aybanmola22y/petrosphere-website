-- Admin allowlist: only users listed here may access /admin (after Supabase Auth sign-in).

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_users_email_idx on public.admin_users (lower(email));

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = user_id);

comment on table public.admin_users is
  'Allowlist for CMS admin dashboard. Add rows after creating users in Supabase Auth.';
