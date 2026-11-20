import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import WebsitePreview from "@/components/WebsitePreview";
import { ArrowIcon } from "@/components/Icons";
import { getProject } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return pageMeta({
    title: `${project.name} — ${project.deliverables}`,
    description: project.summary,
    path: `/work/projects/${project.slug}`,
    image: project.heroImage,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const paragraphs = project.description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const details = [
    { label: "Client", value: project.client },
    { label: "What we did", value: project.deliverables },
    { label: "Industry", value: project.industry },
    { label: "Year", value: project.year ? String(project.year) : "" },
  ].filter((d) => d.value);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: project.name, path: `/work/projects/${project.slug}` },
        ])}
      />
      <div className="case-hero w2">
        <Image
          className="case-hero__photo"
          src={project.heroImage}
          alt={project.alt}
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
              {project.deliverables}
            </span>
            <h1>{project.name}</h1>
            <p className="lede">{project.summary}</p>
          </div>
        </div>
      </div>

      <section className="section--cream">
        <div className="wrap">
          {project.preview && (
            <WebsitePreview
              title={project.name}
              label={project.preview.label}
              desktopSrc={project.preview.desktopSrc}
              mobileSrc={project.preview.mobileSrc}
            />
          )}

          <div className="case-body" style={project.preview ? { marginTop: 48 } : undefined}>
            <dl className="project-details">
              {details.map((d) => (
                <div key={d.label}>
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>

            {paragraphs.length > 0 && (
              <div className="case-chapter">
                <h2>About the project</h2>
                {paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            {project.services.length > 0 && (
              <div className="case-chapter">
                <h2>Services provided</h2>
                <div className="tags">
                  {project.services.map((s) => (
                    <Link className="tag" key={s.slug} href={`/services/${s.slug}`}>
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {project.liveUrl && (
              <div>
                <a className="btn btn-outline" href={project.liveUrl} target="_blank" rel="noopener">
                  See it live<span className="sr-only"> (opens {project.client}&rsquo;s site in a new tab)</span>
                </a>
              </div>
            )}
          </div>

          {project.gallery.length > 0 && (
            <div className="project-gallery">
              <h2 className="index-heading">Gallery</h2>
              <div className="project-gallery__grid">
                {project.gallery.map((g, i) => (
                  <figure key={`${g.src}-${i}`}>
                    <Image
                      src={g.src}
                      alt={g.alt}
                      width={g.width ?? 1600}
                      height={g.height ?? 1000}
                      sizes="(max-width: 700px) 100vw, 50vw"
                    />
                    {g.caption && <figcaption>{g.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CtaBand heading="Want work like this?" />
    </>
  );
}
