import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { verifyAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function safeExtFromMime(mime: string): string {
  switch (mime) {
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "video/quicktime":
      return "mov";
    default:
      return "mp4";
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
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || "unknown"}. Use MP4, WebM, or MOV.` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 413 });
  }

  const ext = safeExtFromMime(file.type);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = crypto.randomBytes(4).toString("hex");
  const filename = `testimonial-${stamp}-${rand}.${ext}`;

  const relDir = path.join("public", "uploads", "videos");
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

  return NextResponse.json({ ok: true, url: `/uploads/videos/${filename}` });
}
