import Link from "next/link";
import { getSettings, getFeatures } from "@/lib/cms";
import { SMS_GREETING, WHATSAPP_GREETING, smsUrl, telUrl, whatsappUrl } from "@/lib/contact";

/**
 * The closing call to action on most pages (brief §10): the free audit as the
 * one primary action, and a direct line to a strategist as the alternative for
 * people who would rather talk first. Call, text, and WhatsApp links sit in the
 * contact strip below the buttons.
 */
export default async function CtaBand({
  heading = "Find your biggest marketing opportunities.",
}: {
  heading?: string;
}) {
  const [settings, features] = await Promise.all([getSettings(), getFeatures()]);

  const whatsapp = features.showWhatsApp ? whatsappUrl(settings.whatsapp, WHATSAPP_GREETING) : null;
  const phoneHref = telUrl(settings.whatsapp);
  const textHref = smsUrl(settings.whatsapp, SMS_GREETING);
  const strategistHref = features.bookingEnabled ? "/book" : (whatsapp ?? "/contact");
  const external = strategistHref.startsWith("http");

  return (
    <section className="section--flow">
      <div className="wrap">
        <div className="cta-band">
          <h2>{heading}</h2>
          <div className="right">
            <div className="cta-actions">
              <Link className="btn btn-gold" href="/free-marketing-audit" data-track="main_cta_click">
                Get a Free Marketing Audit
              </Link>
              {external ? (
                <a className="btn btn-ghost" href={strategistHref} target="_blank" rel="noopener noreferrer">
                  Talk to a Strategist
                </a>
              ) : (
                <Link className="btn btn-ghost" href={strategistHref}>
                  Talk to a Strategist
                </Link>
              )}
            </div>
            <span className="contact">
              {phoneHref && (
                <a href={phoneHref}>
                  Call {settings.phoneDisplay || `+${settings.whatsapp}`}
                </a>
              )}
              {textHref && (
                <a href={textHref}>Text Us</a>
              )}
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
