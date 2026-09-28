import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import CtaBand from "@/components/CtaBand";
import TeamSection from "@/components/TeamSection";
import { getTeam, getValues, getFeatures, getSettings } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "Who Zirka Digital Solutions is, how we work and what we stand for: a digital marketing agency for growing businesses.",
  path: "/about",
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

      <CtaBand heading="Want to work together?" />
    </>
  );
}
