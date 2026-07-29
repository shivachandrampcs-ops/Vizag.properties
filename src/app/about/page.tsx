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
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Building2,
  Home,
  Key,
} from "lucide-react";
import { ConsultationCta } from "@/components/consultation-cta";
import { SITE_CONFIG } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Vizag Properties | Trusted Real Estate in Visakhapatnam",
  description:
    "Vizag Properties is a trusted real estate platform helping property buyers discover verified apartments, villas, plots and commercial properties in Visakhapatnam. Learn about our mission, vision and team.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
};

const stats = [
  { value: "500+", label: "Verified Properties" },
  { value: "50+", label: "Trusted Builders" },
  { value: "2000+", label: "Happy Customers" },
  { value: "15+", label: "Areas Covered" },
];

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "We believe in 100% transparency. Every property is personally verified and every interaction is honest.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description:
      "Your dream home is our mission. We go above and beyond to make property buying simple and stress-free.",
  },
  {
    icon: Award,
    title: "Quality Always",
    description:
      "We partner only with reputed, RERA-registered builders and showcase only quality properties.",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description:
      "We leverage technology to make property discovery and consultation seamless and modern.",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Vizag Properties",
    description:
      "Learn about Vizag Properties - a trusted real estate platform helping property buyers in Visakhapatnam.",
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
              Vizag's Most Trusted
              <br />
              Property Platform
            </h1>
            <p className="mt-5 text-lg md:text-xl text-slate-200">
              We are on a mission to make property buying in Visakhapatnam
              simple, transparent and trustworthy for every family.
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
                Your Local Vizag Property Partner
              </h2>
              <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
                <p>
                  <strong className="text-slate-900">Vizag Properties</strong>{" "}
                  is a Visakhapatnam-based real estate discovery and
                  consultation platform built with a simple mission - to make
                  property buying in Vizag easy, transparent and trustworthy.
                </p>
                <p>
                  We work with verified, RERA-registered builders across the
                  city to bring you the best{" "}
                  <strong>apartments, villas, plots and commercial properties</strong>{" "}
                  in prime locations like MVP Colony, Madhurawada, Rushikonda,
                  Gajuwaka, Beach Road, Dwaraka Nagar, Kommadi, Pendurthi and
                  more.
                </p>
                <p>
                  Whether you are a first-time buyer, an NRI investor or looking
                  for your dream home, our local experts help you at every step
                  - from property selection to site visits, documentation and
                  possession.
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
                    alt="Vizag Properties team meeting"
                    width={300}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[3/4] mt-8">
                  <Image
                    src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&h=800&fit=crop"
                    alt="Modern apartment in Vizag"
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
                To simplify property buying in Visakhapatnam by connecting
                buyers with verified builders, providing transparent
                information and offering free expert consultation - so that
                every Vizag family finds their perfect home with confidence.
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
                To become India's most trusted real estate platform by setting
                the gold standard in property discovery, builder verification
                and customer service - starting from Vizag and expanding to
                every growing city.
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
              description="Apartments, villas, independent houses, penthouses and plots across Vizag's best neighborhoods."
            />
            <FeatureCard
              icon={Building2}
              title="Commercial Properties"
              description="Offices, retail showrooms, commercial spaces and mixed-use developments in prime business districts."
            />
            <FeatureCard
              icon={Key}
              title="End-to-End Support"
              description="From property search to home loan, legal verification to registration - we assist throughout."
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
                Serving All of Visakhapatnam
              </h2>
              <p className="mt-3 text-slate-600">
                Our local team has in-depth knowledge of every major locality
                in Vizag. From beachfront properties in Bheemunipatnam to
                affordable homes in Gajuwaka - we cover the entire city.
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
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
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

      <ConsultationCta />
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
