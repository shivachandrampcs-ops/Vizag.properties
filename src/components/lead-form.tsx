"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadInput } from "@/lib/validations";
import { Send, Loader2, CheckCircle2, AlertCircle, MessageCircle, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VIZAG_LOCATIONS, SITE_CONFIG, formatPrice, titleCase } from "@/lib/utils";
import { cn } from "@/lib/utils";

type PropertyPrefill = {
  id: number;
  title: string;
  location: string;
  price: number;
  propertyType: string;
};

export function LeadForm({
  property,
  source = "website",
  variant = "default",
}: {
  property?: PropertyPrefill;
  source?: string;
  variant?: "default" | "compact";
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      source,
      propertyId: property?.id as any,
      propertyType: property?.propertyType ?? "",
      preferredLocation: property?.location ?? "",
    },
  });

  async function onSubmit(data: any) {
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit enquiry");
      }
      setStatus("success");
      reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden",
        variant === "compact" ? "p-5" : "p-6 md:p-8"
      )}
    >
      {property && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200">
          <div className="text-xs uppercase tracking-wider text-brand-700 font-semibold">
            Enquiring about
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900 line-clamp-1">
            {property.title}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-slate-600">
            <span>📍 {property.location}</span>
            <span>•</span>
            <span className="font-semibold text-brand-700">
              {formatPrice(property.price)}
            </span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl bg-green-50 border border-green-200 p-6 text-center"
          >
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-green-900">
              Enquiry Submitted Successfully!
            </h3>
            <p className="mt-1 text-sm text-green-700">
              Our property expert will contact you within 1 hour.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-green-700 text-sm font-semibold border border-green-200 hover:bg-green-50"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
              <a
                href={SITE_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register("name")}
                  className={cn(
                    "w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors",
                    errors.name ? "border-red-300" : "border-slate-300"
                  )}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  {...register("phone")}
                  className={cn(
                    "w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors",
                    errors.phone ? "border-red-300" : "border-slate-300"
                  )}
                  placeholder="+91 9876543210"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={cn(
                  "w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors",
                  errors.email ? "border-red-300" : "border-slate-300"
                )}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Budget
                </label>
                <select
                  id="budget"
                  {...register("budget")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                >
                  <option value="">Select budget</option>
                  <option value="Below ₹ 30 L">Below ₹ 30 L</option>
                  <option value="₹ 30 L - 50 L">₹ 30 L - 50 L</option>
                  <option value="₹ 50 L - 80 L">₹ 50 L - 80 L</option>
                  <option value="₹ 80 L - 1 Cr">₹ 80 L - 1 Cr</option>
                  <option value="₹ 1 Cr - 2 Cr">₹ 1 Cr - 2 Cr</option>
                  <option value="₹ 2 Cr - 5 Cr">₹ 2 Cr - 5 Cr</option>
                  <option value="Above ₹ 5 Cr">Above ₹ 5 Cr</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="preferredLocation"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Preferred Location
                </label>
                <select
                  id="preferredLocation"
                  {...register("preferredLocation")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                >
                  <option value="">Select location</option>
                  {VIZAG_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={3}
                {...register("message")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
                placeholder="Tell us more about your requirements..."
              />
            </div>

            {status === "error" && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Enquiry
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center">
              🔒 Your information is secure. We never spam.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
