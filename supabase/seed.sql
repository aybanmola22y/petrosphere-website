-- Optional local seed data. Run with: npx supabase db reset
-- Production data is edited via /admin (file or Supabase storage).

insert into public.site_stats (value, label, sort_order)
values
  ('12,000+', 'Graduates and Trainees', 0),
  ('99.5%', 'Satisfaction Rate', 1),
  ('6,000', 'Course Delivered', 2),
  ('8,500', 'Companies Supported', 3);
