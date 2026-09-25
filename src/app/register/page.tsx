import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, Home as HomeIcon, KeyRound } from "lucide-react";
import { RegistrationForm } from "@/components/registration-form";
import { getSellerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PUBLISHER_TYPE_LABEL, isPublisherType } from "@/lib/publishers";
import { SITE_CONFIG, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register | List Your Property in Vizag",
  description:
    "Create a free Vizag Properties account as a builder, property owner or real estate agent and start listing properties in Visakhapatnam.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_CONFIG.url}/register` },
};

const ICONS = {
  builder: Building2,
  owner: HomeIcon,
  agent: KeyRound,
} as const;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const type = isPublisherType(sp.type) ? sp.type : "owner";

  const session = await getSellerSession();
  if (session) redirect("/dashboard/seller");

  const Icon = ICONS[type];

  return (
    <div className="min-h-[calc(100vh-200px)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/list-your-property"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-600 mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white p-6 md:p-8">
            <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Icon className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl md:text-3xl font-bold">
              Create your {PUBLISHER_TYPE_LABEL[type]} account
            </h1>
            <p className="mt-1 text-sm text-brand-100">
              List your property in Visakhapatnam and receive enquiries from
              genuine buyers.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["builder", "owner", "agent"] as const).map((t) => (
                <Link
                  key={t}
                  href={`/register?type=${t}`}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border",
                    t === type
                      ? "bg-white text-brand-700 border-white"
                      : "border-white/40 text-white hover:bg-white/10"
                  )}
                >
                  {PUBLISHER_TYPE_LABEL[t]}
                </Link>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <RegistrationForm defaultAccountType={type} />

            <p className="mt-6 text-center text-sm text-slate-600">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
