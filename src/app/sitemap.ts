import type { MetadataRoute } from "next";
import { getCaseStudySitemap, getFeatures, getPostSitemap, getProjectSitemap, getServiceSitemap } from "@/lib/cms";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages switched off in Features either 404 or show a "paused" notice, so
  // they are left out rather than handed to search engines.
  const features = await getFeatures();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    ...(features.showPricing
      ? [{ url: `${SITE_URL}/pricing`, changeFrequency: "monthly" as const, priority: 0.9 }]
      : []),
    { url: `${SITE_URL}/free-marketing-audit`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.8 },
    ...(features.bookingEnabled
      ? [{ url: `${SITE_URL}/book`, changeFrequency: "weekly" as const, priority: 0.8 }]
      : []),
    ...(features.quotesEnabled
      ? [{ url: `${SITE_URL}/quote`, changeFrequency: "monthly" as const, priority: 0.9 }]
      : []),
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/refunds`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [studies, services, projects, posts] = await Promise.all([
    getCaseStudySitemap(),
    getServiceSitemap(),
    getProjectSitemap(),
    getPostSitemap(),
  ]);
  return [
    ...pages,
    ...(posts.length > 0 ? [{ url: `${SITE_URL}/blog`, changeFrequency: "weekly" as const, priority: 0.8 }] : []),
    // Each service has its own page to rank for, so list them above case studies.
    ...services.map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: new Date(s.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...projects.map((p) => ({
      url: `${SITE_URL}/work/projects/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...studies.map((s) => ({
      url: `${SITE_URL}/work/${s.slug}`,
      lastModified: new Date(s.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
