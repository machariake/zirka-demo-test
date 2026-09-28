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
  // Describe what is really on the page: no "results" without real case studies.
  return pageMeta({
    title: "Work",
    description: work.some((w) => !w.sample)
      ? "Client case studies from Zirka Digital Solutions — the challenge, what we did and the result — alongside projects we've delivered."
      : projects.length > 0
        ? "Websites, brands and campaigns Zirka Digital Solutions has delivered for real clients, plus concept projects showing how we think."
        : "Concept projects from Zirka Digital Solutions showing the strategy and creative direction we bring to digital marketing work.",
    path: "/work",
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
            ? "Real client work is measured against one standard: a business metric that moved, not an impression count. Anything marked Concept Project shows our thinking, not a client result."
            : projects.length > 0
              ? "Projects we've completed for real clients. Anything marked Concept Project shows our strategy and creative direction, not client work."
              : "These are concept projects: they show the strategy and creative direction we bring, not work for real clients, and they claim no results. Client case studies will appear here as they are completed."
        }
      />

      <section>
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
              {/* Real work and concepts kept in separate groups (brief §4). */}
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
                  <h2 className="index-heading">Concept projects</h2>
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
