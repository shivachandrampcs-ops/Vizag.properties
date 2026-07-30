import { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { SITE_CONFIG } from "@/lib/utils";
import Link from "next/link";
import { ContactMapWrapper } from "@/components/contact-map-wrapper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Vizag Properties | Get Free Property Consultation",
  description:
    "Get in touch with Vizag Properties for free property consultation in Visakhapatnam. Call +91 7702434892, WhatsApp or send us a message. We're here to help you find your dream property.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Vizag Properties",
    description: "Get in touch with Vizag Properties for property consultation.",
    url: `${SITE_CONFIG.url}/contact`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-700">Contact</span>
          </nav>
          <div className="max-w-3xl">
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              We&apos;d Love to Hear From You
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
              Get in Touch
            </h1>
            <p className="mt-3 text-slate-600 text-lg">
              Have questions about properties in Vizag? Need expert advice?
              Our team is here to help you find your perfect home.
            </p>
          </div>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-10 md:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="group p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-white border border-brand-100 hover:shadow-xl transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-brand-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Call Us</h3>
              <p className="mt-1 text-sm text-slate-600">
                {SITE_CONFIG.phone}
              </p>
              <p className="mt-1 text-xs text-brand-600 font-medium">
                Tap to call →
              </p>
            </a>

            <a
              href={SITE_CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 hover:shadow-xl transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-green-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                WhatsApp
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Chat with our expert
              </p>
              <p className="mt-1 text-xs text-green-600 font-medium">
                Quick reply →
              </p>
            </a>

            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="group p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 hover:shadow-xl transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Email</h3>
              <p className="mt-1 text-sm text-slate-600 break-all">
                {SITE_CONFIG.email}
              </p>
              <p className="mt-1 text-xs text-amber-600 font-medium">
                Send us email →
              </p>
            </a>

            <div className="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
              <div className="h-12 w-12 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Hours</h3>
              <p className="mt-1 text-sm text-slate-600">
                Mon - Sun: 9:00 AM - 8:00 PM
              </p>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Open all days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-12 md:py-20 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Send Us a Message
              </h2>
              <p className="mt-2 text-slate-600">
                Fill out the form and our team will get back to you within 1
                hour.
              </p>
              <div className="mt-6">
                <LeadForm source="contact_page" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Find Us in Vizag
              </h2>
              <p className="mt-2 text-slate-600">
                We operate across Visakhapatnam, Andhra Pradesh.
              </p>
              <div className="mt-6 h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                <ContactMapWrapper />
              </div>
              <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Vizag Properties
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {SITE_CONFIG.address}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <a
                        href={`tel:${SITE_CONFIG.phoneRaw}`}
                        className="font-semibold text-brand-600 hover:text-brand-700"
                      >
                        {SITE_CONFIG.phone}
                      </a>{" "}
                      • {SITE_CONFIG.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
