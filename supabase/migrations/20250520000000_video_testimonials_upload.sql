-- Uploaded testimonial videos (MP4/WebM/MOV) in addition to YouTube embeds.
alter table public.video_testimonials add column if not exists video_src text;

comment on column public.video_testimonials.video_src is 'Optional /uploads/videos/... path when not using YouTube.';
