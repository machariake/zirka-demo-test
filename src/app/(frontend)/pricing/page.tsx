import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Engagements from "@/components/Engagements";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, pricingCatalogSchema, webPageSchema } from "@/lib/schema";
import { getEngagements, getFeatures, getProjectPricing } from "@/lib/cms";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/seo";

const PRICING_DESCRIPTION =
  "Zirka Digital Solutions pricing: social media management plans from $299/mo, website packages from $997, and one-off SEO, branding and automation projects.";

export const metadata: Metadata = pageMeta({
  title: "Pricing",
  description: PRICING_DESCRIPTION,
  path: "/pricing",
  keywords: [
    "social media management pricing",
    "website design pricing",
    "landing page package",
    "marketing agency retainer",
  ],
});

export default async function PricingPage() {
  // The same switch that hides pricing on the homepage hides this page, so the
  // team never ends up with a live page the rest of the site no longer links to.
  const [features, engagements, projectPrices] = await Promise.all([
    getFeatures(),
    getEngagements(),
    getProjectPricing(),
  ]);
  if (!features.showPricing) notFound();

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: "Pricing | Zirka Digital Solutions",
          description: PRICING_DESCRIPTION,
          path: "/pricing",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <JsonLd data={pricingCatalogSchema(engagements, projectPrices)} />

      <PageHeader
        eyebrow="Pricing"
        title="What it costs to work with us."
        lede="Monthly plans for ongoing marketing, and fixed starting prices for one-off pieces of work. No long forms to fill in before you can see a number."
      />

      <Engagements withProjects />

      <section className="section--flow">
        <div className="wrap">
          <div className="pricing-notes">
            <h2>How our pricing works</h2>
            <dl>
              <div>
                <dt>Prices start from the figure shown</dt>
                <dd>
                  What you pay depends on how much work your goals actually need. Final pricing
                  depends on project scope and requirements, and we agree the exact number with
                  you before any work begins.
                </dd>
              </div>
              <div>
                <dt>Advertising budget is separate</dt>
                <dd>
                  On the Business Growth and Premium Digital Growth plans, what you spend with Meta
                  or Google on advertising is separate from our fee. Our fee covers planning and
                  running those campaigns.
                </dd>
              </div>
              <div>
                <dt>Not sure what you need?</dt>
                <dd>
                  Tell us what you sell and what you want more of, and we will tell you which plan
                  to start on — free, and with no obligation.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <CtaBand heading="Ready to get started?" />
    </>
  );
}
