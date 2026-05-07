import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { verifyAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024; // 6MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml", "image/x-icon"]);

function safeExtFromMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    case "image/x-icon":
      return "ico";
    default:
      return "bin";
  }
}

export async function POST(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 6MB)" }, { status: 413 });
  }

  const ext = safeExtFromMime(file.type);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = crypto.randomBytes(4).toString("hex");
  const filename = `news-${stamp}-${rand}.${ext}`;

  const relDir = path.join("public", "uploads", "news");
  const absDir = path.join(process.cwd(), relDir);
  const absPath = path.join(absDir, filename);

  try {
    fs.mkdirSync(absDir, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(absPath, buf);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Write failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: `/uploads/news/${filename}` });
}

