import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FloatingContact } from "@/components/floating-contact";
import { SITE_CONFIG } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1d33b8",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} | Verified Properties in Visakhapatnam`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Vizag Properties",
    "Properties in Vizag",
    "Apartments in Vizag",
    "Villas in Vizag",
    "Plots in Vizag",
    "Independent Houses in Vizag",
    "Commercial Properties in Vizag",
    "Property for Sale in Vizag",
    "Visakhapatnam Real Estate",
    "Verified Builders in Vizag",
    "Flats in Visakhapatnam",
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} | Verified Properties in Visakhapatnam`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} | Verified Properties in Visakhapatnam`,
    description: SITE_CONFIG.description,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification here
    // google: "your-verification-code",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="geo.region" content="IN-AP" />
        <meta name="geo.placename" content="Visakhapatnam" />
        <meta name="geo.position" content="17.6868;83.2185" />
        <meta name="ICBM" content="17.6868, 83.2185" />
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: SITE_CONFIG.name,
              url: SITE_CONFIG.url,
              logo: `${SITE_CONFIG.url}/logo.png`,
              description: SITE_CONFIG.description,
              telephone: SITE_CONFIG.phoneRaw,
              email: SITE_CONFIG.email,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Visakhapatnam",
                addressRegion: "Andhra Pradesh",
                addressCountry: "IN",
              },
              areaServed: {
                "@type": "City",
                name: "Visakhapatnam",
              },
              sameAs: [
                SITE_CONFIG.social.facebook,
                SITE_CONFIG.social.instagram,
                SITE_CONFIG.social.youtube,
                SITE_CONFIG.social.linkedin,
              ],
            }),
          }}
        />
      </head>
      <body className="bg-white text-slate-900 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
