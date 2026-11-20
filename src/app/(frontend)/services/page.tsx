import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import CtaBand from "@/components/CtaBand";
import ServiceCard from "@/components/ServiceCard";
import ShareButton from "@/components/ShareButton";
import JsonLd from "@/components/JsonLd";
import { getServices, getSolutionCategories } from "@/lib/cms";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Services",
  description:
    "Digital advertising, social media, websites, SEO, content, WhatsApp marketing, AI automation and more — every service Zirka Digital Solutions offers.",
  path: "/services",
});

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([getServices(), getSolutionCategories()]);
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  // Anything not placed in a category still gets listed — the full catalogue
  // stays on this page (brief §5).
  const placed = new Set(categories.flatMap((c) => c.services.map((s) => s.slug)));
  const rest = services.filter((s) => !placed.has(s.slug));

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />

      <PageHeader
        eyebrow="What we do"
        title="Everything your marketing needs."
        lede={`${services.length} services across advertising, social, content, web, SEO, WhatsApp and automation. Take one, or let us run the lot together.`}
      />

      <section className="section--index">
        <div className="wrap">
          <h2 className="index-heading">All services</h2>
          <ol className="service-index">
            {services.map((service, i) => (
              <li key={service.slug} className="service-index__row">
                <Link href={`/services/${service.slug}`}>
                  <span className="service-index__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="service-index__name">{service.name}</span>
                  <span className="service-index__count">
                    {service.capabilities.length} included
                  </span>
                </Link>
                <ShareButton
                  title={service.name}
                  text={service.short}
                  path={`/services/${service.slug}`}
                  variant="icon"
                />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {categories.map((c) => {
        const inCategory = c.services
          .map((ref) => bySlug.get(ref.slug))
          .filter((svc): svc is NonNullable<typeof svc> => Boolean(svc));
        if (inCategory.length === 0) return null;
        return (
          <section className="section--flow service-category" id={c.slug} key={c.slug}>
            <div className="wrap">
              <div className="section-head">
                <div>
                  <span className="eyebrow">Solution</span>
                  <h2>{c.name}</h2>
                </div>
                <p>{c.description}</p>
              </div>
              <div className="service-grid">
                {inCategory.map((service) => (
                  <ServiceCard service={service} key={service.slug} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {rest.length > 0 && (
        <section className="section--flow service-category" id="also-available">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Also available</span>
                <h2>More ways we help.</h2>
              </div>
            </div>
            <div className="service-grid">
              {rest.map((service) => (
                <ServiceCard service={service} key={service.slug} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand heading="Not sure which mix is right?" />
    </>
  );
}
