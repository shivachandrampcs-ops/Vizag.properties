"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  propertySchema,
  type PropertyInput,
} from "@/lib/validations";
import { VIZAG_LOCATIONS, cn } from "@/lib/utils";
import { ImageUploader, type UploadedImageValue } from "@/components/image-uploader";
import {
  Save,
  Send,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  ShieldAlert,
} from "lucide-react";

type ExistingImage = {
  id?: number;
  imageUrl: string;
  altText?: string | null;
  isCover?: boolean | null;
  sortOrder?: number | null;
  provider?: string | null;
  publicId?: string | null;
};

type AccountOption = { id: number; name: string; publisherType?: string | null };

/**
 * Single property form shared by the seller dashboard and the admin dashboard
 * (and previously by the builder dashboard) — there is intentionally only one
 * implementation of property CRUD UI in the project.
 */
export function PropertyForm({
  initial,
  propertyId,
  existingImages = [],
  mode = "seller",
  accounts = [],
  builders,
  initialAccountId,
  initialBuilderId,
  rejectionReason,
  moderationStatus,
  apiBase,
  redirectPath,
}: {
  initial?: Partial<PropertyInput>;
  propertyId?: number;
  existingImages?: ExistingImage[];
  /** "seller" (default): the signed-in seller manages their own property.
   *  "admin": admin manages any property and picks the owning account. */
  mode?: "seller" | "builder" | "admin";
  /** Accounts the admin can assign the property to. */
  accounts?: AccountOption[];
  /** Deprecated alias of `accounts` (kept for older call sites). */
  builders?: AccountOption[];
  initialAccountId?: number;
  /** Deprecated alias of `initialAccountId`. */
  initialBuilderId?: number;
  /** Shown when the admin rejected this listing. */
  rejectionReason?: string | null;
  moderationStatus?: string;
  apiBase?: string;
  redirectPath?: string;
}) {
  const router = useRouter();
  const isAdmin = mode === "admin";
  const [loading, setLoading] = useState<"" | "draft" | "submit">("");
  const [error, setError] = useState("");
  const [images, setImages] = useState<UploadedImageValue[]>(
    existingImages.map((img, i) => ({
      key: img.id ? `db-${img.id}` : `url-${i}-${img.imageUrl}`,
      imageUrl: img.imageUrl,
      altText: img.altText ?? null,
      isCover: img.isCover ?? i === 0,
      sortOrder: img.sortOrder ?? i,
      provider: img.provider ?? "url",
      publicId: img.publicId ?? null,
    }))
  );
  const [accountId, setAccountId] = useState<string>(
    String(
      initialAccountId ??
        initialBuilderId ??
        (builders?.[0]?.id ?? accounts?.[0]?.id ?? "") ??
        ""
    )
  );

  const accountOptions = accounts.length ? accounts : (builders ?? []);

  const resolvedApiBase =
    apiBase ?? (isAdmin ? "/api/admin/properties" : "/api/seller/properties");
  const resolvedRedirectPath =
    redirectPath ??
    (isAdmin ? "/dashboard/admin/properties" : "/dashboard/seller/properties");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      propertyType: (initial?.propertyType as PropertyInput["propertyType"]) ?? "apartment",
      status: (initial?.status as PropertyInput["status"]) ?? "ready_to_move",
      furnishing:
        (initial?.furnishing as PropertyInput["furnishing"]) ?? "unfurnished",
      price: initial?.price ?? 0,
      pricePerSqft: initial?.pricePerSqft ?? undefined,
      area: initial?.area ?? 0,
      bedrooms: initial?.bedrooms ?? 0,
      bathrooms: initial?.bathrooms ?? 0,
      balconies: initial?.balconies ?? 0,
      floor: initial?.floor ?? undefined,
      totalFloors: initial?.totalFloors ?? undefined,
      facing: initial?.facing ?? "",
      address: initial?.address ?? "",
      location: initial?.location ?? "",
      city: initial?.city ?? "Visakhapatnam",
      state: initial?.state ?? "Andhra Pradesh",
      pincode: initial?.pincode ?? "",
      latitude: initial?.latitude ?? "",
      longitude: initial?.longitude ?? "",
      reraId: initial?.reraId ?? "",
      approvalInfo: (initial as { approvalInfo?: string } | undefined)
        ?.approvalInfo ?? "",
      contactPreference:
        (initial as { contactPreference?: "call" | "whatsapp" | "both" } | undefined)
          ?.contactPreference ?? "both",
      isFeatured: initial?.isFeatured ?? false,
      amenities: initial?.amenities ?? "",
      highlights: initial?.highlights ?? "",
    } as never,
  });

  async function onSubmit(data: Record<string, unknown>, intent: "draft" | "submit") {
    if (images.length === 0) {
      setError("Please upload at least one property photo.");
      return;
    }
    if (images.some((i) => i.uploading)) {
      setError("Please wait for all images to finish uploading.");
      return;
    }
    if (isAdmin && !accountId) {
      setError("Please select the account this property belongs to.");
      return;
    }

    setLoading(intent);
    setError("");
    try {
      const payload = {
        ...data,
        intent,
        ...(isAdmin ? { builderId: Number(accountId) } : {}),
        amenities: data.amenities
          ? String(data.amenities)
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        highlights: data.highlights
          ? String(data.highlights)
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        images: images.map((img, i) => ({
          imageUrl: img.imageUrl,
          altText: data.title ?? "",
          isCover: img.isCover ?? i === 0,
          sortOrder: i,
          provider: img.provider ?? "url",
          publicId: img.publicId ?? null,
          width: img.width ?? null,
          height: img.height ?? null,
          bytes: img.bytes ?? null,
          format: img.format ?? null,
        })),
      };

      const url = propertyId ? `${resolvedApiBase}/${propertyId}` : resolvedApiBase;
      const method = propertyId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save the property");
      }
      router.push(resolvedRedirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading("");
    }
  }

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";

  const busy = loading !== "";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit((data) => onSubmit(data as Record<string, unknown>, "submit"))(e);
      }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!isAdmin && moderationStatus === "rejected" && rejectionReason && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              This property was rejected
            </p>
            <p className="mt-0.5 text-sm text-red-700">{rejectionReason}</p>
            <p className="mt-1 text-xs text-red-600">
              Update the listing and press “Submit for Review” to send it back
              to the admin team.
            </p>
          </div>
        </div>
      )}

      {/* Basic info */}
      <Section title="Basic Information">
        {isAdmin && (
          <div>
            <Label required>Listed by (account)</Label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select an account</option>
              {accountOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.publisherType ? ` (${b.publisherType})` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              The property will be listed under this builder, owner or agent.
            </p>
          </div>
        )}
        <div>
          <Label required>Property Title</Label>
          <input
            type="text"
            {...register("title")}
            className={cn(inputClass, errors.title && "border-red-300")}
            placeholder="e.g. 3 BHK Luxury Apartment at MVP Colony"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">
              {errors.title.message as string}
            </p>
          )}
        </div>
        <div>
          <Label required>Description</Label>
          <textarea
            rows={5}
            {...register("description")}
            className={cn(inputClass, "resize-y", errors.description && "border-red-300")}
            placeholder="Describe the property in detail..."
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message as string}
            </p>
          )}
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label required>Property Type</Label>
            <select {...register("propertyType")} className={inputClass}>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="independent_house">Independent House</option>
              <option value="commercial">Commercial</option>
              <option value="penthouse">Penthouse</option>
            </select>
          </div>
          <div>
            <Label required>Property Status</Label>
            <select {...register("status")} className={inputClass}>
              <option value="ready_to_move">Ready to Move</option>
              <option value="under_construction">Under Construction</option>
              <option value="new_launch">New Launch</option>
              <option value="resale">Resale</option>
            </select>
          </div>
          <div>
            <Label>Furnishing</Label>
            <select {...register("furnishing")} className={inputClass}>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi_furnished">Semi-Furnished</option>
              <option value="fully_furnished">Fully-Furnished</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Pricing & Area */}
      <Section title="Pricing & Area">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label required>Price (₹)</Label>
            <input
              type="number"
              {...register("price")}
              className={cn(inputClass, errors.price && "border-red-300")}
              placeholder="8500000"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-600">
                {errors.price.message as string}
              </p>
            )}
          </div>
          <div>
            <Label>Price per sqft (₹)</Label>
            <input
              type="number"
              {...register("pricePerSqft")}
              className={inputClass}
              placeholder="5000"
            />
          </div>
          <div>
            <Label required>Area (sqft)</Label>
            <input
              type="number"
              {...register("area")}
              className={cn(inputClass, errors.area && "border-red-300")}
              placeholder="1500"
            />
            {errors.area && (
              <p className="mt-1 text-xs text-red-600">
                {errors.area.message as string}
              </p>
            )}
          </div>
          <div>
            <Label>Bedrooms</Label>
            <input
              type="number"
              {...register("bedrooms")}
              className={inputClass}
              placeholder="3"
            />
          </div>
          <div>
            <Label>Bathrooms</Label>
            <input
              type="number"
              {...register("bathrooms")}
              className={inputClass}
              placeholder="3"
            />
          </div>
          <div>
            <Label>Balconies</Label>
            <input
              type="number"
              {...register("balconies")}
              className={inputClass}
              placeholder="2"
            />
          </div>
          <div>
            <Label>Floor</Label>
            <input
              type="number"
              {...register("floor")}
              className={inputClass}
              placeholder="5"
            />
          </div>
          <div>
            <Label>Total Floors</Label>
            <input
              type="number"
              {...register("totalFloors")}
              className={inputClass}
              placeholder="12"
            />
          </div>
          <div>
            <Label>Facing</Label>
            <select {...register("facing")} className={inputClass}>
              <option value="">Select</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="North-East">North-East</option>
              <option value="North-West">North-West</option>
              <option value="South-East">South-East</option>
              <option value="South-West">South-West</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Location */}
      <Section title="Location">
        <div>
          <Label required>Full Address</Label>
          <input
            type="text"
            {...register("address")}
            className={cn(inputClass, errors.address && "border-red-300")}
            placeholder="Sector 4, MVP Colony, Visakhapatnam, AP 530017"
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-600">
              {errors.address.message as string}
            </p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label required>Area / Locality</Label>
            <select
              {...register("location")}
              className={cn(inputClass, errors.location && "border-red-300")}
            >
              <option value="">Select</option>
              {VIZAG_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="mt-1 text-xs text-red-600">
                {errors.location.message as string}
              </p>
            )}
          </div>
          <div>
            <Label>City</Label>
            <input type="text" {...register("city")} className={inputClass} />
          </div>
          <div>
            <Label>State</Label>
            <input type="text" {...register("state")} className={inputClass} />
          </div>
          <div>
            <Label>Pincode</Label>
            <input
              type="text"
              {...register("pincode")}
              className={inputClass}
              placeholder="530017"
            />
          </div>
          <div>
            <Label>Latitude</Label>
            <input
              type="text"
              {...register("latitude")}
              className={inputClass}
              placeholder="17.7385"
            />
          </div>
          <div>
            <Label>Longitude</Label>
            <input
              type="text"
              {...register("longitude")}
              className={inputClass}
              placeholder="83.3350"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Google Maps link / embed</Label>
            <input
              type="text"
              className={inputClass}
              placeholder="https://maps.google.com/?q=17.7385,83.3350"
              onChange={(e) => {
                // Convenience: extract lat/lng from a pasted Google Maps link.
                const match = e.target.value.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
                if (match) {
                  const latInput = document.querySelector<HTMLInputElement>(
                    'input[name="latitude"]'
                  );
                  const lngInput = document.querySelector<HTMLInputElement>(
                    'input[name="longitude"]'
                  );
                  if (latInput) latInput.value = match[1];
                  if (lngInput) lngInput.value = match[2];
                }
              }}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Optional helper — pasting a map link fills the latitude and
              longitude fields above.
            </p>
          </div>
        </div>
      </Section>

      {/* Legal */}
      <Section title="Legal & Approvals">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>RERA ID</Label>
            <input
              type="text"
              {...register("reraId")}
              className={inputClass}
              placeholder="APRERA/REG/2024/001234"
            />
          </div>
          <div>
            <Label>Approval information</Label>
            <input
              type="text"
              {...register("approvalInfo")}
              className={inputClass}
              placeholder="e.g. DTCP approved, Bank loan approved"
            />
          </div>
        </div>
      </Section>

      {/* Amenities & Highlights */}
      <Section title="Amenities & Highlights">
        <div>
          <Label>Amenities (comma separated)</Label>
          <input
            type="text"
            {...register("amenities")}
            className={inputClass}
            placeholder="Swimming Pool, Gym, Clubhouse, 24x7 Security"
          />
        </div>
        <div>
          <Label>Highlights (comma separated)</Label>
          <input
            type="text"
            {...register("highlights")}
            className={inputClass}
            placeholder="Ready to move-in, RERA registered, Premium fittings"
          />
        </div>
      </Section>

      {/* Contact preference */}
      <Section title="Contact Preference">
        <div className="grid sm:grid-cols-3 gap-3">
          {(
            [
              { value: "both", label: "Call & WhatsApp" },
              { value: "call", label: "Phone call only" },
              { value: "whatsapp", label: "WhatsApp only" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50"
            >
              <input
                type="radio"
                value={option.value}
                {...register("contactPreference")}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-slate-700">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("isFeatured")}
            className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-slate-700">
            Mark as Featured
          </span>
        </label>
      </Section>

      {/* Images */}
      <Section title="Property Photos">
        <ImageUploader
          value={images}
          onChange={setImages}
          disabled={busy}
          hint="Upload at least one photo. Drag tiles to reorder, tap the star to set the cover photo."
        />
        {images.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            <ImageIcon className="h-7 w-7 mx-auto text-slate-400 mb-2" />
            No photos yet — add the first one to make your listing stand out.
          </div>
        )}
      </Section>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sticky bottom-0 bg-white py-4 border-t border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
        >
          Cancel
        </button>

        {!isAdmin && (
          <button
            type="button"
            disabled={busy}
            onClick={handleSubmit((data) =>
              onSubmit(data as Record<string, unknown>, "draft")
            )}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            {loading === "draft" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save as Draft
              </>
            )}
          </button>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading === "submit" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {isAdmin
                ? propertyId
                  ? "Update Property"
                  : "Create Property"
                : "Submit for Review"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 md:p-6 space-y-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}
