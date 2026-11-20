import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import LegalBody from "@/components/LegalBody";
import JsonLd from "@/components/JsonLd";
import { getLegal } from "@/lib/cms";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

const TERMS_DESCRIPTION =
  "Review the terms of service for Zirka Digital Solutions covering project scope, monthly retainers, billing, deliverables, and intellectual property.";

export const metadata: Metadata = pageMeta({
  title: "Terms of service",
  description: TERMS_DESCRIPTION,
  path: "/terms",
});

export default async function TermsPage() {
  const legal = await getLegal();

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: "Terms of Service | Zirka Digital Solutions",
          description: TERMS_DESCRIPTION,
          path: "/terms",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Terms of Service", path: "/terms" },
        ])}
      />
      <PageHeader
        eyebrow="Terms of service"
        title="How we work together."
        lede={legal.termsIntro}
      />
      <section>
        <div className="wrap prose">
          <LegalBody sections={legal.terms} entity={legal.entity} jurisdiction={legal.jurisdiction} />
        </div>
      </section>
    </>
  );
}
