import { Metadata } from "next";
import { redirect } from "next/navigation";
import { BuilderLoginForm } from "@/components/builder-login-form";
import { getCurrentAccount, getSession } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/utils";
import Link from "next/link";
import { Home, ArrowLeft, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Seller Login | Vizag Properties",
  description: "Sign in to your Vizag Properties seller account with your email and password to manage listings and enquiries.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BuilderLoginPage() {
  const session = await getSession();
  if (session?.role === "admin") {
    redirect("/dashboard/admin");
  }
  if (session?.role === "builder") {
    // Only redirect when the account exists and is still active, otherwise a
    // deactivated seller would bounce between /login and the dashboard.
    const account = await getCurrentAccount();
    if (account) redirect("/dashboard/seller");
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
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center shadow-lg">
              <Building2 className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Seller Login
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Sign in to your builder, owner or agent dashboard with your email
            </p>
          </div>
          <div className="mt-6">
            <BuilderLoginForm />
          </div>
          <p className="mt-6 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
            Sign in with the email and password associated with your account.
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{" "}
          <Link
            href="/list-your-property"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            List your property
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-600">
          Are you an admin?{" "}
          <Link
            href="/login/admin"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
}
