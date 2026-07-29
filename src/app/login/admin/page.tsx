import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getSession } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login | Vizag Properties",
  description: "Admin login for Vizag Properties management dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "admin") {
    redirect("/dashboard/admin");
  }
  if (session?.role === "builder") {
    redirect("/dashboard/builder");
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center shadow-lg">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Admin Login
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Access the admin dashboard
            </p>
          </div>
          <div className="mt-6">
            <AdminLoginForm />
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">Demo credentials:</p>
            <p className="mt-1 text-xs font-mono text-slate-700">
              admin@vizag.properties / Admin@123
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          Are you a builder?{" "}
          <Link
            href="/login/builder"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Builder login
          </Link>
        </p>
      </div>
    </div>
  );
}
