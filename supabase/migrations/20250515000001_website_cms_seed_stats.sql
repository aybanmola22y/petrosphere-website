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
