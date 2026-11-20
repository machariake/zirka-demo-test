import Image from "next/image";
import Link from "next/link";
import type { WorkView } from "@/lib/cms";
import { ArrowIcon } from "./Icons";

export default function WorkFeature({ item }: { item: WorkView }) {
  return (
    <article className={`work-feature ${item.plate}`}>
      <div className="feature-media">
        <Image src={item.image} alt={item.alt} fill sizes="(max-width: 860px) 100vw, 55vw" />
      </div>
      <div className="feature-body">
        <span className="eyebrow">{item.sample ? "Featured work" : "Featured case study"}</span>
        <h3>{item.name}</h3>
        {item.sample && <span className="work-sample work-sample--inline">CPT</span>}
        <p className="feature-summary">{item.summary}</p>
        {/* Result figures belong to real, documented work only. */}
        {!item.sample && (
          <div className="feature-metric">
            <span className="value">{item.metric}</span>
            <span className="cat">{item.category}</span>
          </div>
        )}
        <Link className="explore" href={`/work/${item.slug}`}>
          {item.sample ? "View project" : "Read the case study"}
          <ArrowIcon />
        </Link>
      </div>
    </article>
  );
}
