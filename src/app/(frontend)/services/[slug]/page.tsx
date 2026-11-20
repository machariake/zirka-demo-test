import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CtaBand from "@/components/CtaBand";
import WorkCard from "@/components/WorkCard";
import ProjectCard from "@/components/ProjectCard";
import JsonLd from "@/components/JsonLd";
import VideoEmbed, { hasVideo } from "@/components/VideoEmbed";
import { CheckIcon, ArrowIcon, WhatsAppIcon } from "@/components/Icons";
import {
  getService,
  getServices,
  getServiceSitemap,
  getSettings,
  getSolutionCategories,
  getProcessSteps,
  getFeatures,
} from "@/lib/cms";
import { whatsappUrl } from "@/lib/contact";
import { relatedServices } from "@/lib/related";
import ServiceCard from "@/components/ServiceCard";
import ShareButton from "@/components/ShareButton";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

/** Build every service page up front; there are a few dozen at most. */
export async function generateStaticParams() {
  const services = await getServiceSitemap();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service not found" };
  // The one-line summary alone is often under 70 characters — too thin for a
  // search snippet — so shorter ones gain a line on who delivers it.
  const description =
    service.short.length < 100
      ? `${service.short} From Zirka Digital Solutions — start with a free marketing audit.`
      : `${service.short} From Zirka Digital Solutions.`;
  return pageMeta({ title: service.name, description, path: `/services/${service.slug}`, image: service.image });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, settings, all, categories, steps, features] = await Promise.all([
    getService(slug),
    getSettings(),
    getServices(),
    getSolutionCategories(),
    getProcessSteps(),
    getFeatures(),
  ]);
  if (!service) notFound();

  const whatsapp = features.showWhatsApp
    ? whatsappUrl(settings.whatsapp, `Hi Zirka, I'd like to talk about ${service.name}.`)
    : null;

  const related = relatedServices(service.slug, categories, all);
  const hasRealWork = service.relatedWork.some((w) => !w.sample);
  const paras = (text: string) =>
    text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

  return (
    <>
      <JsonLd data={serviceSchema(service, settings.companyName)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ])}
      />
      {service.faqs.length > 0 && <JsonLd data={faqSchema(service.faqs)} />}

      <div className={`service-hero ${service.plate}`}>
        <Image
          className="service-hero__photo"
          src={service.image}
          alt={service.alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
        <div className="wrap">
          <Header />
          <div className="service-hero__inner">
            <Link className="case-back" href="/services">
              <ArrowIcon /> All services
            </Link>
            <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
              {service.core ? "Core service" : "Service"}
            </span>
            <h1>{service.name}</h1>
            <p className="lede">{service.short}</p>
            {/* The audit is the primary action (brief §21); a quote stays available for
                someone who already knows they want this service. */}
            <div className="hero-ctas">
              <Link className="btn btn-gold" href="/free-marketing-audit" data-track="main_cta_click">
                Get a Free Marketing Audit
              </Link>
              <Link className="btn btn-ghost" href={`/quote?service=${service.slug}`}>
                Get a quote for this service
              </Link>
              <ShareButton
                title={service.name}
                text={service.short}
                path={`/services/${service.slug}`}
                variant="compact"
                align="left"
                label="Share service"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brief §21: problem, solution, what's included, process, proof, FAQ, related. */}
      <section className="section--flow">
        <div className="wrap service-layout">
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
              <h2>Our solution</h2>
              {paras(service.description).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {service.outcomes && <div className="outcome">{service.outcomes}</div>}
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

            {service.slug === "social-media-management" && (
              <div className="service-page__block">
                <h2>Packages &amp; pricing</h2>
                <ul className="project-price-list">
                  <li>
                    <span className="project-price-list__name">Starter Visibility</span>
                    <span className="project-price-list__actions">
                      <span className="project-price-list__price">$299/mo</span>
                      <a
                        className="btn btn-gold project-price-list__cta"
                        href="https://buy.stripe.com/aFacN79gD9rSbLBejz1gs02"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="pricing_cta_click"
                      >
                        Buy now
                        <ArrowIcon />
                      </a>
                      <ShareButton
                        title="Starter Visibility ($299/mo)"
                        text="Social Media Management — Starter Visibility plan at $299/mo"
                        path="/pricing#plan-starter-visibility"
                        checkoutUrl="https://buy.stripe.com/aFacN79gD9rSbLBejz1gs02"
                        variant="icon"
                      />
                    </span>
                  </li>
                  <li>
                    <span className="project-price-list__name">Business Growth</span>
                    <span className="project-price-list__actions">
                      <span className="project-price-list__price">$599/mo</span>
                      <a
                        className="btn btn-gold project-price-list__cta"
                        href="https://buy.stripe.com/dRm00lgJ57jK3f50sJ1gs01"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="pricing_cta_click"
                      >
                        Buy now
                        <ArrowIcon />
                      </a>
                      <ShareButton
                        title="Business Growth ($599/mo)"
                        text="Social Media Management — Business Growth plan at $599/mo"
                        path="/pricing#plan-business-growth"
                        checkoutUrl="https://buy.stripe.com/dRm00lgJ57jK3f50sJ1gs01"
                        variant="icon"
                      />
                    </span>
                  </li>
                  <li>
                    <span className="project-price-list__name">Premium Digital Growth</span>
                    <span className="project-price-list__actions">
                      <span className="project-price-list__price">$900/mo</span>
                      <a
                        className="btn btn-gold project-price-list__cta"
                        href="https://buy.stripe.com/8x200lakH7jKbLB4IZ1gs00"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="pricing_cta_click"
                      >
                        Buy now
                        <ArrowIcon />
                      </a>
                      <ShareButton
                        title="Premium Digital Growth ($900/mo)"
                        text="Social Media Management — Premium Digital Growth plan at $900/mo"
                        path="/pricing#plan-premium-digital-growth"
                        checkoutUrl="https://buy.stripe.com/8x200lakH7jKbLB4IZ1gs00"
                        variant="icon"
                      />
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {service.slug === "website-development" && (
              <div className="service-page__block">
                <h2>Packages &amp; pricing</h2>
                <ul className="project-price-list">
                  <li>
                    <span className="project-price-list__name">Landing Page</span>
                    <span className="project-price-list__actions">
                      <span className="project-price-list__price">$997</span>
                      <a
                        className="btn btn-gold project-price-list__cta"
                        href="https://buy.stripe.com/4gM7sN3WjeMc7vl2AR1gs06"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="pricing_cta_click"
                      >
                        Buy now
                        <ArrowIcon />
                      </a>
                      <ShareButton
                        title="Landing Page ($997)"
                        text="Custom high-converting Landing Page package at $997"
                        path="/pricing#pkg-landing-page"
                        checkoutUrl="https://buy.stripe.com/4gM7sN3WjeMc7vl2AR1gs06"
                        variant="icon"
                      />
                    </span>
                  </li>
                  <li>
                    <span className="project-price-list__name">Business Website (3–5 pages)</span>
                    <span className="project-price-list__actions">
                      <span className="project-price-list__price">$2,000</span>
                      <a
                        className="btn btn-gold project-price-list__cta"
                        href="https://buy.stripe.com/3cI9AV64r47y6rh2AR1gs05"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="pricing_cta_click"
                      >
                        Buy now
                        <ArrowIcon />
                      </a>
                      <ShareButton
                        title="Business Website (3–5 pages) — $2,000"
                        text="Business Website (3–5 custom pages) package at $2,000"
                        path="/pricing#pkg-business-website-3-5-pages"
                        checkoutUrl="https://buy.stripe.com/3cI9AV64r47y6rh2AR1gs05"
                        variant="icon"
                      />
                    </span>
                  </li>
                  <li>
                    <span className="project-price-list__name">Large Business Website (6–10 pages)</span>
                    <span className="project-price-list__actions">
                      <span className="project-price-list__price">$4,000</span>
                      <a
                        className="btn btn-gold project-price-list__cta"
                        href="https://buy.stripe.com/fZudRb1Ob8nO9Dtdfv1gs04"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="pricing_cta_click"
                      >
                        Buy now
                        <ArrowIcon />
                      </a>
                      <ShareButton
                        title="Large Business Website (6–10 pages) — $4,000"
                        text="Large Business Website (6–10 custom pages) package at $4,000"
                        path="/pricing#pkg-large-business-website-6-10-pages"
                        checkoutUrl="https://buy.stripe.com/fZudRb1Ob8nO9Dtdfv1gs04"
                        variant="icon"
                      />
                    </span>
                  </li>
                  <li>
                    <span className="project-price-list__name">Website Care</span>
                    <span className="project-price-list__actions">
                      <span className="project-price-list__price">$129/mo</span>
                      <a
                        className="btn btn-gold project-price-list__cta"
                        href="https://buy.stripe.com/cNi3cx3WjfQgg1R5N31gs03"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="pricing_cta_click"
                      >
                        Buy now
                        <ArrowIcon />
                      </a>
                      <ShareButton
                        title="Website Care ($129/mo)"
                        text="Monthly Website Care & maintenance plan at $129/mo"
                        path="/pricing#pkg-website-care"
                        checkoutUrl="https://buy.stripe.com/cNi3cx3WjfQgg1R5N31gs03"
                        variant="icon"
                      />
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {hasVideo(service.video) && (
              <div className="service-page__block">
                <VideoEmbed video={service.video} title={service.video.title} />
              </div>
            )}
          </div>

          {/* Stays in view beside the long-form content, so the next step is never a scroll away. */}
          <aside className="service-aside" aria-labelledby="service-aside-heading">
            <div className="service-aside__card">
              <span className="eyebrow">Next step</span>
              <h2 id="service-aside-heading">Not sure {service.name} is the right fit?</h2>
              <p>
                Start with a free marketing audit. We&rsquo;ll review what you have now and tell you
                honestly whether this service is where you&rsquo;ll see the biggest difference.
              </p>
              <Link className="btn btn-gold" href="/free-marketing-audit" data-track="main_cta_click">
                Get a Free Marketing Audit
              </Link>
              <Link className="btn btn-outline" href={`/quote?service=${service.slug}`}>
                Get a quote
              </Link>
              {whatsapp && (
                <a className="service-aside__direct" href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  Ask a strategist on WhatsApp
                </a>
              )}
              <ShareButton
                title={service.name}
                text={service.short}
                path={`/services/${service.slug}`}
                variant="bar"
              />
            </div>
          </aside>
        </div>
      </section>

      {steps.length > 0 && (
        <section className="section--panel">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Our process</span>
                <h2>How we&rsquo;ll work on it.</h2>
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

      {service.relatedProjects.length > 0 && (
        <section className="section--flow">
          <div className="wrap">
            <h2 className="index-heading">Projects we&rsquo;ve delivered</h2>
            <div className="project-grid">
              {service.relatedProjects.map((item) => (
                <ProjectCard item={item} key={item.slug} />
              ))}
            </div>
          </div>
        </section>
      )}

      {service.relatedWork.length > 0 && (
        <section className="section--flow">
          <div className="wrap">
            <h2 className="index-heading">{hasRealWork ? "Proof" : "Related concept projects"}</h2>
            <div className="work-grid wide">
              {service.relatedWork.map((item) => (
                <WorkCard item={item} key={item.slug} />
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
                <h2>About {service.name}.</h2>
              </div>
            </div>
            <div className="faq-list">
              {service.faqs.map((f, i) => (
                <details key={f.q} name={`faq-${service.slug}`} open={i === 0}>
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

      {related.length > 0 && (
        <section className="section--flow">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Related services</span>
                <h2>Often paired with {service.name}.</h2>
              </div>
            </div>
            <div className="service-grid">
              {related.map((r) => (
                <ServiceCard service={r} key={r.slug} />
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <Link className="btn btn-outline" href="/services">
                See all {all.length} services
              </Link>
            </div>
          </div>
        </section>
      )}

      <CtaBand heading={`Ready to get started with ${service.name}?`} />
    </>
  );
}
