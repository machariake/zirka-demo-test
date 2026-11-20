import { SITE_URL } from "./site";
import type { ServiceDetailView, ServiceView } from "./cms";

/** A stable node id, so every page's records point at one business, not many. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const absolute = (url: string) => (url.startsWith("http") ? url : `${SITE_URL}${url}`);

type OrgInput = {
  companyName: string;
  descriptor: string;
  slogan: string;
  phoneDisplay: string;
  email: string;
  whatsapp: string;
  heroImage: string;
  social?: { url: string }[];
};

export const organizationSchema = (s: OrgInput) => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": ORG_ID,
  name: s.companyName,
  url: SITE_URL,
  description:
    "Zirka Digital Solutions is an Atlanta, Georgia digital marketing agency specializing in social media management, website development, SEO, paid advertising, and AI automation.",
  ...(s.slogan ? { slogan: s.slogan } : {}),
  ...(s.heroImage ? { image: absolute(s.heroImage) } : {}),
  logo: `${SITE_URL}/icon.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Atlanta",
    addressRegion: "GA",
    addressCountry: "US",
  },
  areaServed: ["Atlanta, Georgia", "United States", "Worldwide"],
  priceRange: "$129 - $4,000+",
  knowsAbout: [
    "Digital Marketing",
    "Social Media Management",
    "Website Development",
    "Search Engine Optimization",
    "Local SEO",
    "Google Ads",
    "Meta Advertising",
    "WhatsApp Marketing",
    "AI Business Automation",
    "Brand Identity Design",
  ],
  ...(s.social && s.social.length > 0 ? { sameAs: s.social.map((p) => p.url) } : {}),
  ...(s.email ? { email: s.email } : {}),
  ...(s.whatsapp ? { telephone: `+${s.whatsapp.replace(/\D/g, "")}` } : {}),
  ...(s.whatsapp
    ? {
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: `+${s.whatsapp.replace(/\D/g, "")}`,
        url: `https://wa.me/${s.whatsapp.replace(/\D/g, "")}`,
        availableLanguage: ["English"],
      },
    }
    : {}),
});

/** The site itself, tied to the business so search engines read one entity. */
export const websiteSchema = (companyName: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: companyName,
  url: SITE_URL,
  description:
    "Digital marketing, social media management, custom website development, SEO, and AI automation for growing businesses.",
  publisher: { "@id": ORG_ID },
  inLanguage: "en",
});

export const webPageSchema = ({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}${path}#webpage`,
  name: title,
  description,
  url: `${SITE_URL}${path}`,
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": ORG_ID },
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
  areaServed: "Worldwide",
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

export const servicesCatalogSchema = (services: ServiceView[]) => ({
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "Zirka Digital Solutions Services",
  url: `${SITE_URL}/services`,
  provider: { "@id": ORG_ID },
  itemListElement: services.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: s.name,
      description: s.short,
      url: `${SITE_URL}/services/${s.slug}`,
      provider: { "@id": ORG_ID },
    },
  })),
});

function parseNumericPrice(priceText: string): string | null {
  const match = priceText.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? match[0] : null;
}

export const pricingCatalogSchema = (
  engagements: { name: string; price: string; summary: string; checkoutUrl?: string }[],
  projects: { name: string; price: string; note?: string; checkoutUrl?: string }[]
) => {
  const offers = [
    ...engagements.map((e) => {
      const numeric = parseNumericPrice(e.price);
      return {
        "@type": "Offer",
        name: e.name,
        description: e.summary,
        url: e.checkoutUrl || `${SITE_URL}/quote?plan=${encodeURIComponent(e.name)}`,
        ...(numeric
          ? {
            price: numeric,
            priceCurrency: "USD",
          }
          : {}),
        itemOffered: {
          "@type": "Service",
          name: e.name,
          provider: { "@id": ORG_ID },
        },
      };
    }),
    ...projects.map((p) => {
      const numeric = parseNumericPrice(p.price);
      return {
        "@type": "Offer",
        name: p.name,
        ...(p.note ? { description: p.note } : {}),
        url: p.checkoutUrl || `${SITE_URL}/quote?plan=${encodeURIComponent(p.name)}`,
        ...(numeric
          ? {
            price: numeric,
            priceCurrency: "USD",
          }
          : {}),
        itemOffered: {
          "@type": "Service",
          name: p.name,
          provider: { "@id": ORG_ID },
        },
      };
    }),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Zirka Digital Solutions Packages & Pricing",
    url: `${SITE_URL}/pricing`,
    itemListElement: offers,
  };
};

export const faqSchema = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
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
