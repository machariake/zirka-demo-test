import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import LegalBody from "@/components/LegalBody";
import JsonLd from "@/components/JsonLd";
import { getLegal } from "@/lib/cms";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

const REFUNDS_DESCRIPTION =
  "Read the Zirka Digital Solutions refund policy in plain language, including how deposits, monthly retainers, and completed deliverables are handled.";

export const metadata: Metadata = pageMeta({
  title: "Refund policy",
  description: REFUNDS_DESCRIPTION,
  path: "/refunds",
});

export default async function RefundsPage() {
  const legal = await getLegal();

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: "Refund Policy | Zirka Digital Solutions",
          description: REFUNDS_DESCRIPTION,
          path: "/refunds",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Refund Policy", path: "/refunds" },
        ])}
      />
      <PageHeader eyebrow="Refund policy" title="Deposits and refunds." lede={legal.refundsIntro} />
      <section>
        <div className="wrap prose">
          <LegalBody
            sections={legal.refunds}
            entity={legal.entity}
            jurisdiction={legal.jurisdiction}
          />
        </div>
      </section>
    </>
  );
}
