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
  Quote,
  HelpCircle,
  Star,
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
import { ConsultationCta } from "@/components/consultation-cta";
import { VIZAG_LOCATIONS, SITE_CONFIG } from "@/lib/utils";

export const dynamic = "force-dynamic";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "IT Professional, MVP Colony",
    text: "Vizag Properties helped me find a perfect 3 BHK apartment at MVP Colony. The team was extremely professional and the entire process from site visit to registration was seamless. Highly recommended!",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  },
  {
    name: "Sneha Reddy",
    role: "Doctor, Rushikonda",
    text: "We were looking for a sea-facing villa and Vizag Properties showed us multiple options. Their local knowledge of Rushikonda and Bheemunipatnam was invaluable. Got a great deal!",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  {
    name: "Anil Sharma",
    role: "Business Owner, Gajuwaka",
    text: "Bought a commercial space for my business through Vizag Properties. The team understood my requirements perfectly and showed me RERA-compliant options within my budget.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
  },
  {
    name: "Lakshmi Prasad",
    role: "Retired Banker, Madhurawada",
    text: "I wanted a peaceful plot to build my retirement home. The team at Vizag Properties took me to DTCP-approved layouts in Madhurawada and Sabbavaram. Excellent service!",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop",
  },
  {
    name: "Vikram Singh",
    role: "NRI Investor",
    text: "As an NRI, I was worried about investing in Vizag from abroad. Vizag Properties handled everything - from selection to documentation. Trustworthy and transparent.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
  },
  {
    name: "Priya Naidu",
    role: "First-time Buyer",
    text: "As a first-time buyer, I had many questions. The team patiently explained everything about home loans, RERA, registration and helped me choose the right apartment.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
  },
];

const faqs = [
  {
    q: "Is Vizag Properties a real estate broker?",
    a: "No, we are a property discovery and consultation platform. We connect buyers with verified builders in Visakhapatnam and provide free consultation. We do not charge any commission from buyers.",
  },
  {
    q: "Are all properties on Vizag Properties verified?",
    a: "Yes. Every property listed on our platform is personally verified by our team. We check RERA registration, builder credentials, title documents and construction quality before listing.",
  },
  {
    q: "Is the property consultation really free?",
    a: "Absolutely! Our consultation is 100% free with no hidden charges. We help you shortlist properties, arrange site visits and assist with documentation at no cost.",
  },
  {
    q: "Which areas in Vizag do you cover?",
    a: "We cover all major areas in Visakhapatnam including MVP Colony, Madhurawada, Rushikonda, Gajuwaka, Dwaraka Nagar, Beach Road, Kommadi, Pendurthi, Sabbavaram, Yendada, Bheemunipatnam and more.",
  },
  {
    q: "How do I schedule a site visit?",
    a: "Just fill out the enquiry form on any property page or call us at +91 7702434892. Our team will arrange complimentary site visits at your convenience, including weekends.",
  },
  {
    q: "Can NRIs invest in Vizag properties?",
    a: "Yes, NRIs can invest in residential and commercial properties in India. We assist NRI clients with end-to-end documentation, power of attorney and remote purchase processes.",
  },
  {
    q: "Do you help with home loans?",
    a: "Yes, we partner with leading banks and NBFCs to help you get the best home loan rates. Our team assists with documentation, eligibility checks and loan approval.",
  },
  {
    q: "What is RERA and why is it important?",
    a: "RERA (Real Estate Regulatory Authority) is a government body that protects homebuyers. All properties listed on Vizag Properties are RERA-registered ensuring legal compliance and timely delivery.",
  },
];

const howItWorks = [
  {
    icon: Search,
    title: "Discover Properties",
    description:
      "Browse 500+ verified apartments, villas, plots and commercial properties across Vizag.",
  },
  {
    icon: CheckCircle2,
    title: "Shortlist & Compare",
    description:
      "Use our smart filters to shortlist properties by location, budget, type and amenities.",
  },
  {
    icon: Phone,
    title: "Free Consultation",
    description:
      "Talk to our local Vizag experts who understand every neighborhood and builder.",
  },
  {
    icon: Key,
    title: "Site Visit & Buy",
    description:
      "We arrange complimentary site visits and assist you through documentation to possession.",
  },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: "100% Verified Listings",
    description:
      "Every property is personally verified by our team. RERA registered, clear titles, no fraud.",
  },
  {
    icon: Users,
    title: "Local Vizag Experts",
    description:
      "Our team lives and works in Vizag. We know every locality, builder and upcoming project.",
  },
  {
    icon: Award,
    title: "Trusted Builders Only",
    description:
      "We partner only with reputed, RERA-registered builders with proven track record.",
  },
  {
    icon: TrendingUp,
    title: "Best Investment Deals",
    description:
      "Get access to pre-launch offers, builder-direct pricing and exclusive deals.",
  },
  {
    icon: Briefcase,
    title: "End-to-End Support",
    description:
      "From property search to home loan, registration to possession - we assist throughout.",
  },
  {
    icon: Sparkles,
    title: "Truly Free Service",
    description:
      "Our consultation and site visits are 100% free. No hidden charges, no commission from buyers.",
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
                Visakhapatnam's Most Trusted Property Platform
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
                Verified apartments, villas, plots &amp; commercial properties
                across Visakhapatnam from trusted builders.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Verified Listings
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Trusted Builders
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Free Consultation
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
              Popular Locations in Visakhapatnam
            </h2>
            <p className="mt-3 text-slate-600">
              Discover properties in the most sought-after neighborhoods of
              Vizag.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {VIZAG_LOCATIONS.slice(0, 18).map((loc) => (
              <Link
                key={loc}
                href={`/properties?location=${encodeURIComponent(loc)}`}
                className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 hover:bg-gradient-to-br hover:from-brand-50 hover:to-brand-100 border border-slate-200 hover:border-brand-200 transition-all text-center"
              >
                <div className="h-10 w-10 rounded-xl bg-white group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center text-brand-600 mb-2 transition-colors shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                  {loc}
                </div>
              </Link>
            ))}
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
              We make property buying in Visakhapatnam simple, transparent and
              trustworthy.
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

      {/* ────────── TESTIMONIALS ────────── */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              Customer Stories
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
              What Our Customers Say
            </h2>
            <p className="mt-3 text-slate-600">
              Real stories from real homebuyers who found their dream property
              with us.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-xl transition-shadow relative"
              >
                <Quote className="absolute top-5 right-5 h-8 w-8 text-brand-100" />
                <div className="flex items-center gap-1 text-gold-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-slate-700 text-sm leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 pt-5 border-t border-slate-100">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
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

      {/* ────────── CONSULTATION CTA ────────── */}
      <ConsultationCta />
    </>
  );
}
