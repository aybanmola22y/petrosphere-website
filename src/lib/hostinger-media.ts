import "server-only";

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Readable } from "node:stream";

import { createCmsAdminClient } from "@/lib/supabase/cms-admin";
import {
  mediaPublicPath,
  postHostingerUpload,
} from "@/lib/hostinger-origin";

export type HostingerMediaFolder = "news" | "videos";

export type HostingerMediaMode = "local" | "http" | "ftp" | "supabase";

const SUPABASE_MEDIA_BUCKET =
  process.env.SUPABASE_MEDIA_BUCKET?.trim() || "site-media";

export function getHostingerMediaMode(): HostingerMediaMode {
  const mode = process.env.HOSTINGER_MEDIA_MODE?.trim().toLowerCase();
  if (mode === "http" || mode === "ftp" || mode === "supabase") return mode;
  return "local";
}

export function getHostingerMediaBaseUrl(): string | null {
  const raw = process.env.HOSTINGER_MEDIA_BASE_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

export function isHostingerMediaConfigured(): boolean {
  return getHostingerMediaMode() !== "local";
}

export function buildMediaFilename(prefix: string, ext: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = crypto.randomBytes(4).toString("hex");
  return `${prefix}-${stamp}-${rand}.${ext}`;
}

function publicUrlFor(folder: HostingerMediaFolder, filename: string): string {
  const base = getHostingerMediaBaseUrl();
  // Prefer site-relative /media/... so the Next app can proxy from Hostinger
  // while petrosphere.com.ph DNS points at Vercel.
  if (!base || base.includes("petrosphere.com.ph")) {
    return mediaPublicPath(folder, filename);
  }
  return `${base}/${folder}/${filename}`;
}

async function uploadLocal(
  buffer: Buffer,
  folder: HostingerMediaFolder,
  filename: string,
): Promise<{ url: string }> {
  const relDir = path.join("public", folder);
  const absDir = path.join(process.cwd(), relDir);
  const absPath = path.join(absDir, filename);
  fs.mkdirSync(absDir, { recursive: true });
  fs.writeFileSync(absPath, buffer);
  return { url: publicUrlFor(folder, filename) };
}

async function uploadViaHttp(
  buffer: Buffer,
  folder: HostingerMediaFolder,
  filename: string,
  mimeType: string,
): Promise<{ url: string }> {
  const secret = process.env.HOSTINGER_UPLOAD_SECRET?.trim();
  if (!secret) {
    throw new Error("HOSTINGER_UPLOAD_SECRET is required for http mode");
  }

  const { status, json, raw } = await postHostingerUpload({
    folder,
    filename,
    mimeType,
    buffer,
    secret,
  });

  if (status === 413) {
    throw new Error(
      "Hostinger rejected the file (413 Payload Too Large). Raise PHP upload_max_filesize / post_max_size on Hostinger, or use a smaller video.",
    );
  }

  if (status === 401 || json?.error === "Unauthorized") {
    throw new Error(
      "Hostinger upload unauthorized — $UPLOAD_SECRET in upload.php must match HOSTINGER_UPLOAD_SECRET.",
    );
  }

  if (!json?.ok) {
    throw new Error(json?.error ?? `Hostinger upload failed (${status}): ${raw.slice(0, 200)}`);
  }

  // Always return a /media/... URL so playback goes through our proxy, not Vercel 404.
  return { url: mediaPublicPath(folder, filename) };
}

async function uploadViaFtp(
  buffer: Buffer,
  folder: HostingerMediaFolder,
  filename: string,
): Promise<{ url: string }> {
  const host = process.env.HOSTINGER_FTP_HOST?.trim();
  const user = process.env.HOSTINGER_FTP_USER?.trim();
  const password = process.env.HOSTINGER_FTP_PASSWORD?.trim();
  const remoteDir = process.env.HOSTINGER_FTP_REMOTE_DIR?.trim() || "/public_html";

  if (!host || !user || !password) {
    throw new Error("HOSTINGER_FTP_HOST, HOSTINGER_FTP_USER, and HOSTINGER_FTP_PASSWORD are required for ftp mode");
  }

  const { Client } = await import("basic-ftp");
  const client = new Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host,
      user,
      password,
      secure: process.env.HOSTINGER_FTP_SECURE !== "false",
    });

    const targetDir = `${remoteDir.replace(/\/$/, "")}/${folder}`;
    await client.ensureDir(targetDir);
    const remotePath = `${targetDir}/${filename}`.replace(/\/+/g, "/");
    await client.uploadFrom(Readable.from(buffer), remotePath);
  } finally {
    client.close();
  }

  return { url: publicUrlFor(folder, filename) };
}

async function ensureSupabaseMediaBucket() {
  const admin = createCmsAdminClient();
  const { data: buckets, error: listErr } = await admin.storage.listBuckets();
  if (listErr) throw new Error(`Supabase storage error: ${listErr.message}`);

  if (!buckets?.some((b) => b.name === SUPABASE_MEDIA_BUCKET)) {
    const { error: createErr } = await admin.storage.createBucket(SUPABASE_MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024,
    });
    if (createErr && !/already exists/i.test(createErr.message)) {
      throw new Error(
        `Could not create Supabase bucket "${SUPABASE_MEDIA_BUCKET}": ${createErr.message}. Create a public bucket named "${SUPABASE_MEDIA_BUCKET}" in the CMS Supabase project.`,
      );
    }
  }

  return admin;
}

async function uploadViaSupabase(
  buffer: Buffer,
  folder: HostingerMediaFolder,
  filename: string,
  mimeType: string,
): Promise<{ url: string }> {
  const admin = await ensureSupabaseMediaBucket();
  const objectPath = `${folder}/${filename}`;

  const { error } = await admin.storage.from(SUPABASE_MEDIA_BUCKET).upload(objectPath, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = admin.storage.from(SUPABASE_MEDIA_BUCKET).getPublicUrl(objectPath);
  if (!data.publicUrl) {
    throw new Error("Supabase upload succeeded but no public URL was returned.");
  }
  return { url: data.publicUrl };
}

export async function uploadMediaFile(options: {
  buffer: Buffer;
  folder: HostingerMediaFolder;
  filename: string;
  mimeType: string;
}): Promise<{ url: string; storage: HostingerMediaMode }> {
  const mode = getHostingerMediaMode();
  const { buffer, folder, filename, mimeType } = options;

  if (mode === "http") {
    return { ...(await uploadViaHttp(buffer, folder, filename, mimeType)), storage: "http" };
  }
  if (mode === "ftp") {
    return { ...(await uploadViaFtp(buffer, folder, filename)), storage: "ftp" };
  }
  if (mode === "supabase") {
    return { ...(await uploadViaSupabase(buffer, folder, filename, mimeType)), storage: "supabase" };
  }
  return { ...(await uploadLocal(buffer, folder, filename)), storage: "local" };
}

export function mediaUploadSuccessMessage(mode: HostingerMediaMode): string {
  if (mode === "http" || mode === "ftp") {
    return "File uploaded to Hostinger (public_html/news or public_html/videos).";
  }
  if (mode === "supabase") return "File uploaded to Supabase Storage.";
  return "File saved under /public/news or /public/videos (local dev).";
}
