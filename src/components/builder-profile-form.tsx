"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { builderProfileSchema, type BuilderProfileInput } from "@/lib/validations";
import { Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BuilderProfileForm({
  initial,
}: {
  initial: Partial<BuilderProfileInput>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(builderProfileSchema),
    defaultValues: {
      name: initial.name ?? "",
      phone: initial.phone ?? "",
      description: initial.description ?? "",
      website: initial.website ?? "",
      address: initial.address ?? "",
      experienceYears: initial.experienceYears ?? 0,
      projectsCount: initial.projectsCount ?? 0,
    },
  });

  async function onSubmit(data: any) {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/builder/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update");
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl bg-white border border-slate-200 p-5 md:p-6 space-y-4 max-w-2xl"
    >
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
          <p className="text-sm text-green-700">Profile updated successfully</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Company Name *
        </label>
        <input
          type="text"
          {...register("name")}
          className={cn(inputClass, errors.name && "border-red-300")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Phone *
        </label>
        <input
          type="text"
          {...register("phone")}
          className={cn(inputClass, errors.phone && "border-red-300")}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Description
        </label>
        <textarea
          rows={4}
          {...register("description")}
          className={cn(inputClass, "resize-y")}
          placeholder="Tell us about your company..."
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Website
          </label>
          <input
            type="url"
            {...register("website")}
            className={inputClass}
            placeholder="https://example.com"
          />
          {errors.website && (
            <p className="mt-1 text-xs text-red-600">
              {errors.website.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Address
          </label>
          <input
            type="text"
            {...register("address")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Experience (years)
          </label>
          <input
            type="number"
            {...register("experienceYears")}
            className={inputClass}
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Projects Completed
          </label>
          <input
            type="number"
            {...register("projectsCount")}
            className={inputClass}
            min={0}
          />
        </div>
      </div>
      <div className="pt-2">
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
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
