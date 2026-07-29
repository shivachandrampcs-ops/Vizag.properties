"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, type PropertyInput } from "@/lib/validations";
import { VIZAG_LOCATIONS, cn } from "@/lib/utils";
import {
  Save,
  Loader2,
  AlertCircle,
  Plus,
  X as XIcon,
  Image as ImageIcon,
} from "lucide-react";

type PropertyImage = {
  id?: number;
  imageUrl: string;
  altText?: string | null;
  isCover?: boolean;
  sortOrder?: number;
};

export function PropertyForm({
  initial,
  propertyId,
  existingImages = [],
}: {
  initial?: Partial<PropertyInput>;
  propertyId?: number;
  existingImages?: PropertyImage[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [images, setImages] = useState<PropertyImage[]>(existingImages);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      propertyType: (initial?.propertyType as any) ?? "apartment",
      status: (initial?.status as any) ?? "ready_to_move",
      furnishing: (initial?.furnishing as any) ?? "unfurnished",
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
      isFeatured: initial?.isFeatured ?? false,
      amenities: initial?.amenities ?? "",
      highlights: initial?.highlights ?? "",
    } as any,
  });

  function addImage() {
    const url = imageInput.trim();
    if (!url) return;
    setImages((prev) => [
      ...prev,
      { imageUrl: url, isCover: prev.length === 0, sortOrder: prev.length },
    ]);
    setImageInput("");
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && prev[idx].isCover) {
        next[0].isCover = true;
      }
      return next;
    });
  }

  function setCover(idx: number) {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isCover: i === idx }))
    );
  }

  async function onSubmit(data: any) {
    if (images.length === 0) {
      setError("Please add at least one image");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...data,
        amenities: data.amenities
          ? (data.amenities as string)
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        highlights: data.highlights
          ? (data.highlights as string)
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        images: images.map((img, i) => ({
          imageUrl: img.imageUrl,
          altText: data.title,
          isCover: img.isCover ?? i === 0,
          sortOrder: i,
        })),
      };
      const url = propertyId
        ? `/api/builder/properties/${propertyId}`
        : "/api/builder/properties";
      const method = propertyId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save");
      }
      router.push("/dashboard/builder/properties");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Basic info */}
      <Section title="Basic Information">
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
            <Label required>Status</Label>
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
            <input
              type="text"
              {...register("city")}
              className={inputClass}
            />
          </div>
          <div>
            <Label>State</Label>
            <input
              type="text"
              {...register("state")}
              className={inputClass}
            />
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
          <div>
            <Label>RERA ID</Label>
            <input
              type="text"
              {...register("reraId")}
              className={inputClass}
              placeholder="APRERA/REG/2024/001234"
            />
          </div>
          <div className="flex items-end">
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

      {/* Images */}
      <Section title="Property Images">
        <div>
          <Label>Add Image URL</Label>
          <div className="flex gap-2">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
              className={inputClass}
              placeholder="https://example.com/image.jpg"
            />
            <button
              type="button"
              onClick={addImage}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Add image URLs (you can use Unsplash, your CDN, etc.). The first
            image will be the cover by default.
          </p>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-slate-200 group"
              >
                <img
                  src={img.imageUrl}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setCover(i)}
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      img.isCover
                        ? "bg-gold-500 text-white"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    {img.isCover ? "✓ Cover" : "Set Cover"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-1.5 rounded bg-red-500 text-white"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                {img.isCover && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-gold-500 text-white text-[10px] font-bold">
                    COVER
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            <ImageIcon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            No images added yet. Add image URLs above.
          </div>
        )}
      </Section>

      <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-white py-4 border-t border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {propertyId ? "Update Property" : "Create Property"}
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
