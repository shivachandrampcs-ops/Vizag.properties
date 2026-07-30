"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Home, Building2, Info, Mail, LogIn, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, SITE_CONFIG } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

const loginItems = [
  { href: "/login/builder", label: "Builder Login" },
  { href: "/login/admin", label: "Admin Login" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu / login dropdown whenever the route changes.
  // Adjusting state during render (rather than in an effect) avoids the
  // extra cascading render that a `useEffect([pathname])` would trigger.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setLoginOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80"
          : "bg-white border-b border-slate-100"
      )}
    >
      {/* Top bar */}
      <div className="bg-brand-950 text-white text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <div className="hidden sm:flex items-center gap-5 text-slate-200">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="hover:text-gold-400 transition-colors">
                {SITE_CONFIG.phone}
              </a>
            </span>
            <span className="hidden md:inline">
              📍 Visakhapatnam, Andhra Pradesh
            </span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <span className="hidden md:inline text-slate-200">
              Free Property Consultation
            </span>
            <a
              href={SITE_CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-500 font-medium"
            >
              WhatsApp Now
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 leading-none">
                Vizag<span className="text-brand-600">Properties</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wider uppercase leading-none mt-1">
                Trusted Real Estate
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    active
                      ? "text-brand-700 bg-brand-50"
                      : "text-slate-700 hover:text-brand-700 hover:bg-slate-50"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="relative">
              <button
                onClick={() => setLoginOpen(!loginOpen)}
                onBlur={() => setTimeout(() => setLoginOpen(false), 150)}
                className="ml-2 px-4 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-brand-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <LogIn className="h-4 w-4" />
                Login
                <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {loginOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden"
                  >
                    {loginItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors"
                      >
                        <div className="h-2 w-2 rounded-full bg-brand-500" />
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-brand-600 text-brand-700 hover:bg-brand-50 transition-colors flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              {SITE_CONFIG.phone}
            </a>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-slate-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      active
                        ? "text-brand-700 bg-brand-50"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-2 mt-2 border-t border-slate-200">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Login
                </div>
                {loginItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <LogIn className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="mt-2 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg bg-brand-600 text-white"
              >
                <Phone className="h-4 w-4" />
                Call {SITE_CONFIG.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
