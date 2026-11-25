import { NextResponse } from "next/server";

import { fetchHostingerPath, getHostingerFetchHostname } from "@/lib/hostinger-origin";

export const runtime = "nodejs";

/** Allow large video proxy responses (Hostinger files can be tens of MB). */
export const maxDuration = 60;

const ALLOWED = new Set(["news", "videos", "hero"]);

type Ctx = { params: Promise<{ folder: string; path: string[] }> };

function guessContentType(folder: string, filename: string, upstream?: string | null): string {
  if (upstream && !/text\/plain|text\/html/i.test(upstream)) return upstream;
  const lower = filename.toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (folder === "videos") return "video/mp4";
  return "application/octet-stream";
}

export async function GET(req: Request, ctx: Ctx) {
  const { folder, path: parts } = await ctx.params;
  if (!ALLOWED.has(folder) || !parts?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Prevent path traversal
  if (parts.some((p) => !p || p === "." || p === ".." || p.includes("\\") || p.includes("\0"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filename = parts.join("/");
  if (!/^[a-zA-Z0-9._/-]+$/.test(filename)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const range = req.headers.get("range");

  try {
    const upstream = await fetchHostingerPath(`/${folder}/${filename}`, {
      range,
    });

    // Vercel apex→www 308 body is literally "Redirecting..." — means we hit
    // public DNS instead of the Hostinger IP.
    const asText =
      upstream.body.length < 64 ? upstream.body.toString("utf8").trim() : "";
    if (
      upstream.status >= 300 &&
      upstream.status < 400 &&
      /redirecting/i.test(asText)
    ) {
      return NextResponse.json(
        {
          error:
            "Media proxy hit Vercel instead of Hostinger. Set HOSTINGER_UPLOAD_ORIGIN (or HOSTINGER_ORIGIN_IP) to the Hostinger server IP on Vercel.",
          hint: `Expected Hostinger IP fetch; resolved host was checked as ${getHostingerFetchHostname()}`,
        },
        { status: 502 },
      );
    }

    if (upstream.status >= 400) {
      return NextResponse.json(
        { error: "Media not found on Hostinger" },
        { status: upstream.status === 404 ? 404 : 502 },
      );
    }

    if (asText === "Redirecting..." || /^redirecting/i.test(asText)) {
      return NextResponse.json(
        {
          error:
            "Media proxy received a Vercel redirect. Set HOSTINGER_UPLOAD_ORIGIN=https://<hostinger-ip>/_cms/upload.php and HOSTINGER_TLS_INSECURE=true on Vercel.",
        },
        {
          status: 502,
          headers: {
            // Do not cache the bad redirect body
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const contentType = guessContentType(
      folder,
      filename,
      upstream.headers.get("content-type"),
    );

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      // Do not let Vercel CDN cache media — a prior bad apex redirect
      // ("Redirecting...") poisoned /media/* entries and broke <video>.
      "Cache-Control": "private, no-store",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
      Vary: "Range",
    };

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers["Content-Length"] = contentLength;

    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers["Content-Range"] = contentRange;

    return new NextResponse(new Uint8Array(upstream.body), {
      status: upstream.status === 206 ? 206 : 200,
      headers,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Proxy failed";
    return NextResponse.json(
      { error: msg },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
