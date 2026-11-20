import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import StarField from "@/components/StarField";
import { WhatsAppIcon } from "@/components/Icons";
import SolutionCategories from "@/components/SolutionCategories";
import WhoWeHelp from "@/components/WhoWeHelp";
import WorkCard from "@/components/WorkCard";
import WorkFeature from "@/components/WorkFeature";
import ProjectCard from "@/components/ProjectCard";
import Testimonial from "@/components/Testimonial";
import VideoSection from "@/components/VideoSection";
import Engagements from "@/components/Engagements";
import HeroPackagesHook, { type QuickPackage } from "@/components/HeroPackagesHook";
import Faq from "@/components/Faq";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import {
  faqSchema,
  organizationSchema,
  pricingCatalogSchema,
  servicesCatalogSchema,
  websiteSchema,
} from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import { WHATSAPP_GREETING, whatsappUrl } from "@/lib/contact";
import {
  getServices,
  getCaseStudies,
  getSettings,
  getProcessSteps,
  getFeatures,
  getSolutionCategories,
  getProjects,
  getEngagements,
  getProjectPricing,
  getFaqs,
} from "@/lib/cms";

export const metadata: Metadata = pageMeta({
  description:
    "Zirka Digital Solutions is a full-service digital marketing agency offering social media management from $299/mo, custom websites from $997, SEO, ads, and AI automation.",
  path: "/",
  keywords: [
    "digital marketing agency",
    "social media management packages",
    "business website design",
    "local SEO agency",
    "Meta and Google Ads agency",
  ],
});

/** Split the headline so the emphasised word can carry the accent colour. */
function Headline({ text, emphasis }: { text: string; emphasis: string }) {
  if (!emphasis || !text.toLowerCase().includes(emphasis.toLowerCase())) return <h1>{text}</h1>;
  const at = text.toLowerCase().indexOf(emphasis.toLowerCase());
  return (
    <h1>
      {text.slice(0, at)}
      <em>{text.slice(at, at + emphasis.length)}</em>
      {text.slice(at + emphasis.length)}
    </h1>
  );
}

export default async function Home() {
  const [settings, services, work, steps, features, categories, projects, engagements, projectPrices, faqs] =
    await Promise.all([
      getSettings(),
      getServices(),
      getCaseStudies(),
      getProcessSteps(),
      getFeatures(),
      getSolutionCategories(),
      getProjects({ featured: true, limit: 3 }),
      getEngagements(),
      getProjectPricing(),
      getFaqs(),
    ]);

  const placed = new Set(categories.flatMap((c) => c.services.map((s) => s.slug)));
  const uncategorised = services.filter((s) => !placed.has(s.slug));

  // Only claim results when there is real, documented client work to show.
  const hasRealWork = work.some((w) => !w.sample);
  const whatsapp = features.showWhatsApp ? whatsappUrl(settings.whatsapp, WHATSAPP_GREETING) : null;

  const toAnchor = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const quickSocial: QuickPackage[] = engagements
    .filter((e) => Boolean(e.checkoutUrl))
    .map((e) => ({
      name: e.name,
      price: `${e.price}/mo`,
      sublabel: e.includes.slice(0, 2).join(" · ") || e.summary,
      checkoutUrl: e.checkoutUrl,
      anchor: `#plan-${toAnchor(e.name)}`,
      featured: e.featured,
    }));

  const quickWebsites: QuickPackage[] = projectPrices
    .filter((p) => Boolean(p.checkoutUrl))
    .map((p) => ({
      name: p.name,
      price: p.price,
      sublabel: p.price.toLowerCase().includes("/mo")
        ? "Backups, security & monthly updates"
        : "Custom design, mobile-ready & SEO",
      checkoutUrl: p.checkoutUrl,
      anchor: `#pkg-${toAnchor(p.name)}`,
      featured: p.name.toLowerCase().includes("3–5") || p.name.toLowerCase().includes("3-5"),
    }));

  const showHeroHook = features.showPricing && (quickSocial.length > 0 || quickWebsites.length > 0);

  return (
    <>
      {/* The business record every other page's schema points back at. */}
      <JsonLd data={organizationSchema(settings)} />
      <JsonLd data={websiteSchema(settings.companyName)} />
      {services.length > 0 && <JsonLd data={servicesCatalogSchema(services)} />}
      {features.showPricing && (engagements.length > 0 || projectPrices.length > 0) && (
        <JsonLd data={pricingCatalogSchema(engagements, projectPrices)} />
      )}
      {features.showFaq && faqs.length > 0 && <JsonLd data={faqSchema(faqs)} />}

      {/* 1 — Hook: who we are and the one line that matters */}
      <div className="hero">
        <Image
          className="hero-photo"
          src={settings.heroImage}
          alt={settings.heroAlt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
        <StarField />
        <div className="wrap">
          <Header />
          <div className={showHeroHook ? "hero-grid" : undefined}>
            <div className="hero-inner">
              <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
                {settings.descriptor}
              </span>
              <Headline text={settings.heroHeadline} emphasis={settings.heroEmphasis} />
              <p className="lede">{settings.heroLede}</p>
              {/* One filled button, one quiet one; WhatsApp is a link, not a rival CTA (brief §2). */}
              <div className="hero-ctas">
                <Link className="btn btn-gold" href="/free-marketing-audit" data-track="main_cta_click">
                  Get a Free Marketing Audit
                </Link>
                {features.showPricing ? (
                  <a className="btn btn-ghost" href="#pricing">
                    See Packages &amp; Prices
                  </a>
                ) : (
                  <Link className="btn btn-ghost" href="/work">
                    See Our Work
                  </Link>
                )}
              </div>
              {whatsapp && (
                <a
                  className="hero-direct"
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon />
                  Or talk directly with a strategist on WhatsApp
                </a>
              )}
              {features.showStats && settings.stats.length > 0 && (
                <div className="stat-strip">
                  {settings.stats.map((s) => (
                    <div className="stat" key={s.label}>
                      <span className="num">{s.num}</span>
                      <span className="label">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showHeroHook && (
              <HeroPackagesHook socialPlans={quickSocial} websitePackages={quickWebsites} />
            )}
          </div>
        </div>
      </div>

      {/* 2 — Genuine proof only: switched off until there is real proof to show */}
      {features.showTrustedBy && settings.trustedBy.length > 0 && (
        <div className="trusted">
          <div className="wrap trusted-row">
            <span className="trusted-label">Trusted by growing brands &mdash;</span>
            <div className="trusted-names">
              {settings.trustedBy.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/*
       * Order follows brief §33: what we do → why trust us → what we offer →
       * proof → process → pricing → objections → conversion.
       */}

      {/* 3 — Four solution categories (brief §5); the full catalogue is on /services */}
      {features.showServices && categories.length > 0 && (
        <section id="services">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">What we do</span>
                <h2>Everything You Need to Grow Digitally.</h2>
              </div>
              <p>
                Four ways we help, each built from the services underneath it. Take one, or combine
                them into a single plan.
              </p>
            </div>
            <SolutionCategories categories={categories} />
            {/* A service not placed in any category still shows, so the homepage lists all of them. */}
            {uncategorised.length > 0 && (
              <p style={{ marginTop: 24 }}>
                Also available:{" "}
                {uncategorised.map((s, i) => (
                  <span key={s.slug}>
                    {i > 0 && ", "}
                    <Link href={`/services/${s.slug}`}>{s.name}</Link>
                  </span>
                ))}
              </p>
            )}
            <div style={{ marginTop: 32 }}>
              <Link className="btn btn-outline" href="/services">
                See all {services.length} services
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4a — Delivered client projects the owner has marked for the homepage */}
      {features.showWork && projects.length > 0 && (
        <section id="projects" className="section--flow">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Recent projects</span>
                <h2>Work we&rsquo;ve delivered.</h2>
              </div>
              <p>Websites, brands and campaigns we&rsquo;ve built for real clients.</p>
            </div>
            <div className="project-grid">
              {projects.map((item) => (
                <ProjectCard item={item} key={item.slug} />
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <Link className="btn btn-outline" href="/work">
                See all our work
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4 — Selected work: real client work, or clearly labelled concepts */}
      {features.showWork && work.length > 0 && (
        <section id="work" className="section--flow">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Selected work</span>
                <h2>{hasRealWork ? "Results, not just reach." : "How we approach the work."}</h2>
              </div>
              <p>
                {hasRealWork
                  ? "Client work and the numbers behind it. Anything marked Concept Project shows our thinking, not a client result."
                  : "Concept projects showing the strategy and creative direction we bring. They are not client work and claim no results."}
              </p>
            </div>
            <WorkFeature item={work[0]} />
            <div className="work-grid wide">
              {work.slice(1, 4).map((item) => (
                <WorkCard item={item} key={item.name} />
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <Link className="btn btn-outline" href="/work">
                View all work
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Only renders when a video has been set. */}
      <VideoSection />

      {/* 5 — Who we help */}
      {features.showWhoWeHelp && (
        <WhoWeHelp
          heading={settings.whoWeHelp.heading}
          body={settings.whoWeHelp.body}
          industries={settings.whoWeHelp.industries}
        />
      )}

      {/* 6 — How we work */}
      {features.showProcess && steps.length > 0 && (
        <section id="approach" className="section--panel">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">How we work</span>
                <h2>The same route, every time.</h2>
              </div>
              <p>
                Five stages on every engagement &mdash; from the first audit to reporting clearly
                and scaling what works.
              </p>
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

      {/* 7 — Pricing */}
      {features.showPricing && <Engagements withProjects />}

      {/* 8 — Testimonials: only genuine ones, and only when one is published */}
      {features.showTestimonial && <Testimonial />}

      {/* 9 — FAQ */}
      {features.showFaq && <Faq />}

      {/* 10 — Free Marketing Audit */}
      <CtaBand />
    </>
  );
}
