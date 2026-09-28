/**
 * Schema.org records for search engines: the business, each service, and
 * breadcrumb trails. They describe the page accurately; they are not there to
 * chase rich results, which Google may or may not show (brief §20). FAQPage is
 * deliberately absent for that reason (brief §14).
 *
 * Only state what the CMS actually holds. An invented address or rating is
 * worse than none: it is a policy violation and it can get rich results pulled
 * for the whole domain. That is why the business is an Organization rather than
 * a LocalBusiness — LocalBusiness expects a street address we do not have.
 */
import { SITE_URL } from "./site";
import type { ServiceDetailView } from "./cms";

/** A stable node id, so every page's records point at one business, not many. */
export const ORG_ID = `${SITE_URL}/#organization`;

const absolute = (url: string) => (url.startsWith("http") ? url : `${SITE_URL}${url}`);

type OrgInput = {
  companyName: string;
  descriptor: string;
  slogan: string;
  phoneDisplay: string;
  email: string;
  whatsapp: string;
  heroImage: string;
};

export const organizationSchema = (s: OrgInput) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: s.companyName,
  url: SITE_URL,
  description: s.descriptor,
  ...(s.slogan ? { slogan: s.slogan } : {}),
  ...(s.heroImage ? { image: absolute(s.heroImage) } : {}),
  logo: `${SITE_URL}/icon.png`,
  ...(s.email ? { email: s.email } : {}),
  // The display number is for people; contactPoint wants E.164.
  ...(s.whatsapp ? { telephone: `+${s.whatsapp.replace(/\D/g, "")}` } : {}),
  ...(s.whatsapp
    ? {
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: `+${s.whatsapp.replace(/\D/g, "")}`,
          url: `https://wa.me/${s.whatsapp.replace(/\D/g, "")}`,
        },
      }
    : {}),
});

/** The site itself, tied to the business so search engines read one entity. */
export const websiteSchema = (companyName: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: companyName,
  url: SITE_URL,
  publisher: { "@id": ORG_ID },
  inLanguage: "en",
});

export const serviceSchema = (service: ServiceDetailView, companyName: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: service.name,
  serviceType: service.name,
  description: service.description || service.short,
  url: `${SITE_URL}/services/${service.slug}`,
  image: absolute(service.image),
  provider: { "@type": "Organization", "@id": ORG_ID, name: companyName },
  ...(service.capabilities.length > 0
    ? {
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${service.name} — what's included`,
          itemListElement: service.capabilities.map((label) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: label },
          })),
        },
      }
    : {}),
});

export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((step, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: step.name,
    item: `${SITE_URL}${step.path}`,
  })),
});

/** A blog post, credited to its author when one is set and always published by Zirka. */
export const articleSchema = (post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  heroImage: string | null;
  author: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.excerpt,
  url: `${SITE_URL}/blog/${post.slug}`,
  mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  ...(post.heroImage ? { image: absolute(post.heroImage) } : {}),
  author: post.author ? { "@type": "Person", name: post.author } : { "@id": ORG_ID },
  publisher: { "@id": ORG_ID },
});
