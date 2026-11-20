import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CtaBand from "@/components/CtaBand";
import WorkCard from "@/components/WorkCard";
import ProjectCard from "@/components/ProjectCard";
import { getCaseStudies, getProjects } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const [work, projects] = await Promise.all([getCaseStudies(), getProjects()]);
  return pageMeta({
    title: "Work & Portfolio",
    description: work.some((w) => !w.sample)
      ? "Explore real client case studies, custom websites, SEO campaigns, and digital marketing projects delivered by Zirka Digital Solutions in Atlanta, Georgia."
      : projects.length > 0
        ? "Explore delivered websites and brand work including Zirka Beauty and C&E alongside digital marketing showcases from Zirka Digital Solutions in Atlanta, GA."
        : "Explore digital marketing, SEO, branding, and website projects from Zirka Digital Solutions in Atlanta, Georgia showing how we turn clicks into customers.",
    path: "/work",
    keywords: ["digital marketing portfolio", "Atlanta web design portfolio", "Zirka Beauty", "C&E"],
  });
}

export default async function WorkPage() {
  const [work, projects] = await Promise.all([getCaseStudies(), getProjects()]);
  // Only claim measured outcomes when there is real, documented work to back it.
  // Delivered projects are real work too, but they carry no result figures.
  const hasRealWork = work.some((w) => !w.sample);
  const real = work.filter((w) => !w.sample);
  const concepts = work.filter((w) => w.sample);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
        ])}
      />
      <PageHeader
        eyebrow="Selected work"
        title={
          hasRealWork ? "Results, not just reach." : projects.length > 0 ? "Work we've delivered." : "How we approach the work."
        }
        lede={
          hasRealWork
            ? "Client case studies and selected projects showcasing the strategy, design, and creative direction we bring to every engagement."
            : projects.length > 0
              ? "Projects delivered for brands including Zirka Beauty and C&E Helping Hands Agency — click any project to view and scroll through the full site preview."
              : "Showcase projects illustrating our strategy, design, and creative direction across websites, branding, SEO, and paid campaigns."
        }
      />

      <section className="section--cream">
        <div className="wrap">
          {projects.length > 0 && (
            <div className={work.length > 0 ? "work-group--after" : undefined}>
              <h2 className="index-heading">Projects we&rsquo;ve delivered</h2>
              <div className="project-grid">
                {projects.map((item) => (
                  <ProjectCard item={item} showSummary key={item.slug} />
                ))}
              </div>
            </div>
          )}
          {work.length > 0 ? (
            <>
              {real.length > 0 && (
                <>
                  <h2 className="index-heading">Client case studies</h2>
                  <div className="work-grid wide">
                    {real.map((item) => (
                      <WorkCard item={item} showSummary key={item.name} />
                    ))}
                  </div>
                </>
              )}
              {concepts.length > 0 && (
                <div className={real.length > 0 || projects.length > 0 ? "work-group--spaced" : undefined}>
                  <h2 className="index-heading">Featured direction &amp; creative showcases</h2>
                  <div className="work-grid wide">
                    {concepts.map((item) => (
                      <WorkCard item={item} showSummary key={item.name} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : projects.length > 0 ? null : (
            <div className="booking-empty">
              <h2>Case studies coming soon</h2>
              <p>
                We&rsquo;re writing up recent client work. In the meantime, tell us what you&rsquo;re
                trying to achieve and we&rsquo;ll walk you through comparable projects on a call.
              </p>
            </div>
          )}
        </div>
      </section>

      <CtaBand heading={hasRealWork ? "Want results like these?" : "Want work like this?"} />
    </>
  );
}
