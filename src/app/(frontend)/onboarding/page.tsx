import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import OnboardingForm, { PAID_PACKAGE_OPTIONS } from "@/components/OnboardingForm";
import JsonLd from "@/components/JsonLd";
import { WhatsAppIcon } from "@/components/Icons";
import { getFeatures, getSettings } from "@/lib/cms";
import { whatsappUrl } from "@/lib/contact";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

const ONBOARDING_DESCRIPTION =
  "Completed your Stripe payment with Zirka Digital Solutions? Submit your 2-minute client onboarding brief so your strategist kicks off within 24 hours.";

export const metadata: Metadata = pageMeta({
  title: "Client Onboarding",
  description: ONBOARDING_DESCRIPTION,
  path: "/onboarding",
});

type Props = { searchParams: Promise<{ plan?: string }> };

function matchPackageOption(planParam?: string): string | undefined {
  if (!planParam) return undefined;
  const q = planParam.trim().toLowerCase();
  return PAID_PACKAGE_OPTIONS.find((opt) => opt.toLowerCase().includes(q));
}

export default async function OnboardingPage({ searchParams }: Props) {
  const [settings, features, { plan }] = await Promise.all([
    getSettings(),
    getFeatures(),
    searchParams,
  ]);

  const defaultPackage = matchPackageOption(plan);
  const directWhatsApp = features.showWhatsApp
    ? whatsappUrl(
        settings.whatsapp,
        `Hi Zirka! I just completed payment${defaultPackage ? ` for ${defaultPackage}` : ""} and I'm ready to start onboarding.`
      )
    : null;

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: "Client Onboarding | Zirka Digital Solutions",
          description: ONBOARDING_DESCRIPTION,
          path: "/onboarding",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Client Onboarding", path: "/onboarding" },
        ])}
      />
      <PageHeader
        eyebrow="Payment confirmed · Next steps"
        title="Let&rsquo;s kick off your service."
        lede="Thank you for choosing Zirka Digital Solutions. Complete the quick 2-minute kickoff form below so your strategist can get started within 24 hours."
      />

      <section>
        <div className="wrap">
          <div className="delivery-steps delivery-steps--compact">
            <div className="delivery-step">
              <span className="delivery-step__num">01</span>
              <h3>Receipt sent</h3>
              <p>Stripe emails your official payment receipt automatically.</p>
            </div>
            <div className="delivery-step">
              <span className="delivery-step__num">02</span>
              <h3>2-min onboarding</h3>
              <p>Share your business info, website or social handles, and goals below.</p>
            </div>
            <div className="delivery-step">
              <span className="delivery-step__num">03</span>
              <h3>Kickoff within 24h</h3>
              <p>Your strategist confirms your timeline, access setup, and first deliverables.</p>
            </div>
            <div className="delivery-step">
              <span className="delivery-step__num">04</span>
              <h3>Work begins</h3>
              <p>Websites move into design &amp; build; Social &amp; Care plans launch monthly execution.</p>
            </div>
          </div>

          <div className="contact-grid" style={{ marginTop: 48 }}>
            <div>
              <h2 className="index-heading">Step 2 &mdash; Submit your kickoff brief</h2>
              <OnboardingForm
                defaultPackage={defaultPackage}
                whatsappNumber={features.showWhatsApp ? settings.whatsapp : undefined}
              />
            </div>

            <aside className="contact-aside">
              <div className="service-aside__card">
                <span className="eyebrow">Fast track</span>
                <h2>Prefer to kick off directly on WhatsApp or a call?</h2>
                <p>
                  You can message our team right now with your Stripe receipt email or book a
                  15-minute kickoff call so we can collect your brand assets live.
                </p>
                {directWhatsApp && (
                  <a
                    className="btn btn-gold"
                    href={directWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon />
                    Start on WhatsApp Now
                  </a>
                )}
                {features.bookingEnabled && (
                  <Link className="btn btn-outline" href="/book">
                    Book a 15-Min Kickoff Call
                  </Link>
                )}
                <p className="field-hint" style={{ marginTop: 8 }}>
                  Support hours: {settings.hours || "Monday – Friday, 9am – 6pm"} &middot;{" "}
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
