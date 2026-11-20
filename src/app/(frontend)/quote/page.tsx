import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import QuoteForm from "@/components/QuoteForm";
import JsonLd from "@/components/JsonLd";
import { getCms, getEngagements, getFeatures, getProjectPricing, getServices, getSettings } from "@/lib/cms";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { WHATSAPP_GREETING, whatsappUrl } from "@/lib/contact";

const QUOTE_DESCRIPTION =
  "Request a custom quote from Zirka Digital Solutions for social media management, websites, SEO, paid advertising, branding, or AI automation.";

export const metadata: Metadata = pageMeta({
  title: "Get a quote",
  description: QUOTE_DESCRIPTION,
  path: "/quote",
  keywords: ["marketing agency quote", "website design quote", "SEO quote"],
});

type Props = { searchParams: Promise<{ service?: string; plan?: string }> };

export default async function QuotePage({ searchParams }: Props) {
  const [features, settings, services, engagements, projects, { service: preselectSlug, plan: planParam }] =
    await Promise.all([getFeatures(), getSettings(), getServices(), getEngagements(), getProjectPricing(), searchParams]);

  if (!features.quotesEnabled) {
    return (
      <>
        <PageHeader
          eyebrow="Request a quote"
          title="Let's talk about your project."
          lede="Online quote requests are paused. Message us on WhatsApp and we'll get you a price."
        />
        <section>
          <div className="wrap hero-ctas">
            <a
                className="btn btn-gold"
                href={whatsappUrl(settings.whatsapp, WHATSAPP_GREETING) ?? "/contact"}
                target="_blank"
                rel="noopener noreferrer"
              >
              Message us on WhatsApp
            </a>
            <Link className="btn btn-outline" href="/contact">
              Send a message instead
            </Link>
          </div>
        </section>
      </>
    );
  }

  // The admin holds ids, not slugs, so match the slug from the link here.
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "services",
    limit: 100,
    depth: 0,
    sort: "order",
    where: { _status: { equals: "published" } },
    select: { slug: true, name: true, short: true },
  });
  const options = (docs as { id: number; slug: string; name: string; short: string }[]).map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    short: s.short,
  }));

  const preselected = options.filter((o) => o.slug === preselectSlug).map((o) => o.id);
  // Only a plan that is really on the Pricing page; anything else in the URL is ignored.
  const plan =
    engagements.find((e) => e.name === planParam)?.name ||
    projects.find((p) => p.name === planParam)?.name ||
    (planParam === "Business Websites" || planParam === "Business Websites (3-5 pages)"
      ? "Business Website (3–5 pages)"
      : undefined);

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: "Get a Quote | Zirka Digital Solutions",
          description: QUOTE_DESCRIPTION,
          path: "/quote",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Get a Quote", path: "/quote" },
        ])}
      />
      <PageHeader
        eyebrow="Request a quote"
        title={plan ? `Start with ${plan}.` : "Tell us what you need."}
        lede={
          plan
            ? "Tell us a little about your business and we'll confirm your price and next steps — usually within one business day."
            : `Pick the services you're interested in and we'll send you a quote — usually within one business day. ${services.length} services to choose from, and you can select more than one.`
        }
      />
      <section>
        <div className="wrap">
          <QuoteForm
            services={options.map(({ id, name, short }) => ({ id, name, short }))}
            preselected={preselected}
            plan={plan}
          />
        </div>
      </section>
    </>
  );
}
