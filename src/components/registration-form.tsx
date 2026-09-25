"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/lib/validations";
import { cn, VIZAG_LOCATIONS } from "@/lib/utils";
import {
  AlertCircle,
  Loader2,
  UserRound,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { PUBLISHER_TYPES, PUBLISHER_TYPE_LABEL } from "@/lib/publishers";

export function RegistrationForm({
  defaultAccountType = "owner",
}: {
  defaultAccountType?: RegistrationInput["accountType"];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [accountType, setAccountType] =
    useState<RegistrationInput["accountType"]>(defaultAccountType);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      accountType: defaultAccountType,
      fullName: "",
      companyName: "",
      email: "",
      mobile: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
      city: "Visakhapatnam",
      locality: "",
      address: "",
    },
  });

  async function onSubmit(data: RegistrationInput) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not create your account");
      }
      router.push("/dashboard/seller");
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Account type */}
      <div>
        <Label required>I am a</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PUBLISHER_TYPES.map((type) => {
            const active = accountType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setAccountType(type);
                  setValue("accountType", type, { shouldValidate: true });
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-colors",
                  active
                    ? "border-brand-600 bg-brand-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                {type === "builder" ? (
                  <Building2
                    className={cn(
                      "h-5 w-5",
                      active ? "text-brand-600" : "text-slate-400"
                    )}
                  />
                ) : (
                  <UserRound
                    className={cn(
                      "h-5 w-5",
                      active ? "text-brand-600" : "text-slate-400"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-sm font-semibold",
                    active ? "text-brand-700" : "text-slate-700"
                  )}
                >
                  {PUBLISHER_TYPE_LABEL[type]}
                </span>
              </button>
            );
          })}
        </div>
        {errors.accountType && (
          <p className="mt-1 text-xs text-red-600">
            {errors.accountType.message as string}
          </p>
        )}
      </div>

      {/* Name + company */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label required>Full Name</Label>
          <input
            type="text"
            autoComplete="name"
            {...register("fullName")}
            className={cn(inputClass, errors.fullName && "border-red-300")}
            placeholder="Ravi Kumar"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.fullName.message as string}
            </p>
          )}
        </div>
        <div>
          <Label>
            {accountType === "owner" ? "Company (optional)" : "Company / Business Name"}
          </Label>
          <input
            type="text"
            autoComplete="organization"
            {...register("companyName")}
            className={cn(inputClass, errors.companyName && "border-red-300")}
            placeholder={
              accountType === "builder"
                ? "Sravanthi Constructions"
                : accountType === "agent"
                ? "Vizag Realty"
                : "Optional"
            }
          />
          {errors.companyName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.companyName.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label required>Email</Label>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className={cn(inputClass, errors.email && "border-red-300")}
            placeholder="you@example.com"
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
            inputMode="tel"
            autoComplete="tel"
            {...register("mobile")}
            className={cn(inputClass, errors.mobile && "border-red-300")}
            placeholder="+91 98765 43210"
          />
          {errors.mobile && (
            <p className="mt-1 text-xs text-red-600">
              {errors.mobile.message as string}
            </p>
          )}
        </div>
        <div>
          <Label>WhatsApp Number</Label>
          <input
            type="tel"
            inputMode="tel"
            {...register("whatsapp")}
            className={inputClass}
            placeholder="Same as mobile if empty"
          />
          {errors.whatsapp && (
            <p className="mt-1 text-xs text-red-600">
              {errors.whatsapp.message as string}
            </p>
          )}
        </div>
        <div>
          <Label>Locality</Label>
          <select {...register("locality")} className={inputClass}>
            <option value="">Select locality (optional)</option>
            {VIZAG_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Address */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>City</Label>
          <input type="text" {...register("city")} className={inputClass} />
        </div>
        <div>
          <Label>Address</Label>
          <input
            type="text"
            autoComplete="street-address"
            {...register("address")}
            className={inputClass}
            placeholder="Door no, street, area"
          />
        </div>
      </div>

      {/* Password */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label required>Password</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className={cn(
                inputClass,
                "pl-10 pr-10",
                errors.password && "border-red-300"
              )}
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message as string}
            </p>
          )}
        </div>
        <div>
          <Label required>Confirm Password</Label>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={cn(inputClass, errors.confirmPassword && "border-red-300")}
            placeholder="Re-enter your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">
              {errors.confirmPassword.message as string}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating your account...
          </>
        ) : (
          "Create Account & Continue"
        )}
      </button>

      <p className="text-xs text-slate-500 text-center">
        By creating an account you agree that submitted properties will be
        reviewed by the Vizag Properties team before going live.
      </p>
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
