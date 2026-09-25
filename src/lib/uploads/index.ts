import { cloudinaryProvider, isCloudinaryConfigured } from "./cloudinary";
import { isLocalUploadAllowed, localProvider } from "./local";
import type { UploadedAsset, UploadProvider, UploadTarget } from "./types";

export type { UploadedAsset, UploadProvider, UploadTarget } from "./types";

/**
 * Returns the configured upload provider.
 *
 * Priority:
 *   1. `UPLOAD_PROVIDER=local`  → dev filesystem provider (never in production)
 *   2. Cloudinary credentials   → signed server-side upload (production default)
 *
 * Throws a descriptive error when nothing is configured so the API can return a
 * clear message instead of silently dropping uploads.
 */
export function getUploadProvider(): UploadProvider {
  if (isLocalUploadAllowed()) return localProvider;
  if (process.env.UPLOAD_PROVIDER === "cloudinary" || isCloudinaryConfigured()) {
    return cloudinaryProvider;
  }
  throw new Error(
    "No image storage provider configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
  );
}

export function isUploadConfigured(): boolean {
  return isLocalUploadAllowed() || isCloudinaryConfigured();
}

export async function uploadImage(
  file: File,
  target?: UploadTarget
): Promise<UploadedAsset> {
  return getUploadProvider().upload(file, target);
}

/** Best effort delete — never throws. */
export async function deleteImage(
  publicId: string,
  provider?: string | null
): Promise<boolean> {
  if (!publicId) return false;
  try {
    if (provider === "local") return await localProvider.destroy(publicId);
    if (provider === "cloudinary") {
      return await cloudinaryProvider.destroy(publicId);
    }
    return await getUploadProvider().destroy(publicId);
  } catch {
    return false;
  }
}
