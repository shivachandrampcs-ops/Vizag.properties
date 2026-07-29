import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/login/"],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
