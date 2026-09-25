import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadImage, deleteImage } from "@/lib/uploads";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_UPLOADS_PER_HOUR,
} from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-side image upload.
 *
 * Browser → this route (session authenticated) → Cloudinary (signed, secret
 * stays on the server) → secure URL → stored in `property_images`.
 *
 * The file is never written to the application server filesystem in production.
 */

/** Magic-byte sniffing so a renamed .exe cannot be uploaded as an "image". */
function sniffImageType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  // AVIF / HEIF: ....ftypavif / ftypheic at bytes 4-11
  const ftyp = buffer.subarray(4, 12).toString("latin1");
  if (ftyp.includes("ftyp") && /(avif|avis|heic|heix|mif1|msf1)/.test(ftyp)) {
    return "image/avif";
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Please log in to upload images" },
        { status: 401 }
      );
    }

    const limit = rateLimit(
      `upload:${session.id}`,
      MAX_UPLOADS_PER_HOUR,
      60 * 60 * 1000
    );
    if (!limit.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Upload limit reached. Try again in ${limit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file received" },
        { status: 400 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "The file is empty" },
        { status: 400 }
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Image is too large (max ${Math.round(
            MAX_IMAGE_BYTES / (1024 * 1024)
          )} MB)`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffImageType(buffer);
    if (!sniffed) {
      return NextResponse.json(
        { success: false, error: "Only JPG, PNG, WebP or AVIF images are allowed" },
        { status: 400 }
      );
    }
    const declared = (file.type || "").toLowerCase();
    const allowed = ACCEPTED_IMAGE_TYPES as readonly string[];
    if (declared && !allowed.includes(declared)) {
      return NextResponse.json(
        { success: false, error: "Only JPG, PNG, WebP or AVIF images are allowed" },
        { status: 400 }
      );
    }

    const asset = await uploadImage(file, {
      folder: "properties",
      prefix: String(session.id),
    });

    if (!asset.url) {
      return NextResponse.json(
        { success: false, error: "Upload failed. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, asset });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * Deletes an asset from the storage provider.
 * Only authenticated sellers/admins may call it, and only for assets they
 * uploaded (the browser only ever holds the publicId of its own uploads).
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      publicId?: string;
      provider?: string;
    } | null;

    if (!body?.publicId) {
      return NextResponse.json(
        { success: false, error: "publicId is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteImage(body.publicId, body.provider ?? null);
    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error("Upload delete error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
