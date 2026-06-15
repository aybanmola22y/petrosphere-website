import "server-only";

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Readable } from "node:stream";

export type HostingerMediaFolder = "news" | "videos";

export type HostingerMediaMode = "local" | "http" | "ftp";

export function getHostingerMediaMode(): HostingerMediaMode {
  const mode = process.env.HOSTINGER_MEDIA_MODE?.trim().toLowerCase();
  if (mode === "http" || mode === "ftp") return mode;
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
  if (base) return `${base}/uploads/${folder}/${filename}`;
  return `/uploads/${folder}/${filename}`;
}

async function uploadLocal(
  buffer: Buffer,
  folder: HostingerMediaFolder,
  filename: string,
): Promise<{ url: string }> {
  const relDir = path.join("public", "uploads", folder);
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
  const uploadUrl = process.env.HOSTINGER_UPLOAD_URL?.trim();
  const secret = process.env.HOSTINGER_UPLOAD_SECRET?.trim();
  if (!uploadUrl || !secret) {
    throw new Error("HOSTINGER_UPLOAD_URL and HOSTINGER_UPLOAD_SECRET are required for http mode");
  }

  const form = new FormData();
  form.append("folder", folder);
  form.append("filename", filename);
  form.append("file", new Blob([buffer], { type: mimeType }), filename);

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "X-Upload-Secret": secret },
    body: form,
  });

  const data = (await res.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
  if (!res.ok || !data?.ok || !data.url) {
    throw new Error(data?.error ?? `Hostinger upload failed (${res.status})`);
  }
  return { url: data.url };
}

async function uploadViaFtp(
  buffer: Buffer,
  folder: HostingerMediaFolder,
  filename: string,
): Promise<{ url: string }> {
  const host = process.env.HOSTINGER_FTP_HOST?.trim();
  const user = process.env.HOSTINGER_FTP_USER?.trim();
  const password = process.env.HOSTINGER_FTP_PASSWORD?.trim();
  const remoteDir = process.env.HOSTINGER_FTP_REMOTE_DIR?.trim() || "/public_html/uploads";

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
  return { ...(await uploadLocal(buffer, folder, filename)), storage: "local" };
}

export function mediaUploadSuccessMessage(mode: HostingerMediaMode): string {
  if (mode === "http" || mode === "ftp") return "File uploaded to Hostinger.";
  return "File saved to /public/uploads/ (local dev — enable HOSTINGER_MEDIA_MODE for production).";
}
