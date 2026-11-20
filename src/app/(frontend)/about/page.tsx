import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import CtaBand from "@/components/CtaBand";
import TeamSection from "@/components/TeamSection";
import { getTeam, getValues, getFeatures, getSettings } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

const ABOUT_DESCRIPTION =
  "Learn how Zirka Digital Solutions helps growing businesses turn clicks into customers with senior-led SEO, social media management, websites, ads, and automation.";

export const metadata: Metadata = pageMeta({
  title: "About",
  description: ABOUT_DESCRIPTION,
  path: "/about",
  keywords: ["about Zirka Digital Solutions", "digital marketing agency team", "growth marketing agency"],
});

export default async function AboutPage() {
  const [team, values, features, settings] = await Promise.all([
    getTeam(),
    getValues(),
    getFeatures(),
    getSettings(),
  ]);

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: "About | Zirka Digital Solutions",
          description: ABOUT_DESCRIPTION,
          path: "/about",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <PageHeader eyebrow="About Zirka" title={settings.aboutTitle} lede={settings.aboutLede} />

      {settings.story.length > 0 && (
        <section>
          <div className="wrap story">
            <div>
              <span className="eyebrow">Our story</span>
              <h2 style={{ marginTop: 10, marginBottom: 18, fontSize: "clamp(1.6rem,3vw,2.2rem)" }}>
                {settings.storyHeading}
              </h2>
              {settings.story.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="story-plate">
              <Image
                src={settings.storyImage}
                alt={settings.storyAlt}
                fill
                sizes="(max-width: 860px) 100vw, 45vw"
              />
            </div>
          </div>
        </section>
      )}

      {features.showValues && values.length > 0 && (
        <section className={settings.story.length > 0 ? "section--flow" : undefined}>
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">How we think</span>
                <h2>What we stand by.</h2>
              </div>
            </div>
            <div className="approach values">
              {values.map((value) => (
                <div className="step" key={value.name}>
                  <h3 style={{ marginTop: 0 }}>{value.name}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {features.showLeadership && <TeamSection team={team} />}

      <section className="section--panel">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Why Zirka</span>
              <h2>One connected growth system instead of disconnected vendors.</h2>
            </div>
            <p>
              Most agencies specialize in one silo — running ads to a slow website, or posting on
              social media with no lead capture. We build the entire customer journey together.
            </p>
          </div>
          <div className="approach">
            <div className="step">
              <span className="idx">01</span>
              <h3>Search &amp; Local Visibility</h3>
              <p>
                Technical SEO, on-page optimization, and Google Business Profile management so high-intent
                buyers find your business first on Google Search and Google Maps.
              </p>
            </div>
            <div className="step">
              <span className="idx">02</span>
              <h3>Social Media &amp; Content</h3>
              <p>
                Consistent, branded content across Instagram, Facebook, LinkedIn, and TikTok paired with
                paid social campaigns designed to generate real enquiries.
              </p>
            </div>
            <div className="step">
              <span className="idx">03</span>
              <h3>High-Converting Websites</h3>
              <p>
                Fast, mobile-first landing pages and business websites engineered for speed, clear
                messaging, and effortless Stripe checkout or lead capture.
              </p>
            </div>
            <div className="step">
              <span className="idx">04</span>
              <h3>WhatsApp &amp; AI Automation</h3>
              <p>
                Automated response workflows and lead qualification systems that answer questions within
                seconds, capture after-hours prospects, and book calls directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand heading="Want to work together?" />
    </>
  );
}
