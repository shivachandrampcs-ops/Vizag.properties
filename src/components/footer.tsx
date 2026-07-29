import Link from "next/link";
import { Home, Phone, Mail, MapPin, MessageCircle } from "lucide-react";

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}
function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
function YoutubeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function LinkedinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
import { SITE_CONFIG, VIZAG_LOCATIONS } from "@/lib/utils";
import { ConsultationCta } from "./consultation-cta";

export function Footer() {
  return (
    <footer className="bg-brand-950 text-slate-300 mt-auto">
      {/* CTA section */}
      <ConsultationCta variant="footer" />

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-white leading-none">
                  Vizag<span className="text-gold-400">Properties</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase leading-none mt-1">
                  Trusted Real Estate
                </div>
              </div>
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Vizag Properties is a trusted real estate platform helping you
              discover verified apartments, villas, plots and commercial
              properties across Visakhapatnam. Get free consultation with
              experienced local property experts.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="flex items-center gap-2 text-slate-300 hover:text-gold-400 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {SITE_CONFIG.phone}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 text-slate-300 hover:text-gold-400 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {SITE_CONFIG.email}
              </a>
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {SITE_CONFIG.address}
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-brand-900 hover:bg-brand-700 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-brand-900 hover:bg-brand-700 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={SITE_CONFIG.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-brand-900 hover:bg-brand-700 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
              <a
                href={SITE_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-brand-900 hover:bg-brand-700 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href={SITE_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-green-600 hover:bg-green-500 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/properties"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  All Properties
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/login/builder"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  Builder Login
                </Link>
              </li>
              <li>
                <Link
                  href="/login/admin"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Property types */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Property Types
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/properties?type=apartment"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  Apartments in Vizag
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=villa"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  Villas in Vizag
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=plot"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  Plots in Vizag
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=independent_house"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  Independent Houses in Vizag
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=commercial"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  Commercial Properties in Vizag
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=penthouse"
                  className="text-slate-400 hover:text-gold-400 transition-colors"
                >
                  Penthouses in Vizag
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular locations */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Popular Locations
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              {VIZAG_LOCATIONS.slice(0, 12).map((loc) => (
                <li key={loc}>
                  <Link
                    href={`/properties?location=${encodeURIComponent(loc)}`}
                    className="text-slate-400 hover:text-gold-400 transition-colors"
                  >
                    {loc}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
              reserved.
            </p>
            <p>
              Built with care for property buyers in Visakhapatnam, Andhra
              Pradesh.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
