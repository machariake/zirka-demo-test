import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { getSettings, getFeatures } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { WHATSAPP_GREETING, whatsappUrl } from "@/lib/contact";
import { SocialIcon } from "@/components/Icons";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description:
    "Get in touch with Zirka Digital Solutions. Tell us what you're trying to solve, or request a free marketing audit.",
  path: "/contact",
});

export default async function ContactPage() {
  const [settings, features] = await Promise.all([getSettings(), getFeatures()]);

  const digits = settings.whatsapp;
  const whatsapp = whatsappUrl(digits, WHATSAPP_GREETING) ?? "/contact";

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <PageHeader
        eyebrow="Contact"
        title="Let's talk about your marketing."
        lede="Choose whichever suits you: a free audit of your current marketing, a call with a strategist, or a message on WhatsApp. You'll talk directly with a Zirka strategist."
      />

      {/* The three routes from brief §15, in order of how much we learn up front. */}
      <section className="section--flow contact-routes-section">
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
                  : "Message us to arrange a call at a time that suits you."}
              </p>
              {features.bookingEnabled ? (
                <Link className="btn btn-outline" href="/book">
                  Book a call
                </Link>
              ) : (
                <a className="btn btn-outline" href={whatsapp} target="_blank" rel="noopener noreferrer">
                  Arrange a call
                </a>
              )}
            </article>
            <article className="contact-route">
              <h2>Contact via WhatsApp</h2>
              <p>Message us and talk directly with a Zirka strategist.</p>
              <a className="btn btn-outline" href={whatsapp} target="_blank" rel="noopener noreferrer">
                Message {settings.phoneDisplay || `+${digits}`}
              </a>
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
                The message form is closed at the moment — please use WhatsApp or the details
                alongside.
              </p>
            )}
          </div>
          <div className="contact-info">
            <h2 className="index-heading">Contact details</h2>
            <div className="info-block">
              <h3>WhatsApp</h3>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                {settings.phoneDisplay || `+${digits}`}
              </a>
            </div>
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
