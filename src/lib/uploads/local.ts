import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { UploadedAsset, UploadProvider, UploadTarget } from "./types";

/**
 * DEV-ONLY upload provider that writes files to `public/uploads`.
 *
 * It exists so the upload flow can be exercised locally (and in CI) without a
 * Cloudinary account. It is disabled in production and only used when BOTH
 * `UPLOAD_PROVIDER=local` and `ALLOW_LOCAL_UPLOADS=true` are set.
 *
 * Production must use Cloudinary (or another object store) — never the app
 * server filesystem.
 */

const PUBLIC_DIR = path.join(process.cwd(), "public", "uploads");

export function isLocalUploadAllowed(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.UPLOAD_PROVIDER === "local" &&
    process.env.ALLOW_LOCAL_UPLOADS === "true"
  );
}

function extFromType(type: string, filename: string): string {
  const fromName = path.extname(filename || "").toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(fromName)) {
    return fromName;
  }
  switch (type) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/avif":
      return ".avif";
    default:
      return ".jpg";
  }
}

export const localProvider: UploadProvider = {
  name: "local",

  async upload(file: File, target?: UploadTarget): Promise<UploadedAsset> {
    if (!isLocalUploadAllowed()) {
      throw new Error(
        "Local uploads are disabled. Configure Cloudinary (or set UPLOAD_PROVIDER=local + ALLOW_LOCAL_UPLOADS=true outside production)."
      );
    }

    const ext = extFromType(file.type, file.name);
    const folder = target?.folder || "properties";
    const dir = path.join(PUBLIC_DIR, folder);
    await mkdir(dir, { recursive: true });

    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    const publicId = `${folder}/${filename}`;
    return {
      url: `/uploads/${publicId}`,
      publicId,
      provider: "local",
      width: null,
      height: null,
      bytes: buffer.byteLength,
      format: ext.replace(".", ""),
    };
  },

  async destroy(publicId: string): Promise<boolean> {
    if (!isLocalUploadAllowed() || !publicId) return false;
    try {
      const safe = path
        .normalize(publicId)
        .replace(/^(\.\.[/\\])+/, "")
        .replace(/^[/\\]+/, "");
      await unlink(path.join(PUBLIC_DIR, safe));
      return true;
    } catch {
      return false;
    }
  },
};
