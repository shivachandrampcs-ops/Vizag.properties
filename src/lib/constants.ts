// Shared limits used by BOTH the browser (upload widget) and the server
// (API validation). They are intentionally not overridable from the client.

/** Maximum number of images per property listing. */
export const MAX_PROPERTY_IMAGES = 12;

/** Maximum size of a single uploaded file, in bytes (8 MB). */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Accepted upload MIME types. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** `accept` attribute for <input type="file" />. */
export const ACCEPTED_IMAGE_TYPES_ATTR = ACCEPTED_IMAGE_TYPES.join(",");

/** Longest edge kept when an image is compressed in the browser. */
export const MAX_IMAGE_DIMENSION = 1600;

/** Max uploads allowed per authenticated user per rolling hour. */
export const MAX_UPLOADS_PER_HOUR = 60;

/** Minimum length of an admin rejection reason. */
export const MIN_REJECTION_REASON_LENGTH = 5;
