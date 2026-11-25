import { NextResponse } from "next/server";

import { verifyAdminSession } from "@/lib/admin-session";
import {
  buildMediaFilename,
  getHostingerMediaMode,
  mediaUploadSuccessMessage,
  uploadMediaFile,
  type HostingerMediaFolder,
} from "@/lib/hostinger-media";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024; // 6MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml", "image/x-icon"]);
const IMAGE_FOLDERS = new Set<HostingerMediaFolder>(["news", "hero"]);

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

  const folderRaw = String(form.get("folder") ?? "news").trim().toLowerCase();
  const folder: HostingerMediaFolder = IMAGE_FOLDERS.has(folderRaw as HostingerMediaFolder)
    ? (folderRaw as HostingerMediaFolder)
    : "news";

  const ext = safeExtFromMime(file.type);
  const filename = buildMediaFilename(folder, ext);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, storage } = await uploadMediaFile({
      buffer,
      folder,
      filename,
      mimeType: file.type,
    });
    return NextResponse.json({
      ok: true,
      url,
      storage,
      message: mediaUploadSuccessMessage(getHostingerMediaMode()),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
