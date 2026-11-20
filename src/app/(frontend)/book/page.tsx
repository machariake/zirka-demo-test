import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BookingWidget from "@/components/BookingWidget";
import { getCms, getFeatures, getSettings } from "@/lib/cms";
import { getAvailability } from "@/lib/booking";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { WHATSAPP_GREETING, whatsappUrl } from "@/lib/contact";

const BOOK_DESCRIPTION =
  "Book a free 30-minute digital marketing and website strategy call with Zirka Digital Solutions. Get practical SEO, ads, and conversion advice with no obligation.";

export const metadata: Metadata = pageMeta({
  title: "Talk to a Strategist",
  description: BOOK_DESCRIPTION,
  path: "/book",
  keywords: ["book marketing consultation", "digital marketing strategist call", "free SEO strategy session"],
});

// Availability changes with every booking, so never serve a cached page.
export const dynamic = "force-dynamic";

export default async function BookPage() {
  const [features, settings] = await Promise.all([getFeatures(), getSettings()]);

  if (!features.bookingEnabled) {
    return (
      <>
        <PageHeader
          eyebrow="Talk to a Strategist"
          title="Let's find a time."
          lede="Online booking is paused at the moment. The fastest way to reach a strategist is on WhatsApp."
        />
        <section>
          <div className="wrap">
            <div className="hero-ctas">
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
          </div>
        </section>
      </>
    );
  }

  const payload = await getCms();
  const { config, days } = await getAvailability(payload);

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: "Talk to a Strategist | Zirka Digital Solutions",
          description: BOOK_DESCRIPTION,
          path: "/book",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Book a Call", path: "/book" },
        ])}
      />
      <PageHeader
        eyebrow="Talk to a Strategist"
        title="Pick a time that suits you."
        lede={`${config.callMinutes} free minutes with a marketing specialist, and no obligation afterwards. Tell us what you want to achieve and we'll tell you honestly how we'd approach it.`}
      />
      <section>
        <div className="wrap">
          <BookingWidget
            initialDays={days}
            businessTz={config.timezone}
            callMinutes={config.callMinutes}
            meetingDetails={config.meetingDetails}
          />

          <div className="delivery-panel" style={{ marginTop: 48 }}>
            <div className="delivery-panel__head">
              <div>
                <span className="eyebrow">Your session agenda</span>
                <h3>What we cover in {config.callMinutes} minutes</h3>
              </div>
              <p>
                No high-pressure pitch — just a focused working session with the strategist who
                actually runs campaigns and builds growth systems.
              </p>
            </div>
            <div className="delivery-steps">
              <div className="delivery-step">
                <span className="delivery-step__num">01</span>
                <h4>Current Funnel Review</h4>
                <p>
                  We look at your website, search visibility, social presence, and where prospective
                  customers are currently dropping off.
                </p>
              </div>
              <div className="delivery-step">
                <span className="delivery-step__num">02</span>
                <h4>Quick Wins &amp; Bottlenecks</h4>
                <p>
                  We pinpoint the highest-impact fixes across SEO, landing pages, Google Business
                  Profile, or paid media creative.
                </p>
              </div>
              <div className="delivery-step">
                <span className="delivery-step__num">03</span>
                <h4>Channel &amp; Package Fit</h4>
                <p>
                  We recommend only the social media, website, or automation scope that matches your
                  stage and realistic budget.
                </p>
              </div>
              <div className="delivery-step">
                <span className="delivery-step__num">04</span>
                <h4>Clear 30-Day Action Plan</h4>
                <p>
                  You leave with a concrete roadmap you can implement with our team or execute
                  in-house right away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
