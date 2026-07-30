import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <section className="bg-gradient-to-br from-slate-50 to-white py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-7xl md:text-9xl font-bold text-brand-200">404</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
            Property Not Found
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-xl mx-auto">
            We couldn&apos;t find the page you&apos;re looking for. The property may
            have been removed or the link is incorrect.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              <Search className="h-4 w-4" />
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
