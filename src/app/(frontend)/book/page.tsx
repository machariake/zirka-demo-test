import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BookingWidget from "@/components/BookingWidget";
import { getCms, getFeatures, getSettings } from "@/lib/cms";
import { getAvailability } from "@/lib/booking";
import { pageMeta } from "@/lib/seo";
import { WHATSAPP_GREETING, whatsappUrl } from "@/lib/contact";

export const metadata: Metadata = pageMeta({
  title: "Talk to a Strategist",
  description:
    "Book a free 30-minute call with a Zirka strategist — honest advice about your marketing, with no obligation.",
  path: "/book",
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
        </div>
      </section>
    </>
  );
}
