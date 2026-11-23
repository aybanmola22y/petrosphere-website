import "server-only";

import https from "https";
import { URL } from "url";

/**
 * petrosphere.com.ph DNS points at Vercel, but Hostinger still serves the
 * vhost on the hosting IP. Uploads/proxy must hit that origin with the
 * correct Host / TLS servername.
 */
export function getHostingerOriginUrl(): string {
  return (
    process.env.HOSTINGER_UPLOAD_ORIGIN?.trim() ||
    process.env.HOSTINGER_UPLOAD_URL?.trim() ||
    "https://185.187.241.156/_cms/upload.php"
  );
}

export function getHostingerVhost(): string {
  return (
    process.env.HOSTINGER_UPLOAD_HOST_HEADER?.trim() ||
    "petrosphere.com.ph"
  );
}

export function mediaPublicPath(folder: "news" | "videos", filename: string): string {
  return `/media/${folder}/${filename}`;
}

/** Fetch a path on the Hostinger vhost (e.g. /videos/file.mp4). */
export async function fetchHostingerPath(
  pathname: string,
  init?: { method?: string; headers?: Record<string, string>; body?: Buffer | string },
): Promise<{ status: number; headers: Headers; body: Buffer }> {
  const origin = getHostingerOriginUrl();
  const base = new URL(origin);
  const vhost = getHostingerVhost();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: base.protocol,
        hostname: base.hostname,
        port: base.port || 443,
        path,
        method: init?.method ?? "GET",
        servername: vhost,
        headers: {
          Host: vhost,
          ...(init?.headers ?? {}),
        },
        // Hostinger cert is issued for the vhost name, not the raw IP.
        rejectUnauthorized: process.env.HOSTINGER_TLS_INSECURE === "true" ? false : true,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on("end", () => {
          const headers = new Headers();
          for (const [k, v] of Object.entries(res.headers)) {
            if (typeof v === "string") headers.set(k, v);
            else if (Array.isArray(v)) headers.set(k, v.join(", "));
          }
          resolve({
            status: res.statusCode ?? 502,
            headers,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    req.on("error", reject);
    if (init?.body) req.write(init.body);
    req.end();
  });
}

/** multipart POST to Hostinger upload.php (works even when domain DNS is Vercel). */
export async function postHostingerUpload(form: {
  folder: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
  secret: string;
}): Promise<{ status: number; json: { ok?: boolean; url?: string; error?: string } | null; raw: string }> {
  const origin = getHostingerOriginUrl();
  const base = new URL(origin.endsWith(".php") ? origin : `${origin.replace(/\/$/, "")}/_cms/upload.php`);
  const vhost = getHostingerVhost();
  const boundary = `----petrosphere${Date.now().toString(16)}`;

  const parts: Buffer[] = [];
  const pushField = (name: string, value: string) => {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
      ),
    );
  };
  pushField("folder", form.folder);
  pushField("filename", form.filename);
  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${form.filename}"\r\nContent-Type: ${form.mimeType}\r\n\r\n`,
    ),
  );
  parts.push(form.buffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
  const body = Buffer.concat(parts);

  const result = await fetchHostingerPath(base.pathname + base.search, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(body.length),
      "X-Upload-Secret": form.secret,
    },
    body,
  });

  const raw = result.body.toString("utf8");
  let json: { ok?: boolean; url?: string; error?: string } | null = null;
  try {
    json = JSON.parse(raw) as { ok?: boolean; url?: string; error?: string };
  } catch {
    json = null;
  }
  return { status: result.status, json, raw };
}
