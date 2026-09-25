import crypto from "node:crypto";
import type { UploadedAsset, UploadProvider, UploadTarget } from "./types";

/**
 * Server-side Cloudinary upload using the *signed* REST API.
 *
 * The API secret never leaves the server: it is only used to sign the request
 * here. The browser uploads to our own Next.js route handler
 * (`/api/uploads/property-images`), which forwards the file to Cloudinary.
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "vizag-properties";

/**
 * Derived (optimised) version generated on upload: max 1600px wide, auto
 * format/quality. The original is kept as the master asset.
 */
const EAGER_TRANSFORMATION = "c_limit,w_1600/f_auto,q_auto";

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

function assertConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
  }
}

/** Cloudinary signature = sha1(sorted "key=value" pairs + api_secret). */
function sign(params: Record<string, string | number | undefined>): string {
  const toSign = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("&");
  return crypto
    .createHash("sha1")
    .update(toSign + (API_SECRET ?? ""))
    .digest("hex");
}

type CloudinaryResponse = Record<string, unknown> & {
  error?: { message?: string };
};

async function postToCloudinary(
  endpoint: "image/upload" | "image/destroy",
  params: Record<string, string | number | undefined>,
  file?: { blob: Blob; filename: string }
): Promise<CloudinaryResponse> {
  assertConfigured();

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ ...params, timestamp });

  const body = new FormData();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    body.append(key, String(value));
  }
  body.append("timestamp", String(timestamp));
  body.append("api_key", API_KEY as string);
  body.append("signature", signature);
  if (file) body.append("file", file.blob, file.filename);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}`,
    { method: "POST", body }
  );

  const json = (await res.json().catch(() => ({}))) as CloudinaryResponse;
  if (!res.ok) {
    throw new Error(
      json.error?.message ?? `Cloudinary ${endpoint} failed (${res.status})`
    );
  }
  return json;
}

export const cloudinaryProvider: UploadProvider = {
  name: "cloudinary",

  async upload(file: File, target?: UploadTarget): Promise<UploadedAsset> {
    assertConfigured();

    const folder = [FOLDER, target?.folder].filter(Boolean).join("/");
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = new Blob([buffer], {
      type: file.type || "application/octet-stream",
    });

    const result = await postToCloudinary(
      "image/upload",
      { folder, eager: EAGER_TRANSFORMATION },
      { blob, filename: file.name || "upload.jpg" }
    );

    const eager = Array.isArray(result.eager)
      ? (result.eager as Record<string, unknown>[])[0]
      : undefined;

    return {
      url: String(
        (eager?.secure_url as string) ??
          (result.secure_url as string) ??
          (result.url as string) ??
          ""
      ),
      publicId: String(result.public_id ?? ""),
      provider: "cloudinary",
      width: Number(eager?.width ?? result.width ?? 0) || null,
      height: Number(eager?.height ?? result.height ?? 0) || null,
      bytes: Number(eager?.bytes ?? result.bytes ?? 0) || null,
      format: String(eager?.format ?? result.format ?? "") || null,
    };
  },

  async destroy(publicId: string): Promise<boolean> {
    if (!publicId) return false;
    try {
      const result = await postToCloudinary("image/destroy", {
        public_id: publicId,
        invalidate: "true",
      });
      return result.result === "ok";
    } catch {
      return false;
    }
  },
};
