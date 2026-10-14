import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Target,
  Eye,
  Heart,
  Award,
  Users,
  Shield,
  MapPin,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Building2,
  Home,
  Key,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Vizag Properties | Property Listings in Visakhapatnam",
  description:
    "Learn about Vizag Properties, an online property listing and enquiry service for Visakhapatnam and nearby areas.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
};

const stats = [
  { value: "3", label: "Seller account roles" },
  { value: "6", label: "Property categories" },
  { value: "112", label: "Locality search suggestions" },
  { value: "2", label: "Area units supported" },
];

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "Listings are supplied by account holders and may be reviewed for platform rules. Review is not title, RERA or construction verification.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description:
      "Use the search and enquiry features to explore listings and contact the operator about your requirements.",
  },
  {
    icon: Award,
    title: "Independent Checks",
    description:
      "Builders, property owners and agents can submit listings. Buyers should independently confirm seller claims and applicable registrations.",
  },
  {
    icon: Sparkles,
    title: "Search Tools",
    description:
      "Use search, filters and locality suggestions to browse the listings currently available on the site.",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Vizag Properties",
    description:
      "Learn about Vizag Properties, an online property listing and enquiry service for Visakhapatnam.",
    url: `${SITE_CONFIG.url}/about`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative hero-gradient text-white py-16 md:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-300 mb-4">
            <Link href="/" className="hover:text-gold-400">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">About</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium">
              <Heart className="h-3.5 w-3.5 text-gold-400" />
              About Vizag Properties
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Property Listings
              <br />
              &amp; Enquiries in Vizag
            </h1>
            <p className="mt-5 text-lg md:text-xl text-slate-200">
              Browse seller-submitted listings and send property enquiries
              for Visakhapatnam and nearby areas.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 md:py-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-700">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
                Who We Are
              </div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
                Property Listings &amp; Enquiries for Vizag
              </h2>
              <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
                <p>
                  <strong className="text-slate-900">Vizag Properties</strong>{" "}
                  is an online property listing and enquiry service for
                  Visakhapatnam and nearby areas. The site lets visitors search
                  listings and lets builders, owners and agents submit
                  properties for publication.
                </p>
                <p>
                  Listings may be submitted by builders, property owners and
                  agents. Search categories include{" "}
                  <strong>apartments, villas, plots and commercial properties</strong>{" "}
                  in localities such as MVP Colony, Madhurawada, Rushikonda,
                  Gajuwaka, Beach Road, Dwaraka Nagar, Kommadi and Pendurthi.
                  Listing details are supplied by the account holder and should
                  be independently checked.
                </p>
                <p>
                  Visitors can send enquiries through the site and may contact
                  us to discuss next steps. Buyers should arrange their own
                  inspections and obtain independent legal, financial and
                  property advice before proceeding.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 h-40 w-40 rounded-full bg-brand-100 blur-3xl opacity-50" />
              <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-gold-500/20 blur-3xl" />
              <div className="relative grid grid-cols-2 gap-3">
                <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                  <Image
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=800&fit=crop"
                    alt="Business meeting"
                    width={300}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[3/4] mt-8">
                  <Image
                    src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&h=800&fit=crop"
                    alt="Modern apartment interior"
                    width={300}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-white border border-brand-100 p-8">
              <div className="h-14 w-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">
                Our Mission
              </h3>
              <p className="mt-3 text-slate-700 leading-relaxed">
                To make it easier to search seller-submitted property listings
                and send enquiries for homes and commercial spaces in
                Visakhapatnam.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-gold-500/10 to-white border border-gold-500/20 p-8">
              <div className="h-14 w-14 rounded-2xl bg-gold-500 text-white flex items-center justify-center shadow-lg">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">
                Our Vision
              </h3>
              <p className="mt-3 text-slate-700 leading-relaxed">
                To maintain a useful online directory of property listings and
                enquiry tools for the Visakhapatnam area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              Our Values
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
              Why Choose Vizag Properties
            </h2>
            <p className="mt-3 text-slate-600">
              The principles that drive everything we do.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-xl transition-all"
                >
                  <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Home}
              title="Residential Properties"
              description="Search apartments, villas, independent houses, penthouses and plots listed in Visakhapatnam and nearby areas."
            />
            <FeatureCard
              icon={Building2}
              title="Commercial Properties"
              description="Browse seller-submitted offices, retail showrooms, commercial spaces and mixed-use properties."
            />
            <FeatureCard
              icon={Key}
              title="Search & Enquiry Tools"
              description="Search listings and submit enquiries. Arrange your own legal, financial and property checks before making a decision."
            />
          </div>
        </div>
      </section>

      {/* Service areas */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
                Coverage
              </div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
                Locality Search for Vizag &amp; Nearby Areas
              </h2>
              <p className="mt-3 text-slate-600">
                Search suggestions cover Visakhapatnam and nearby Greater Vizag
                settlements. They are property-search labels, not a statement
                that every place is within GVMC limits or that listings exist
                in each locality.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                {[
                  "MVP Colony",
                  "Madhurawada",
                  "Rushikonda",
                  "Gajuwaka",
                  "Dwaraka Nagar",
                  "Beach Road",
                  "Kommadi",
                  "Yendada",
                  "Pendurthi",
                  "Sabbavaram",
                  "Bheemunipatnam",
                  "Kancharapalem",
                ].map((loc) => (
                  <div
                    key={loc}
                    className="flex items-center gap-2 text-slate-700"
                  >
                    <MapPin className="h-4 w-4 text-brand-500 flex-shrink-0" />
                    {loc}
                  </div>
                ))}
              </div>
              <Link
                href="/properties"
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
              >
                Browse Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=800&fit=crop"
                alt="Visakhapatnam cityscape"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:shadow-xl transition-all">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
