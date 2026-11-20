import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CtaBand from "@/components/CtaBand";
import { ArrowIcon } from "@/components/Icons";
import { getCaseStudy } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return { title: "Case study not found" };
  return pageMeta({
    title: study.sample ? `${study.name} — Featured Project` : `${study.name} — ${study.metric}`,
    description: study.summary,
    path: `/work/${study.slug}`,
    image: study.heroImage,
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  // Show the stored result strip, or fall back to the card's headline number.
  const results = study.sample
    ? []
    : study.results.length > 0
      ? study.results
      : [{ value: study.metric, label: study.category }];

  /** A prose section, skipped entirely when the team has not written that part yet. */
  const chapter = (heading: string, body: string) => {
    const paragraphs = body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paragraphs.length === 0) return null;
    return (
      <div className="case-chapter">
        <h2>{heading}</h2>
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    );
  };

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: study.name, path: `/work/${study.slug}` },
        ])}
      />
      <div className={`case-hero ${study.plate}`}>
        <Image
          className="case-hero__photo"
          src={study.heroImage}
          alt={study.alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
        <div className="wrap">
          <Header />
          <div className="case-hero__inner">
            <Link className="case-back" href="/work">
              <ArrowIcon /> All work
            </Link>
            <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
              {study.category}
            </span>
            <h1>{study.name}</h1>
            <p className="lede">{study.summary}</p>
          </div>
        </div>
      </div>

      <section className="section--flow">
        <div className="wrap">
          <div className="case-body">
            {chapter(study.sample ? "Project brief" : "Client challenge", study.challenge)}
            {chapter(study.sample ? "Our approach" : "Zirka solution", study.approach)}

            {study.servicesUsed.length > 0 && (
              <div className="case-chapter">
                <h2>{study.sample ? "Services involved" : "Services provided"}</h2>
                <div className="tags">
                  {study.servicesUsed.map((s) => (
                    <Link className="tag" key={s.slug} href={`/services/${s.slug}`}>
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!study.sample && study.timeframe && (
              <div className="case-chapter">
                <h2>Timeframe</h2>
                <p>{study.timeframe}</p>
              </div>
            )}

            {!study.sample && (
              <div className="case-chapter">
                <h2>Results</h2>
                {study.outcome
                  .split(/\n\s*\n/)
                  .map((para) => para.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                <dl className="case-results">
                  {results.map((r) => (
                    <div key={`${r.value}-${r.label}`}>
                      <dt>{r.label}</dt>
                      <dd>{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {!study.sample && study.testimonial && (
              <div className="case-chapter">
                <h2>In their words</h2>
                <blockquote className="case-quote">
                  <p>&ldquo;{study.testimonial.quote}&rdquo;</p>
                  {study.testimonial.attribution && <cite>{study.testimonial.attribution}</cite>}
                </blockquote>
              </div>
            )}
          </div>
        </div>
      </section>

      <CtaBand heading={study.sample ? "Want work like this?" : "Want a result like this?"} />
    </>
  );
}
