import Link from "next/link";
import { getEngagements, getProjectPricing, getSettings } from "@/lib/cms";
import { ArrowIcon } from "./Icons";

/**
 * The homepage shows the monthly plans and sends people to /pricing for the
 * rest, so the two pages are not near-copies of each other.
 */
export default async function Engagements({ withProjects = false }: { withProjects?: boolean }) {
  const [engagements, projects, settings] = await Promise.all([
    getEngagements(),
    withProjects ? getProjectPricing() : Promise.resolve([]),
    getSettings(),
  ]);
  if (engagements.length === 0 && projects.length === 0) return null;

  return (
    <section id="pricing">
      <div className="wrap">
        {engagements.length > 0 && (
          <>
            <div className="section-head">
              <div>
                <span className="eyebrow">Social Media Management · Monthly plans</span>
                <h2>Simple pricing, no surprises.</h2>
              </div>
              <p>
                Pick the plan that sounds like your business. Get started instantly via secure
                Stripe checkout, or request a custom quote before any work begins.
              </p>
            </div>

            <div className="tier-grid">
              {engagements.map((tier) => (
                <article className={`tier${tier.featured ? " featured" : ""}`} key={tier.name}>
                  {tier.featured && <span className="tier-badge">Most popular</span>}
                  <h3>{tier.name}</h3>
                  <div className="tier-price">
                    <span className="amount">{tier.price}</span>
                    <span className="cadence">{tier.cadence}</span>
                  </div>
                  <p className="tier-summary">{tier.summary}</p>
                  {tier.includes.length > 0 && (
                    <ul className="tier-list">
                      {tier.includes.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                  <div className="tier-actions">
                    {tier.checkoutUrl ? (
                      <>
                        <a
                          className={`btn ${tier.featured ? "btn-gold" : "btn-outline"} tier-cta`}
                          href={tier.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-track="pricing_cta_click"
                        >
                          Start {tier.name.replace(/^Zirka\s+/, "")}
                          <ArrowIcon />
                        </a>
                        <Link
                          className="tier-quote-link"
                          href={`/quote?plan=${encodeURIComponent(tier.name)}`}
                          data-track="pricing_cta_click"
                        >
                          Or request a custom quote
                        </Link>
                      </>
                    ) : (
                      <Link
                        className={`btn ${tier.featured ? "btn-gold" : "btn-outline"} tier-cta`}
                        href={`/quote?plan=${encodeURIComponent(tier.name)}`}
                        data-track="pricing_cta_click"
                      >
                        {tier.price.toLowerCase().includes("custom")
                          ? "Request a quote"
                          : `Start with ${tier.name.replace(/^Zirka\s+/, "")}`}
                        <ArrowIcon />
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <p className="tier-note">
              Not sure which one fits? Tell us what you sell and what you want more of, and
              we&rsquo;ll tell you which plan to start on — free, and with no obligation.{" "}
              <Link href="/free-marketing-audit" data-track="main_cta_click">
                Start with a free marketing audit
              </Link>
              .
            </p>
          </>
        )}

        {projects.length > 0 && (
          <div className="project-pricing">
            <div className="section-head">
              <div>
                <span className="eyebrow">Websites &amp; one-off projects</span>
                <h2>Need a website or a single piece of work?</h2>
              </div>
              <p>
                Not every business needs a monthly marketing retainer. Order your website package or
                website care plan directly online, or request a quote for custom projects.
              </p>
            </div>

            <ul className="project-price-list">
              {projects.map((p) => (
                <li key={p.name}>
                  <span className="project-price-list__name">
                    {p.name}
                    {p.note && <span className="project-price-list__note">{p.note}</span>}
                  </span>
                  <span className="project-price-list__actions">
                    <span className="project-price-list__price">{p.price}</span>
                    {p.checkoutUrl ? (
                      <a
                        className="btn btn-gold project-price-list__cta"
                        href={p.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="pricing_cta_click"
                      >
                        Buy now
                        <ArrowIcon />
                      </a>
                    ) : (
                      <Link
                        className="project-price-list__quote"
                        href={`/quote?plan=${encodeURIComponent(p.name)}`}
                        data-track="pricing_cta_click"
                      >
                        Get a quote
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <p className="tier-note">{settings.projectPricingNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}
