import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Home as HomeIcon,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Phone,
  MessageCircle,
} from "lucide-react";
import { SITE_CONFIG, cn } from "@/lib/utils";
import {
  PUBLISHER_TYPE_DESCRIPTION,
  PUBLISHER_TYPE_LABEL,
  PUBLISHER_TYPES,
} from "@/lib/publishers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "List Your Property in Vizag | Free for Owners, Builders & Agents",
  description:
    "List your apartment, villa, plot, independent house or commercial property in Visakhapatnam. Free registration for builders, property owners and real estate agents. Verified by the Vizag Properties team before publishing.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/list-your-property`,
  },
  openGraph: {
    title: "List Your Property in Vizag | Vizag Properties",
    description:
      "Register as a builder, property owner or agent and list your property in Visakhapatnam. Every listing is reviewed by our team.",
    url: `${SITE_CONFIG.url}/list-your-property`,
    type: "website",
  },
};

const ACCOUNT_ICONS = {
  builder: Building2,
  owner: HomeIcon,
  agent: KeyRound,
} as const;

const STEPS = [
  {
    title: "Create your free account",
    body: "Tell us who you are — builder, property owner or agent. It takes less than a minute.",
  },
  {
    title: "Add your property",
    body: "Fill in the details and upload photos straight from your phone or computer.",
  },
  {
    title: "Submit for review",
    body: "Our team checks the listing, RERA details and photos, then publishes it.",
  },
  {
    title: "Start receiving enquiries",
    body: "Buyer enquiries land in your dashboard so you can respond instantly.",
  },
];

const REQUIREMENTS = [
  "Clear photos of the actual property",
  "Correct price, area and location details",
  "RERA ID for projects that require registration",
  "Genuine contact number for buyer enquiries",
];

export default function ListYourPropertyPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient text-white">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs text-slate-200 mb-4">
            <Link href="/" className="hover:text-gold-400">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">List Your Property</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            List Your Property in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
              Vizag
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-200 max-w-2xl">
            Reach genuine buyers across Visakhapatnam. Register as a builder,
            property owner or real estate agent, add your property with photos
            and submit it for review — our team verifies every listing before it
            goes live.
          </p>

          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-bold">I am a</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {PUBLISHER_TYPES.map((type) => {
                const Icon = ACCOUNT_ICONS[type];
                return (
                  <Link
                    key={type}
                    href={`/register?type=${type}`}
                    className="group rounded-2xl bg-white/10 hover:bg-white border border-white/20 hover:border-white p-5 transition-all"
                  >
                    <div className="h-11 w-11 rounded-xl bg-gold-500 text-white flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-3 text-lg font-bold text-white group-hover:text-brand-700">
                      {PUBLISHER_TYPE_LABEL[type]}
                    </div>
                    <p className="mt-1 text-sm text-slate-200 group-hover:text-slate-600">
                      {PUBLISHER_TYPE_DESCRIPTION[type]}
                    </p>
                    <div className="mt-3 text-sm font-semibold text-gold-400 group-hover:text-brand-600 flex items-center gap-1">
                      Register &amp; list
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-200">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-gold-400 hover:text-gold-500 underline"
            >
              Log in here
            </Link>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
            How it works
          </div>
          <h2 className="mt-2 text-2xl md:text-4xl font-bold text-slate-900">
            From sign-up to live listing in four steps
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 p-5 bg-white hover:shadow-md transition-shadow"
              >
                <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="mt-3 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements + review promise */}
      <section className="py-14 md:py-20 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 md:p-8">
            <div className="flex items-center gap-2 text-brand-600">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                What we check
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Keep these ready for a fast approval
            </h2>
            <ul className="mt-4 space-y-2">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-2">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Every listing is reviewed by the Vizag Properties team before it
                appears on the website. Drafts, pending and rejected listings are
                never shown publicly.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Prefer to talk to someone first?
              </h2>
              <p className="mt-2 text-brand-100">
                Our local team will help you create the listing and click photos
                if needed.
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white text-brand-700 text-sm font-semibold hover:bg-slate-100"
              >
                <Phone className="h-4 w-4" />
                Call {SITE_CONFIG.phone}
              </a>
              <a
                href={SITE_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Ready to list your property?
          </h2>
          <p className="mt-2 text-slate-600">
            Pick your account type and create your free listing today.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            {PUBLISHER_TYPES.map((type, i) => (
              <Link
                key={type}
                href={`/register?type=${type}`}
                className={cn(
                  "px-5 py-3 rounded-xl text-sm font-semibold",
                  i === 0
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                )}
              >
                Continue as {PUBLISHER_TYPE_LABEL[type]}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
