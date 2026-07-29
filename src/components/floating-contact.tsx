"use client";

import { useState, useEffect } from "react";
import { Phone, MessageCircle, X, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE_CONFIG } from "@/lib/utils";

export function FloatingContact() {
  const [open, setOpen] = useState(true);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3">
      {/* Scroll to top */}
      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="h-11 w-11 rounded-full bg-slate-800 hover:bg-slate-900 text-white shadow-lg flex items-center justify-center transition-colors"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating buttons */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-2.5"
          >
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="group flex items-center gap-3 pl-3 pr-4 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 transition-all"
              aria-label="Call us"
            >
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold hidden sm:inline">
                Call Now
              </span>
            </a>
            <a
              href={SITE_CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 pl-3 pr-4 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 transition-all"
              aria-label="WhatsApp us"
            >
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold hidden sm:inline">
                WhatsApp
              </span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full bg-slate-800 hover:bg-slate-900 text-white shadow-lg flex items-center justify-center transition-colors"
        aria-label={open ? "Hide contact buttons" : "Show contact buttons"}
      >
        {open ? <X className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
      </button>
    </div>
  );
}
