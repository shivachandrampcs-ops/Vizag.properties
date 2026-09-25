"use client";

import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  AlertCircle,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { compressImage, formatBytes } from "@/lib/image-compression";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_IMAGE_TYPES_ATTR,
  MAX_IMAGE_BYTES,
  MAX_PROPERTY_IMAGES,
} from "@/lib/constants";

export type UploadedImageValue = {
  /** Stable client key for React lists. */
  key?: string;
  imageUrl: string;
  altText?: string | null;
  isCover?: boolean;
  sortOrder?: number;
  provider?: string | null;
  publicId?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  format?: string | null;
  /** Local-only flags (never sent to the server). */
  uploading?: boolean;
  isNew?: boolean;
};

type Props = {
  value: UploadedImageValue[];
  /**
   * A React state setter (e.g. `setImages`). It receives an updater function so
   * that several uploads in a row never clobber each other with stale state.
   */
  onChange: Dispatch<SetStateAction<UploadedImageValue[]>>;
  max?: number;
  disabled?: boolean;
  /** Shown under the drop zone. */
  hint?: string;
};

let keySeed = 0;
function nextKey() {
  keySeed += 1;
  return `img-${Date.now()}-${keySeed}`;
}

export function ImageUploader({
  value,
  onChange,
  max = MAX_PROPERTY_IMAGES,
  disabled = false,
  hint,
}: Props) {
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const used = value.length;
  const full = used >= max;

  const update = useCallback(
    (updater: (prev: UploadedImageValue[]) => UploadedImageValue[]) => {
      onChange((prev) =>
        updater(prev).map((img, i) => ({
          ...img,
          sortOrder: i,
          isCover: img.isCover ?? i === 0,
        }))
      );
    },
    [onChange]
  );

  async function uploadFiles(files: FileList | File[]) {
    setError("");
    const list = Array.from(files);
    if (list.length === 0) return;

    // `used` comes from the render closure, so keep a local counter as we go
    // (several files can be uploaded in a row before React re-renders).
    let count = used;
    const remaining = Math.max(0, max - count);
    if (remaining <= 0) {
      setError(`You can upload at most ${max} images.`);
      return;
    }
    if (list.length > remaining) {
      setError(`Only the first ${remaining} image(s) were added (max ${max}).`);
    }

    for (const original of list.slice(0, remaining)) {
      if (count >= max) break;
      const allowed = ACCEPTED_IMAGE_TYPES as readonly string[];
      if (original.type && !allowed.includes(original.type.toLowerCase())) {
        setError(`"${original.name}" is not a JPG, PNG, WebP or AVIF image.`);
        continue;
      }
      if (original.size > MAX_IMAGE_BYTES) {
        setError(
          `"${original.name}" is ${formatBytes(original.size)} — the limit is ${formatBytes(
            MAX_IMAGE_BYTES
          )}.`
        );
        continue;
      }

      count += 1;
      const key = nextKey();
      // Optimistic placeholder so the user sees the picture immediately.
      const previewUrl = URL.createObjectURL(original);
      update((prev) => [
        ...prev,
        {
          key,
          imageUrl: previewUrl,
          isCover: prev.length === 0,
          sortOrder: prev.length,
          provider: "local",
          publicId: null,
          uploading: true,
          isNew: true,
        },
      ]);

      try {
        const { file } = await compressImage(original);
        const form = new FormData();
        form.append("file", file, file.name);

        const res = await fetch("/api/uploads/property-images", {
          method: "POST",
          body: form,
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Upload failed");
        }

        const asset = json.asset as {
          url: string;
          publicId: string;
          provider: string;
          width: number | null;
          height: number | null;
          bytes: number | null;
          format: string | null;
        };

        update((prev) =>
          prev.map((img) =>
            img.key === key
              ? {
                  ...img,
                  imageUrl: asset.url,
                  publicId: asset.publicId,
                  provider: asset.provider,
                  width: asset.width,
                  height: asset.height,
                  bytes: asset.bytes,
                  format: asset.format,
                  uploading: false,
                }
              : img
          )
        );
      } catch (err) {
        update((prev) => prev.filter((img) => img.key !== key));
        setError(
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again."
        );
      } finally {
        URL.revokeObjectURL(previewUrl);
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function addByUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      setError("Please enter a valid image URL starting with http(s)://");
      return;
    }
    setError("");
    update((prev) => [
      ...prev,
      {
        key: nextKey(),
        imageUrl: url,
        isCover: prev.length === 0,
        sortOrder: prev.length,
        provider: "url",
        publicId: null,
      },
    ]);
    setUrlInput("");
  }

  function removeAt(index: number) {
    const target = value[index];
    update((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((i) => i.isCover)) {
        next[0] = { ...next[0], isCover: true };
      }
      return next;
    });

    // Delete the stored asset (best effort) if it came from a provider.
    if (target?.publicId && (target.provider === "cloudinary" || target.provider === "local")) {
      void fetch("/api/uploads/property-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: target.publicId, provider: target.provider }),
      }).catch(() => undefined);
    }
  }

  function setCover(index: number) {
    update((prev) => prev.map((img, i) => ({ ...img, isCover: i === index })));
  }

  function move(index: number, delta: number) {
    update((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }

  function onDropReorder(toIndex: number) {
    if (dragIndex === null || dragIndex === toIndex) {
      setDragIndex(null);
      return;
    }
    move(dragIndex, toIndex - dragIndex);
    setDragIndex(null);
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          void uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-5 sm:p-6 text-center transition-colors",
          dragging
            ? "border-brand-500 bg-brand-50"
            : "border-slate-300 bg-slate-50/60",
          (disabled || full) && "opacity-60"
        )}
      >
        <UploadCloud className="h-9 w-9 mx-auto text-brand-600" />
        <p className="mt-2 text-sm font-semibold text-slate-900">
          Drag &amp; drop photos here
        </p>
        <p className="mt-1 text-xs text-slate-500">
          or tap the button below — JPG, PNG, WebP up to{" "}
          {Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB each
        </p>

        <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            disabled={disabled || full}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-60 w-full sm:w-auto"
          >
            <ImagePlus className="h-4 w-4" />
            Choose Photos
          </button>
          <button
            type="button"
            disabled={disabled || full}
            onClick={() => setShowUrl((s) => !s)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-white disabled:opacity-60 w-full sm:w-auto"
          >
            <LinkIcon className="h-4 w-4" />
            Add by URL
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES_ATTR}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files);
          }}
        />

        {showUrl && (
          <div className="mt-3 flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="flex-1 px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={addByUrl}
              disabled={disabled || full}
              className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
            >
              Add
            </button>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">
          {used} / {max} images
          {hint ? ` • ${hint}` : " • The first photo is the cover image."}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((img, i) => (
            <div
              key={img.key ?? img.imageUrl}
              draggable={!img.uploading}
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropReorder(i)}
              className={cn(
                "relative group rounded-xl overflow-hidden border-2 bg-slate-100",
                img.isCover ? "border-gold-500" : "border-slate-200",
                dragIndex === i && "opacity-60"
              )}
            >
              <div className="aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={`Property photo ${i + 1}`}
                  className={cn(
                    "w-full h-full object-cover",
                    img.uploading && "opacity-40"
                  )}
                />
              </div>

              {img.uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-700">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-[11px] font-semibold">Uploading…</span>
                </div>
              )}

              {img.isCover && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-gold-500 text-white text-[10px] font-bold">
                  COVER
                </span>
              )}
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-900/70 text-white text-[10px] font-semibold">
                {i + 1}
              </span>

              {/* Actions — always visible on touch devices */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent p-1.5 flex items-center justify-between gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Move left"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="p-1 rounded bg-white/90 text-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move right"
                    onClick={() => move(i, 1)}
                    disabled={i === value.length - 1}
                    className="p-1 rounded bg-white/90 text-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Set as cover"
                    onClick={() => setCover(i)}
                    className={cn(
                      "p-1 rounded",
                      img.isCover
                        ? "bg-gold-500 text-white"
                        : "bg-white/90 text-slate-700"
                    )}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    onClick={() => removeAt(i)}
                    className="p-1 rounded bg-red-500 text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
