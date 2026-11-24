import "server-only";

import https from "https";
import { URL } from "url";

/**
 * petrosphere.com.ph DNS points at Vercel, but Hostinger still serves the
 * vhost on the hosting IP. Uploads/proxy must hit that origin with the
 * correct Host / TLS servername — never the public domain (Vercel 308).
 */
const DEFAULT_HOSTINGER_IP = "185.187.241.156";

export function getHostingerOriginUrl(): string {
  return (
    process.env.HOSTINGER_UPLOAD_ORIGIN?.trim() ||
    process.env.HOSTINGER_UPLOAD_URL?.trim() ||
    `https://${DEFAULT_HOSTINGER_IP}/_cms/upload.php`
  );
}

export function getHostingerVhost(): string {
  return (
    process.env.HOSTINGER_UPLOAD_HOST_HEADER?.trim() ||
    "petrosphere.com.ph"
  );
}

/** TCP host for Hostinger — must be the server IP, not the public DNS name. */
export function getHostingerFetchHostname(): string {
  const explicit = process.env.HOSTINGER_ORIGIN_IP?.trim();
  if (explicit) return explicit;

  const origin = getHostingerOriginUrl();
  try {
    const host = new URL(origin).hostname;
    // Only trust literal IPv4 from env; domain names resolve to Vercel.
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host;
  } catch {
    /* fall through */
  }
  return DEFAULT_HOSTINGER_IP;
}

export function mediaPublicPath(folder: "news" | "videos", filename: string): string {
  return `/media/${folder}/${filename}`;
}

export type HostingerFetchResult = {
  status: number;
  headers: Headers;
  body: Buffer;
};

function headersFromNode(resHeaders: NodeJS.Dict<string | string[]>): Headers {
  const headers = new Headers();
  for (const [k, v] of Object.entries(resHeaders)) {
    if (typeof v === "string") headers.set(k, v);
    else if (Array.isArray(v)) headers.set(k, v.join(", "));
  }
  return headers;
}

/** Fetch a path on the Hostinger vhost (e.g. /videos/file.mp4). */
export async function fetchHostingerPath(
  pathname: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: Buffer | string;
    /** Forward browser Range header for video seeking. */
    range?: string | null;
  },
): Promise<HostingerFetchResult> {
  const vhost = getHostingerVhost();
  const hostname = getHostingerFetchHostname();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: "https:",
        hostname,
        port: 443,
        path,
        method: init?.method ?? "GET",
        servername: vhost,
        headers: {
          Host: vhost,
          ...(init?.range ? { Range: init.range } : {}),
          ...(init?.headers ?? {}),
        },
        // Cert is issued for the vhost name; connecting by IP needs SNI + optional insecure.
        rejectUnauthorized: process.env.HOSTINGER_TLS_INSECURE === "true" ? false : true,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 502,
            headers: headersFromNode(res.headers),
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
  let pathname = "/_cms/upload.php";
  try {
    const base = new URL(origin.endsWith(".php") ? origin : `${origin.replace(/\/$/, "")}/_cms/upload.php`);
    pathname = base.pathname + base.search;
  } catch {
    pathname = "/_cms/upload.php";
  }

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

  const result = await fetchHostingerPath(pathname, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(body.length),
      "X-Upload-Secret": form.secret,
      Host: vhost,
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
