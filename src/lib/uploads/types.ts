export type UploadedAsset = {
  /** Secure URL persisted in `property_images.image_url`. */
  url: string;
  /** Provider asset id used to delete/replace the asset later. */
  publicId: string;
  provider: "cloudinary" | "local" | "url";
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  format?: string | null;
};

export type UploadTarget = {
  /** Logical folder inside the provider, e.g. "vizag-properties/properties". */
  folder?: string;
  /** Account/property hint used to namespace uploads. */
  prefix?: string;
};

export interface UploadProvider {
  readonly name: "cloudinary" | "local";
  upload(file: File, target?: UploadTarget): Promise<UploadedAsset>;
  destroy(publicId: string): Promise<boolean>;
}
