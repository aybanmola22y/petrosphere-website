import { NextResponse } from "next/server";

import { fetchHostingerPath } from "@/lib/hostinger-origin";

export const runtime = "nodejs";

const ALLOWED = new Set(["news", "videos"]);

type Ctx = { params: Promise<{ folder: string; path: string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
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

  try {
    const upstream = await fetchHostingerPath(`/${folder}/${filename}`);
    if (upstream.status >= 400) {
      return NextResponse.json(
        { error: "Media not found on Hostinger" },
        { status: upstream.status === 404 ? 404 : 502 },
      );
    }

    const contentType =
      upstream.headers.get("content-type") ||
      (folder === "videos" ? "video/mp4" : "application/octet-stream");

    return new NextResponse(new Uint8Array(upstream.body), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        ...(upstream.headers.get("content-length")
          ? { "Content-Length": upstream.headers.get("content-length")! }
          : {}),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Proxy failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
