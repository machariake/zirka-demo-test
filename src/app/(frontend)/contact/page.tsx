import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { getSettings, getFeatures } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { SMS_GREETING, WHATSAPP_GREETING, smsUrl, telUrl, whatsappUrl } from "@/lib/contact";
import { PhoneIcon, SmsIcon, SocialIcon, WhatsAppIcon } from "@/components/Icons";

const CONTACT_DESCRIPTION =
  "Contact Zirka Digital Solutions in Atlanta, Georgia for social media management, SEO, websites, or a free marketing audit via phone, text, WhatsApp, or email.";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description: CONTACT_DESCRIPTION,
  path: "/contact",
  keywords: [
    "contact Zirka Digital Solutions",
    "Atlanta digital marketing agency",
    "free marketing audit",
  ],
});

export default async function ContactPage() {
  const [settings, features] = await Promise.all([getSettings(), getFeatures()]);

  const digits = settings.whatsapp;
  const whatsapp = whatsappUrl(digits, WHATSAPP_GREETING) ?? "/contact";
  const phoneHref = telUrl(digits);
  const textHref = smsUrl(digits, SMS_GREETING);

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: "Contact | Zirka Digital Solutions",
          description: CONTACT_DESCRIPTION,
          path: "/contact",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <PageHeader
        eyebrow="Contact · Atlanta, Georgia"
        title="Let's talk about your marketing."
        lede="Choose whichever works best for you: request a free marketing audit, book a strategy call, or call, text, or WhatsApp our Atlanta, Georgia team directly."
      />

      {/* The three routes from brief §15, in order of how much we learn up front. */}
      <section className="section--cream contact-routes-section" style={{ paddingBottom: 64 }}>
        <div className="wrap">
          <div className="contact-routes">
            <article className="contact-route contact-route--primary">
              <h2>Request a Free Marketing Audit</h2>
              <p>
                We review your website and current marketing, then send you the biggest
                opportunities we find. Free, with no obligation.
              </p>
              <Link className="btn btn-gold" href="/free-marketing-audit" data-track="main_cta_click">
                Get a Free Marketing Audit
              </Link>
            </article>
            <article className="contact-route">
              <h2>Talk to a Strategist</h2>
              <p>
                {features.bookingEnabled
                  ? "Book a free 30-minute call at a time that suits you."
                  : "Call or text us to arrange a call at a time that suits you."}
              </p>
              {features.bookingEnabled ? (
                <Link className="btn btn-outline" href="/book">
                  Book a call
                </Link>
              ) : (
                <a className="btn btn-outline" href={phoneHref ?? whatsapp}>
                  <PhoneIcon />
                  Call {settings.phoneDisplay || `+${digits}`}
                </a>
              )}
            </article>
            <article className="contact-route">
              <h2>Call, Text, or WhatsApp</h2>
              <p>Reach our Atlanta, Georgia studio directly by phone call, SMS text, or WhatsApp.</p>
              <div className="contact-route__actions">
                {phoneHref && (
                  <a className="btn btn-gold" href={phoneHref}>
                    <PhoneIcon />
                    Call
                  </a>
                )}
                {textHref && (
                  <a className="btn btn-outline" href={textHref}>
                    <SmsIcon />
                    Text Us
                  </a>
                )}
                {features.showWhatsApp && (
                  <a className="btn btn-outline" href={whatsapp} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap contact-grid">
          <div>
            <h2 className="index-heading">Or send us a message</h2>
            {features.contactFormEnabled ? (
              <ContactForm />
            ) : (
              <p className="success-note">
                The message form is closed at the moment — please call, text, or email us using the
                details alongside.
              </p>
            )}
          </div>
          <div className="contact-info">
            <h2 className="index-heading">Contact details</h2>
            <div className="info-block">
              <h3>Location</h3>
              <p>Atlanta, Georgia, USA (Serving businesses nationwide &amp; worldwide)</p>
            </div>
            {phoneHref && (
              <div className="info-block">
                <h3>Call or Text</h3>
                <p>
                  <a href={phoneHref}>{settings.phoneDisplay || `+${digits}`}</a>
                  {textHref && (
                    <>
                      {" "}
                      &middot; <a href={textHref}>Text Us (SMS)</a>
                    </>
                  )}
                </p>
              </div>
            )}
            {features.showWhatsApp && (
              <div className="info-block">
                <h3>WhatsApp</h3>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  Message on WhatsApp
                </a>
              </div>
            )}
            {settings.email && (
              <div className="info-block">
                <h3>Email</h3>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </div>
            )}
            {settings.social.length > 0 ? (
              <div className="info-block">
                <h3>Social</h3>
                <ul className="contact-social">
                  {settings.social.map((s) => (
                    <li key={s.network}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        <SocialIcon network={s.network} />
                        {s.network}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              settings.socialHandle && (
                <div className="info-block">
                  <h3>Social</h3>
                  <p>
                    Facebook &amp; Instagram
                    <br />
                    {settings.socialHandle}
                  </p>
                </div>
              )
            )}
            {settings.hours && (
              <div className="info-block">
                <h3>Hours</h3>
                <p>{settings.hours}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
