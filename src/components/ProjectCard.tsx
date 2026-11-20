import Image from "next/image";
import Link from "next/link";
import type { ProjectView } from "@/lib/cms";
import { ArrowIcon } from "./Icons";

/** A delivered client project: what we made, for whom, and when. No result figures. */
export default function ProjectCard({ item, showSummary }: { item: ProjectView; showSummary?: boolean }) {
  return (
    <Link className="project-card" href={`/work/projects/${item.slug}`}>
      <div className="project-card__media">
        <Image src={item.image} alt={item.alt} fill sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw" />
      </div>
      <div className="project-card__body">
        <span className="project-card__tag">{item.deliverables}</span>
        <h3>{item.name}</h3>
        <span className="project-card__meta">
          {item.client}
          {item.year ? ` · ${item.year}` : ""}
        </span>
        {showSummary && <p>{item.summary}</p>}
        <span className="project-card__cta">
          View &amp; scroll website
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}
