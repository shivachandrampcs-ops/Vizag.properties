import { MetadataRoute } from "next";
import { db } from "@/db";
import { properties, builders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SITE_CONFIG } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Property pages
  let propertyEntries: MetadataRoute.Sitemap = [];
  try {
    const allProperties = await db
      .select({ slug: properties.slug, updatedAt: properties.updatedAt })
      .from(properties)
      .where(eq(properties.isActive, true));
    propertyEntries = allProperties.map((p) => ({
      url: `${baseUrl}/properties/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (e) {
    // DB not ready
  }

  return [...staticPages, ...propertyEntries];
}
