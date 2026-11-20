import Link from "next/link";
import type { SolutionCategoryView } from "@/lib/cms";
import { ArrowIcon } from "./Icons";
import ShareButton from "./ShareButton";

/**
 * The four solution categories — the homepage's main explanation of what Zirka
 * does (brief §5). Each names its services but links on to the full list,
 * rather than forcing all fourteen services onto the homepage.
 */
export default function SolutionCategories({ categories }: { categories: SolutionCategoryView[] }) {
  return (
    <div className="solutions-grid">
      {categories.map((c, i) => (
        <article className="solution-card" key={c.slug}>
          <span className="solution-card__index" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3>{c.name}</h3>
          <p>{c.description}</p>
          {c.services.length > 0 && (
            <ul className="solution-card__services">
              {c.services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`}>{s.name}</Link>
                </li>
              ))}
            </ul>
          )}
          <div className="service-card__footer">
            <Link className="explore" href={`/services#${c.slug}`}>
              Learn More<span className="sr-only"> about {c.name}</span>
              <ArrowIcon />
            </Link>
            <ShareButton
              title={`${c.name} — Zirka Digital Solutions`}
              text={c.description}
              path={`/services#${c.slug}`}
              variant="compact"
            />
          </div>
        </article>
      ))}
    </div>
  );
}
