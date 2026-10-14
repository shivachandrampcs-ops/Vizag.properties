import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Key,
  Briefcase,
  HelpCircle,
  Phone,
  MessageCircle,
  Home,
  Building2,
  Sparkles,
  CheckCircle,
  MapPin,
  Search,
} from "lucide-react";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getFeaturedProperties, getLatestProperties } from "@/lib/queries";
import { PropertyCard } from "@/components/property-card";
import { PropertySearchBar } from "@/components/property-search-bar";
import { VIZAG_LOCATIONS, SITE_CONFIG } from "@/lib/utils";

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "What does Vizag Properties provide?",
    a: "The website provides property search, seller listing and enquiry features for Visakhapatnam and nearby areas. Any brokerage role, fees or additional service will be stated in a separate written agreement where applicable; please confirm before proceeding.",
  },
  {
    q: "Are property listings independently verified?",
    a: "No. Listing details are supplied by account holders and may be reviewed for platform rules. That review is not a title search, RERA certification, inspection or guarantee. Check all details independently with the seller and qualified professionals.",
  },
  {
    q: "How do I request help or a site visit?",
    a: "Submit an enquiry on a property page or contact us by phone or WhatsApp. A site visit or other assistance can be discussed and arranged by request; confirm any terms or charges in advance.",
  },
  {
    q: "Which areas can I search?",
    a: "The locality search includes Visakhapatnam and nearby Greater Vizag settlements. The search vocabulary is not a municipal-boundary directory, and listings may not be available in every area.",
  },
  {
    q: "Can non-resident Indians buy property in India?",
    a: "Eligibility and restrictions depend on the buyer's status and property type. Please obtain current advice from a qualified Indian lawyer and tax adviser; this website does not provide legal or tax advice.",
  },
  {
    q: "Does the site arrange home loans?",
    a: "The website does not process loan applications or guarantee financing. Contact a bank or regulated lender directly to discuss eligibility, rates and terms.",
  },
  {
    q: "Does RERA apply to every property?",
    a: "RERA registration requirements depend on the project and applicable law. Check the relevant official Andhra Pradesh RERA records and obtain professional advice; a listing on this site is not proof of registration.",
  },
];

const howItWorks = [
  {
    icon: Search,
    title: "Search Listings",
    description:
      "Browse current seller-submitted apartments, villas, plots and other property listings.",
  },
  {
    icon: CheckCircle2,
    title: "Filter & Compare",
    description:
      "Filter by locality, budget, property type and recorded area unit.",
  },
  {
    icon: Phone,
    title: "Send an Enquiry",
    description:
      "Use an Indian mobile number to send an enquiry; email is optional.",
  },
  {
    icon: Key,
    title: "Check Before You Act",
    description:
      "Confirm seller authority, property records, approvals, price and area independently.",
  },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: "Seller-Submitted Listings",
    description:
      "Listings are provided by account holders. Any platform review is not independent property verification.",
  },
  {
    icon: Users,
    title: "Search by Locality",
    description:
      "Use locality suggestions covering Visakhapatnam and nearby Greater Vizag settlements.",
  },
  {
    icon: Award,
    title: "Three Seller Account Types",
    description:
      "Builders, property owners and agents can submit listings through their accounts.",
  },
  {
    icon: TrendingUp,
    title: "Multiple Property Categories",
    description:
      "Explore apartments, villas, plots, independent houses, commercial spaces and penthouses.",
  },
  {
    icon: Briefcase,
    title: "Buyer Due Diligence",
    description:
      "The site encourages visitors to check title, approvals, RERA applicability, seller authority and measurements independently.",
  },
  {
    icon: Sparkles,
    title: "Contact Options",
    description:
      "Send an enquiry through the site or contact the operator using the published phone and WhatsApp details.",
  },
];

export default async function HomePage() {
  // Quick DB health check
  try {
    await db.execute(sql`select 1`);
  } catch (e) {
    // Database is being initialized, ignore
  }

  const [featured, latest] = await Promise.all([
    getFeaturedProperties(6),
    getLatestProperties(6),
  ]);

  // Build JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/properties?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const propertyListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Properties in Visakhapatnam",
    itemListElement: featured.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_CONFIG.url}/properties/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyListJsonLd) }}
      />

      {/* ────────── HERO ────────── */}
      <section className="hero-gradient text-white">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-16 md:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                Property listings &amp; enquiries for Visakhapatnam
              </div>
              <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                Find Your Dream
                <br />
                Property in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                  Vizag
                </span>
              </h1>
              <p className="mt-5 text-lg md:text-xl text-slate-200 max-w-2xl">
                Search seller-submitted apartments, villas, plots and
                commercial listings across Visakhapatnam. Confirm property,
                title and approval details independently before proceeding.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Searchable locality suggestions
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Three seller account types
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Mobile enquiry forms
                </span>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${SITE_CONFIG.phoneRaw}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-700 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg"
                >
                  <Phone className="h-4 w-4" />
                  Call {SITE_CONFIG.phone}
                </a>
                <a
                  href={SITE_CONFIG.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors shadow-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold-500/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-300/30 blur-3xl" />
                <div className="relative grid grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-white/10 border border-white/20">
                      <Image
                        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=800&fit=crop"
                        alt="Modern apartments in Visakhapatnam"
                        width={300}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden aspect-square bg-white/10 border border-white/20">
                      <Image
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=400&fit=crop"
                        alt="Luxury villa in Vizag"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 pt-8">
                    <div className="rounded-2xl overflow-hidden aspect-square bg-white/10 border border-white/20">
                      <Image
                        src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=400&fit=crop"
                        alt="Independent house in Vizag"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-white/10 border border-white/20">
                      <Image
                        src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&h=800&fit=crop"
                        alt="Beachfront villa in Vizag"
                        width={300}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── SEARCH BAR ────────── */}
      <section className="relative -mt-12 z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <PropertySearchBar variant="hero" />
        </div>
      </section>

      {/* ────────── FEATURED PROPERTIES ────────── */}
      {featured.length > 0 && (
        <section className="py-16 md:py-24 section-gradient">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
                  Featured Listings
                </div>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
                  Handpicked Properties in Vizag
                </h2>
                <p className="mt-2 text-slate-600 max-w-2xl">
                  Explore our curated selection of premium apartments, villas,
                  plots and commercial properties.
                </p>
              </div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View All Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p, i) => (
                <PropertyCard key={p.id} property={p} priority={i < 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ────────── POPULAR LOCATIONS ────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              Explore Vizag
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
              Browse Localities in Visakhapatnam
            </h2>
            <p className="mt-3 text-slate-600">
              Search listings by locality across Visakhapatnam and nearby
              Greater Vizag areas.
            </p>
          </div>
          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2.5">
            {VIZAG_LOCATIONS.map((loc) => (
              <Link
                key={loc}
                href={`/properties?location=${encodeURIComponent(loc)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                <MapPin className="h-3.5 w-3.5 text-brand-500" />
                {loc}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Browse all property listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ────────── WHY CHOOSE US ────────── */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              Why Vizag Properties
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
              Why Choose Us
            </h2>
            <p className="mt-3 text-slate-600">
              Search seller-submitted listings and send enquiries; confirm
              property and legal details independently.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-xl transition-all"
                >
                  <div className="h-12 w-12 rounded-xl bg-brand-50 group-hover:bg-brand-600 text-brand-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── HOW IT WORKS ────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              Simple Process
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
              How It Works
            </h2>
            <p className="mt-3 text-slate-600">
              From discovery to possession, we guide you at every step.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-brand-200 to-brand-100" />
                  )}
                  <div className="relative text-center p-6 rounded-2xl bg-white border border-slate-200">
                    <div className="relative mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center shadow-lg">
                      <Icon className="h-7 w-7" />
                      <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gold-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── BUYER CHECKS ────────── */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              Important Before You Proceed
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
              Check Every Property Independently
            </h2>
            <p className="mt-3 text-slate-600">
              Listing review and seller-account status do not verify a property,
              its title or its approvals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                title: "Confirm seller authority",
                text: "Check the seller's identity, ownership or authority to market the property.",
              },
              {
                icon: Shield,
                title: "Check records and approvals",
                text: "Review title, encumbrances, approvals and RERA registration where applicable with qualified professionals.",
              },
              {
                icon: MapPin,
                title: "Inspect area and condition",
                text: "Visit the property and confirm price, measurements, area units and condition from source documents.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <Icon className="h-6 w-6 text-brand-600" />
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── LATEST PROPERTIES ────────── */}
      {latest.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
                  New on Vizag Properties
                </div>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
                  Latest Properties
                </h2>
              </div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest.slice(0, 6).map((p, i) => (
                <PropertyCard key={p.id} property={p} priority={i < 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ────────── LIST YOUR PROPERTY CTA ────────── */}
      <section className="py-14 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-8 md:p-12">
            <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-gold-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  For owners, builders &amp; agents
                </div>
                <h2 className="mt-4 text-2xl md:text-4xl font-bold text-white">
                  Sell or rent your property faster in Vizag
                </h2>
                <p className="mt-3 text-slate-200 max-w-xl">
                  Register as a builder, property owner or agent and submit
                  listing information and photos. Listings may be reviewed for
                  platform rules; this does not verify property details, title or
                  approvals.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/list-your-property"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold"
                  >
                    List Your Property
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10"
                  >
                    Already registered? Log in
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { label: "Builders", icon: Building2 },
                    { label: "Owners", icon: Home },
                    { label: "Agents", icon: Key },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href="/list-your-property"
                      className="rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 p-4 text-center transition-colors"
                    >
                      <Icon className="h-6 w-6 text-gold-400 mx-auto" />
                      <div className="mt-2 text-sm font-semibold text-white">
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── FAQ ────────── */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              Got Questions?
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-slate-600">
              Everything you need to know about buying property in Vizag.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-white border border-slate-200 overflow-hidden [&[open]]:border-brand-300 [&[open]]:shadow-md"
              >
                <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-brand-50 group-open:bg-brand-600 text-brand-600 group-open:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {f.q}
                    </h3>
                  </div>
                  <div className="h-6 w-6 rounded-full border border-slate-300 flex items-center justify-center group-open:rotate-45 transition-transform">
                    <span className="text-xl leading-none">+</span>
                  </div>
                </summary>
                <div className="px-5 pb-5 pl-[68px] text-slate-600 text-sm leading-relaxed">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
