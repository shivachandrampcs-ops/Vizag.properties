"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Loader2, AlertCircle, LogIn } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

export function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: "admin" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Invalid credentials");
      }
      router.push("/dashboard/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="admin-email"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={cn(
              "w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500",
              errors.email ? "border-red-300" : "border-slate-300"
            )}
            placeholder="admin@example.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className={cn(
              "w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500",
              errors.password ? "border-red-300" : "border-slate-300"
            )}
            placeholder="••••••••"
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Sign In
          </>
        )}
      </button>
    </form>
  );
}
