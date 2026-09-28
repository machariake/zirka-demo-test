import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AuditForm from "@/components/AuditForm";
import LanguageMenu from "@/components/LanguageMenu";
import { CheckIcon, WhatsAppIcon } from "@/components/Icons";
import { getFeatures, getProcessSteps, getService, getServiceSitemap, getSettings } from "@/lib/cms";
import { whatsappUrl } from "@/lib/contact";

/**
 * Ad landing pages: one per service, built from the same content as the
 * service page, for paid campaigns (e.g. /lp/seo-online-visibility?utm_source=facebook).
 *
 * No main navigation, so the only way forward is the audit form at the top, a
 * WhatsApp message, or the legal links in the footer. The audit form already
 * records the campaign tags and this page's address on every request.
 *
 * Kept out of search results: the service page is the one meant to rank, and
 * two near-identical pages would compete with each other.
 */

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await getServiceSitemap();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Page not found", robots: { index: false } };
  return {
    title: `${service.name} — Free Marketing Audit`,
    description: service.short,
    robots: { index: false, follow: false },
  };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const [service, settings, features, steps] = await Promise.all([
    getService(slug),
    getSettings(),
    getFeatures(),
    getProcessSteps(),
  ]);
  if (!service) notFound();

  const whatsapp = features.showWhatsApp
    ? whatsappUrl(settings.whatsapp, `Hi Zirka, I saw your ${service.name} page and I'd like to talk.`)
    : null;
  const paras = (text: string) =>
    text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

  return (
    <>
      <div className="lp-hero">
        <div className="wrap">
          {/* Logo and a direct line only: no menu to wander off into. */}
          <header className="site lp-bar">
            <div className="navrow">
              <Link className="wordmark notranslate" translate="no" href="/">
                <Image
                  className="mark"
                  src="/images/logo-mark.png"
                  alt=""
                  width={55}
                  height={38}
                  loading="eager"
                  fetchPriority="high"
                />
                <span className="lockup">
                  <span className="name">Zirka</span> <span className="sub">Digital Solutions</span>
                </span>
              </Link>
              <div className="nav-right">
                {features.translateEnabled && <LanguageMenu />}
                {whatsapp && (
                  <a
                    className="btn btn-ghost lp-bar__wa"
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon />
                    <span>{settings.phoneDisplay || "WhatsApp us"}</span>
                  </a>
                )}
              </div>
            </div>
          </header>
          <span id="content" tabIndex={-1} className="skip-target" />

          <div className="lp-hero__grid">
            <div className="lp-hero__copy">
              <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
                {service.name}
              </span>
              <h1>{service.short}</h1>
              {service.outcomes && <p className="lede">{service.outcomes}</p>}
              <ul className="lp-hero__points">
                <li>
                  <CheckIcon /> Free, with no obligation
                </li>
                <li>
                  <CheckIcon /> Reviewed by a strategist, not an automated scan
                </li>
                <li>
                  <CheckIcon /> Plain-language priorities you can act on
                </li>
              </ul>
            </div>

            <div className="lp-hero__form audit__form" id="lp-form">
              <h2>Get your free marketing audit</h2>
              {features.contactFormEnabled ? (
                <AuditForm />
              ) : (
                <p className="form-error" role="status">
                  Audit requests are paused at the moment.{" "}
                  {whatsapp && (
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                      Message us on WhatsApp
                    </a>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="section--flow">
        <div className="wrap">
          <div className="service-page">
            {service.problem && (
              <div className="service-page__block service-page__intro">
                <h2>The problem</h2>
                {paras(service.problem).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            <div className="service-page__block service-page__intro">
              <h2>How we fix it</h2>
              {paras(service.description).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {service.capabilities.length > 0 && (
              <div className="service-page__block">
                <h2>What&rsquo;s included</h2>
                <ul className="capability-list">
                  {service.capabilities.map((cap) => (
                    <li key={cap}>
                      <span className="capability-mark">
                        <CheckIcon />
                      </span>
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {steps.length > 0 && (
        <section className="section--panel">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">How we work</span>
                <h2>From audit to results.</h2>
              </div>
            </div>
            <div className="approach">
              {steps.map((step) => (
                <div className="step" key={step.name}>
                  <span className="idx">{step.idx}</span>
                  <h3>{step.name}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {service.faqs.length > 0 && (
        <section className="section--flow">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Questions</span>
                <h2>Before you ask.</h2>
              </div>
            </div>
            <div className="faq-list">
              {service.faqs.map((f, i) => (
                <details key={f.q} name={`lp-faq-${service.slug}`} open={i === 0}>
                  <summary>
                    {f.q}
                    <span className="faq-icon" aria-hidden="true" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section--flow">
        <div className="wrap">
          <div className="cta-band">
            <h2>Find out where your marketing can do more.</h2>
            <div className="right">
              <div className="cta-actions">
                <a className="btn btn-gold" href="#lp-form" data-track="main_cta_click">
                  Get my free audit
                </a>
                {whatsapp && (
                  <a className="btn btn-ghost" href={whatsapp} target="_blank" rel="noopener noreferrer">
                    Talk on WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
