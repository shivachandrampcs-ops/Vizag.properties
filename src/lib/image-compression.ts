import { MAX_IMAGE_DIMENSION } from "./constants";

/**
 * Browser-side image optimisation.
 *
 * Runs entirely in the user's device before the file is uploaded:
 *   • honours EXIF orientation (createImageBitmap with imageOrientation)
 *   • downscales so the longest edge is <= MAX_IMAGE_DIMENSION
 *   • re-encodes to WebP (fallback JPEG) at ~0.82 quality
 *
 * If anything fails (unsupported codec, canvas limits, ...) the ORIGINAL file is
 * returned so the flow never breaks — the server still enforces size limits.
 */

type CompressOptions = {
  maxDimension?: number;
  quality?: number;
};

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // fall through to <img> decoding
    }
  }
  const url = URL.createObjectURL(file);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<{ file: File; compressed: boolean }> {
  const maxDimension = options.maxDimension ?? MAX_IMAGE_DIMENSION;
  const quality = options.quality ?? 0.82;

  if (typeof window === "undefined" || typeof document === "undefined") {
    return { file, compressed: false };
  }
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return { file, compressed: false };
  }

  try {
    const source = await decode(file);
    const width =
      "width" in source ? source.width : (source as HTMLImageElement).width;
    const height =
      "height" in source ? source.height : (source as HTMLImageElement).height;

    if (!width || !height) return { file, compressed: false };

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, compressed: false };

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source as CanvasImageSource, 0, 0, targetW, targetH);
    if ("close" in source && typeof source.close === "function") {
      (source as ImageBitmap).close();
    }

    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        "image/webp",
        quality
      );
    });

    const finalBlob =
      blob ??
      (await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
      }));

    if (!finalBlob) return { file, compressed: false };

    // Only keep the re-encoded file when it is actually smaller.
    if (finalBlob.size >= file.size) return { file, compressed: false };

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const ext = finalBlob.type === "image/jpeg" ? "jpg" : "webp";
    const compressed = new File([finalBlob], `${baseName}.${ext}`, {
      type: finalBlob.type,
      lastModified: Date.now(),
    });
    return { file: compressed, compressed: true };
  } catch {
    return { file, compressed: false };
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
