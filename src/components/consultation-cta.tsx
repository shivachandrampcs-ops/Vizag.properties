import Link from "next/link";
import { Phone, MessageCircle, Home, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Variant = "footer" | "default" | "compact";

export function ConsultationCta({
  variant = "default",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-xl",
          className
        )}
      >
        <div className="flex items-start gap-3 mb-4">
          <Home className="h-6 w-6 text-gold-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold leading-tight">
              🏡 Get FREE Property Consultation
            </h3>
            <p className="text-sm text-brand-100 mt-1">
              Talk to our local Vizag property expert
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={SITE_CONFIG.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Now
          </a>
          <a
            href={`tel:${SITE_CONFIG.phoneRaw}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-brand-700 hover:bg-slate-100 text-sm font-semibold transition-colors"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <section
      className={cn(
        variant === "footer"
          ? "bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900"
          : "bg-gradient-to-br from-brand-600 to-brand-800",
        "relative overflow-hidden text-white",
        className
      )}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-gold-500 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-brand-400 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-4">
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              100% FREE · NO OBLIGATION
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              🏡 Get FREE Property Consultation
            </h2>
            <p className="mt-3 text-lg md:text-xl text-brand-100 font-medium">
              Talk to Our Local Vizag Property Expert
            </p>
            <p className="mt-3 text-slate-200 max-w-xl">
              Looking for the perfect property in Vizag? We help buyers discover
              verified apartments, villas, plots and commercial properties.
            </p>
            <ul className="mt-5 space-y-2 text-slate-100">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                <span>✔ Free Property Consultation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                <span>✔ Verified Property Suggestions</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                <span>✔ Site Visit Assistance</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                <span>✔ Investment Guidance</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={SITE_CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 rounded-2xl bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/20 transition-all"
            >
              <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-green-100 font-semibold">
                  WhatsApp
                </div>
                <div className="text-lg font-bold">Chat with Expert</div>
                <div className="text-sm text-green-100 mt-0.5">
                  Quick reply · Free
                </div>
              </div>
            </a>
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="group flex items-center gap-4 p-5 rounded-2xl bg-white text-brand-700 hover:bg-slate-50 shadow-xl transition-all"
            >
              <div className="h-14 w-14 rounded-xl bg-brand-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Call
                </div>
                <div className="text-lg font-bold">+91 7702434892</div>
                <div className="text-sm text-slate-500 mt-0.5">
                  Direct line
                </div>
              </div>
            </a>
            <Link
              href="/contact"
              className="group flex items-center gap-4 p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all sm:col-span-2"
            >
              <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-brand-100 font-semibold">
                  Email / Form
                </div>
                <div className="text-lg font-bold">Send us a Message</div>
                <div className="text-sm text-brand-100 mt-0.5">
                  We'll respond within 1 hour
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
