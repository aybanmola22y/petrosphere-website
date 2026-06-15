# Hostinger media uploads (CSR images & testimonial videos)

Store **files on Hostinger**, keep **post text in Supabase** (small rows only — no Supabase Storage).

## Architecture

| What | Where |
|------|--------|
| Titles, summaries, body, dates | Supabase Postgres (`news_*`, `video_testimonials`) |
| Image/video **files** | Hostinger `public_html/uploads/news/` and `.../videos/` |
| Stored in Supabase | Public **URL** to the Hostinger file |

## Step 1 — Create folders on Hostinger

1. Log in to **hPanel → Files → File Manager**.
2. Open `public_html`.
3. Create:
   - `uploads/news/`
   - `uploads/videos/`
4. Set permissions to **755** (folders) so PHP can write inside them.

## Step 2 — Deploy the PHP uploader (recommended)

1. In File Manager, create folder `public_html/_cms/`.
2. Upload `hostinger/upload.php` from this repo to `public_html/_cms/upload.php`.
3. Edit the file on Hostinger and set a strong secret:

   ```php
   $UPLOAD_SECRET = 'your-long-random-secret-here';
   ```

4. Test in browser (should return JSON “Method not allowed” for GET — that is OK).

Public endpoint example:

`https://petrosphere.com.ph/_cms/upload.php`

## Step 3 — Environment variables

Add to **`.env.local`** (local) and **Vercel → Project → Settings → Environment Variables** (production):

```env
# http = POST to PHP on Hostinger (recommended)
# ftp = upload via FTP/SFTP (alternative)
# local = save under public/uploads/ (dev only)
HOSTINGER_MEDIA_MODE=http

# Public URL where /uploads/... is served (no trailing slash)
HOSTINGER_MEDIA_BASE_URL=https://petrosphere.com.ph

# Must match upload.php on Hostinger
HOSTINGER_UPLOAD_URL=https://petrosphere.com.ph/_cms/upload.php
HOSTINGER_UPLOAD_SECRET=your-long-random-secret-here
```

### Optional: FTP mode instead of PHP

```env
HOSTINGER_MEDIA_MODE=ftp
HOSTINGER_MEDIA_BASE_URL=https://petrosphere.com.ph
HOSTINGER_FTP_HOST=ftp.petrosphere.com.ph
HOSTINGER_FTP_USER=your-ftp-user
HOSTINGER_FTP_PASSWORD=your-ftp-password
HOSTINGER_FTP_REMOTE_DIR=/public_html/uploads
HOSTINGER_FTP_SECURE=true
```

FTP credentials: **hPanel → Files → FTP Accounts**.

## Step 4 — Allow Next.js to load Hostinger images

If your media domain is not already listed, add its hostname to `next.config.ts` under `images.remotePatterns` (e.g. `petrosphere.com.ph`).

Or set `HOSTINGER_MEDIA_BASE_URL` before build — the config reads that hostname automatically.

## Step 5 — Redeploy Vercel

After env vars are set, redeploy so `/api/admin/upload-image` and `/api/admin/upload-video` use Hostinger.

## Step 6 — Verify

1. Open **Admin → Posts**, upload a cover image.
2. Confirm the image URL starts with `https://petrosphere.com.ph/uploads/news/...` (or your base URL).
3. Open the URL in a new tab — the file should load from Hostinger.
4. Save the post — Supabase stores only that URL string.

Repeat for **Admin → Videos** → upload video → URL under `/uploads/videos/`.

## Local development

Keep `HOSTINGER_MEDIA_MODE=local` (or omit it) to write files to `public/uploads/` without calling Hostinger.

## Security notes

- Never commit `HOSTINGER_UPLOAD_SECRET` or FTP passwords to git.
- Rotate the PHP secret if it is ever exposed.
- The PHP script only accepts `news` or `videos` folders and validates MIME types.
- Admin uploads still require a logged-in admin session on the Next.js site.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 Unauthorized | `HOSTINGER_UPLOAD_SECRET` must match `$UPLOAD_SECRET` in `upload.php` |
| 500 Could not create directory | Create `uploads/news` and `uploads/videos` manually; check permissions |
| Image broken on site | Check `HOSTINGER_MEDIA_BASE_URL` and `images.remotePatterns` |
| Upload works locally but not on Vercel | Set env vars on Vercel and redeploy |
