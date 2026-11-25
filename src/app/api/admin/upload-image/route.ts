import { NextResponse } from "next/server";
import convertHeic from "heic-convert";

import { verifyAdminSession } from "@/lib/admin-session";
import {
  buildMediaFilename,
  getHostingerMediaMode,
  mediaUploadSuccessMessage,
  uploadMediaFile,
  type HostingerMediaFolder,
} from "@/lib/hostinger-media";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024; // HEIC phone photos can be larger before convert
const IMAGE_FOLDERS = new Set<HostingerMediaFolder>(["news", "hero"]);

const EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  heic: "image/heic",
  heif: "image/heif",
};

function extFromName(name: string): string | null {
  const m = /\.([a-z0-9]+)$/i.exec(name.trim());
  return m?.[1]?.toLowerCase() ?? null;
}

function mimeFromMagic(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.length >= 4 && buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) {
    return "image/x-icon";
  }
  const head = buffer.subarray(0, Math.min(buffer.length, 256)).toString("utf8").trimStart();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) return "image/svg+xml";
  return null;
}

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

function isHeicLike(file: File, buffer: Buffer, mime: string | null): boolean {
  const declared = (file.type || "").trim().toLowerCase();
  if (declared.includes("heic") || declared.includes("heif")) return true;
  if (mime === "image/heic" || mime === "image/heif") return true;
  const ext = extFromName(file.name);
  if (ext === "heic" || ext === "heif") return true;
  // ISO BMFF / HEIF often starts with ....ftypheic / ftypheif / ftypmif1
  if (buffer.length >= 12) {
    const brand = buffer.toString("ascii", 4, 12).toLowerCase();
    if (brand.startsWith("ftyp") && /heic|heif|mif1|msf1|hevx|hevc/.test(brand)) return true;
  }
  return false;
}

function resolveImageMime(file: File, buffer: Buffer): string | null {
  const declared = (file.type || "").trim().toLowerCase();
  if (declared === "image/jpg") return "image/jpeg";
  if (declared.includes("heic")) return "image/heic";
  if (declared.includes("heif")) return "image/heif";
  if (declared && declared !== "application/octet-stream" && Object.values(EXT_TO_MIME).includes(declared)) {
    return declared;
  }

  const fromMagic = mimeFromMagic(buffer);
  if (fromMagic) return fromMagic;

  const ext = extFromName(file.name);
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext]!;

  return null;
}

async function prepareUploadBuffer(
  file: File,
  buffer: Buffer,
): Promise<{ buffer: Buffer; mime: string; note?: string }> {
  const mime = resolveImageMime(file, buffer);
  if (isHeicLike(file, buffer, mime)) {
    try {
      const converted = await convertHeic({
        buffer,
        format: "JPEG",
        quality: 0.9,
      });
      return {
        buffer: Buffer.from(converted),
        mime: "image/jpeg",
        note: "HEIC converted to JPEG for web use",
      };
    } catch (e) {
      const detail = e instanceof Error ? e.message : "conversion failed";
      throw new Error(
        `Could not convert HEIC (${detail}). Export the photo as JPG from your phone/Photos app, then upload again.`,
      );
    }
  }

  if (!mime || mime === "image/heic" || mime === "image/heif") {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}. Use PNG, JPG, WebP, GIF, or HEIC.`);
  }

  return { buffer, mime };
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

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 12MB)" }, { status: 413 });
  }

  const folderRaw = String(form.get("folder") ?? "news").trim().toLowerCase();
  const folder: HostingerMediaFolder = IMAGE_FOLDERS.has(folderRaw as HostingerMediaFolder)
    ? (folderRaw as HostingerMediaFolder)
    : "news";

  try {
    const raw = Buffer.from(await file.arrayBuffer());
    const prepared = await prepareUploadBuffer(file, raw);
    const ext = safeExtFromMime(prepared.mime);
    const filename = buildMediaFilename(folder, ext);
    const { url, storage } = await uploadMediaFile({
      buffer: prepared.buffer,
      folder,
      filename,
      mimeType: prepared.mime,
    });
    return NextResponse.json({
      ok: true,
      url,
      storage,
      message: prepared.note
        ? `${mediaUploadSuccessMessage(getHostingerMediaMode())} ${prepared.note}.`
        : mediaUploadSuccessMessage(getHostingerMediaMode()),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    const status = /unsupported|could not convert/i.test(msg) ? 415 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
