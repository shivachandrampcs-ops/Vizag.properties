"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellerProfileSchema } from "@/lib/validations";
import type { z } from "zod";
import { cn, VIZAG_LOCATIONS } from "@/lib/utils";
import { AlertCircle, Loader2, Save } from "lucide-react";

export type SellerProfileInitial = {
  name: string;
  email: string;
  phone: string;
  companyName?: string | null;
  whatsappNumber?: string | null;
  locality?: string | null;
  city?: string | null;
  description?: string | null;
  website?: string | null;
  address?: string | null;
  experienceYears?: number | null;
  projectsCount?: number | null;
};

/**
 * One profile form for every account type. Only the label of the
 * "Company / Business Name" field changes between builder / owner / agent.
 */
export function SellerProfileForm({
  initial,
  publisherType,
  isVerified,
}: {
  initial: SellerProfileInitial;
  publisherType?: string;
  isVerified?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof sellerProfileSchema>,
    unknown,
    z.output<typeof sellerProfileSchema>
  >({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: {
      name: initial.name,
      email: initial.email,
      phone: initial.phone,
      companyName: initial.companyName ?? "",
      whatsappNumber: initial.whatsappNumber ?? "",
      locality: initial.locality ?? "",
      city: initial.city ?? "Visakhapatnam",
      description: initial.description ?? "",
      website: initial.website ?? "",
      address: initial.address ?? "",
      experienceYears: initial.experienceYears ?? 0,
      projectsCount: initial.projectsCount ?? 0,
    },
  });

  async function onSubmit(data: z.output<typeof sellerProfileSchema>) {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/seller/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not save your profile");
      }
      setSuccess(true);
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl bg-white border border-slate-200 p-5 md:p-6 space-y-5"
    >
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-700 font-medium">
            Profile updated successfully.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label required>Full Name</Label>
          <input
            type="text"
            {...register("name")}
            className={cn(inputClass, errors.name && "border-red-300")}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">
              {errors.name.message as string}
            </p>
          )}
        </div>
        <div>
          <Label>
            {publisherType === "owner"
              ? "Company (optional)"
              : "Company / Business Name"}
          </Label>
          <input
            type="text"
            {...register("companyName")}
            className={inputClass}
            placeholder={
              publisherType === "agent"
                ? "Agency name"
                : publisherType === "builder"
                ? "Builder / developer name"
                : "Optional"
            }
          />
        </div>
        <div>
          <Label required>Email</Label>
          <input
            type="email"
            {...register("email")}
            className={cn(inputClass, errors.email && "border-red-300")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">
              {errors.email.message as string}
            </p>
          )}
        </div>
        <div>
          <Label required>Mobile Number</Label>
          <input
            type="tel"
            {...register("phone")}
            className={cn(inputClass, errors.phone && "border-red-300")}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">
              {errors.phone.message as string}
            </p>
          )}
        </div>
        <div>
          <Label>WhatsApp Number</Label>
          <input
            type="tel"
            {...register("whatsappNumber")}
            className={inputClass}
            placeholder="Defaults to your mobile number"
          />
        </div>
        <div>
          <Label>Locality</Label>
          <select {...register("locality")} className={inputClass}>
            <option value="">Select locality</option>
            {VIZAG_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>City</Label>
          <input type="text" {...register("city")} className={inputClass} />
        </div>
        <div>
          <Label>Website</Label>
          <input
            type="url"
            {...register("website")}
            className={cn(inputClass, errors.website && "border-red-300")}
            placeholder="https://"
          />
          {errors.website && (
            <p className="mt-1 text-xs text-red-600">
              {errors.website.message as string}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label>Address</Label>
        <input type="text" {...register("address")} className={inputClass} />
      </div>

      <div>
        <Label>About you / your business</Label>
        <textarea
          rows={4}
          {...register("description")}
          className={cn(inputClass, "resize-y")}
          placeholder="Tell buyers about your projects, experience and service..."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Years of experience</Label>
          <input
            type="number"
            min={0}
            {...register("experienceYears")}
            className={inputClass}
          />
        </div>
        <div>
          <Label>Projects / listings delivered</Label>
          <input
            type="number"
            min={0}
            {...register("projectsCount")}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          {isVerified
            ? "Your account is verified by the Vizag Properties team."
            : "Verification is done by our admin team after reviewing your documents."}
        </p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold disabled:opacity-60 w-full sm:w-auto justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Profile
            </>
          )}
        </button>
      </div>
    </form>
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
