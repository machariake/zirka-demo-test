import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import AuditForm from "@/components/AuditForm";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { getAuditReplyTime, getFeatures, getSettings } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Free Marketing Audit",
  description:
    "Request a free marketing audit. We review your website, search visibility and lead generation, and send you the biggest opportunities we find.",
  path: "/free-marketing-audit",
});

/** What the audit covers (brief §8). Deliberately no promise of results. */
const COVERS = [
  {
    title: "Website and conversion review",
    body: "How clearly your site explains what you offer, and where visitors drop off before they enquire.",
  },
  {
    title: "Search visibility opportunities",
    body: "How you show up on Google and Google Maps for the searches your customers actually make.",
  },
  {
    title: "Lead-generation opportunities",
    body: "Where your advertising, social and follow-up could be bringing in more qualified enquiries.",
  },
  {
    title: "Priority recommendations",
    body: "The few changes most worth making first, in plain language — not a hundred-point checklist.",
  },
];

export default async function FreeAuditPage() {
  const [features, settings, replyTime] = await Promise.all([getFeatures(), getSettings(), getAuditReplyTime()]);

  // What happens after they press send. The timing is only stated when the team has set one.
  const next = [
    { title: "You send the request", body: "Two minutes: your details, your website and the goal that matters most." },
    {
      title: "A strategist reviews it",
      body: "A person at Zirka looks at your website, search visibility and current marketing — not an automated scan.",
    },
    {
      title: "You get your findings",
      body: `We email you the biggest opportunities we found${replyTime ? `, ${replyTime}` : ""}, in plain language.`,
    },
    {
      title: "You decide what's next",
      body: "Talk it through with us if you'd like help, or take the recommendations and run with them yourself.",
    },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Free Marketing Audit", path: "/free-marketing-audit" },
        ])}
      />

      <PageHeader
        eyebrow="Free Marketing Audit"
        title="Get a Free Marketing Audit."
        lede="We'll review your current marketing and identify the biggest opportunities to improve traffic, leads, and conversions."
      />

      <section className="section--flow audit">
        <div className="wrap audit__grid">
          <div className="audit__intro">
            <h2>What we&rsquo;ll look at</h2>
            <ul className="audit__covers">
              {COVERS.map((c) => (
                <li key={c.title}>
                  <strong>{c.title}</strong>
                  <span>{c.body}</span>
                </li>
              ))}
            </ul>
            <h2 className="audit__next-heading">What happens next</h2>
            <ol className="audit__next">
              {next.map((step, i) => (
                <li key={step.title}>
                  <span className="audit__next-idx" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.body}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="audit__note">
              It&rsquo;s free and there&rsquo;s no obligation. We&rsquo;ll tell you honestly what we
              find — we won&rsquo;t promise results before we&rsquo;ve looked.
            </p>
          </div>

          <div className="audit__form">
            <h2>Request my free audit</h2>
            {features.contactFormEnabled ? (
              <AuditForm />
            ) : (
              <p className="form-error" role="status">
                Audit requests are paused at the moment. Message us on WhatsApp on{" "}
                {settings.phoneDisplay || "the number in the footer"} and we&rsquo;ll pick it up
                there.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
