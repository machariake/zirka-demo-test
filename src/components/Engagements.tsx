import Link from "next/link";
import { getEngagements, getFeatures, getProjectPricing, getSettings } from "@/lib/cms";
import { whatsappUrl } from "@/lib/contact";
import { ArrowIcon, WhatsAppIcon } from "./Icons";
import ShareButton from "./ShareButton";

function toAnchorSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type WebsitePackageMeta = {
  tag: string;
  title: string;
  cadence: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  featured?: boolean;
  displayPrice?: string;
};

const WEBSITE_PACKAGE_META: Record<string, WebsitePackageMeta> = {
  "landing page": {
    tag: "One-off build",
    title: "Landing Page",
    cadence: "one-time payment",
    description: "A single high-converting page built to turn ad clicks and social traffic into leads.",
    highlights: [
      "Custom conversion-focused layout",
      "Mobile-first & fast loading",
      "Lead form & WhatsApp integration",
      "Analytics & pixel tracking setup",
    ],
    ctaLabel: "Order Landing Page",
  },
  "business website (3–5 pages)": {
    tag: "3–5 custom pages",
    title: "Business Website",
    cadence: "one-time payment",
    description: "A complete, credible multi-page site for growing businesses ready to win trust online.",
    highlights: [
      "3–5 custom designed pages",
      "Mobile-responsive & SEO-ready",
      "Contact, quote & booking forms",
      "Speed optimization & launch support",
    ],
    ctaLabel: "Order Business Website",
    featured: true,
  },
  "large business website (6–10 pages)": {
    tag: "6–10 custom pages",
    title: "Large Business Website",
    cadence: "one-time payment",
    description: "An expansive website with dedicated service hubs, CMS editing, and structured SEO.",
    highlights: [
      "6–10 tailored pages & service hubs",
      "CMS setup for easy content edits",
      "Advanced on-page SEO & schema",
      "Priority launch & handover",
    ],
    ctaLabel: "Order Large Website",
  },
  "website care": {
    tag: "Ongoing care",
    title: "Website Care",
    displayPrice: "$129",
    cadence: "per month",
    description: "Hands-off monthly maintenance, backups, security, and updates so your site stays fast.",
    highlights: [
      "Security monitoring & backups",
      "Core, plugin & content updates",
      "Uptime & speed health checks",
      "Priority email & WhatsApp support",
    ],
    ctaLabel: "Start Website Care",
  },
};

/**
 * The homepage shows the monthly plans and sends people to /pricing for the
 * rest, so the two pages are not near-copies of each other.
 */
export default async function Engagements({ withProjects = false }: { withProjects?: boolean }) {
  const [engagements, projects, settings, features] = await Promise.all([
    getEngagements(),
    withProjects ? getProjectPricing() : Promise.resolve([]),
    getSettings(),
    getFeatures(),
  ]);
  if (engagements.length === 0 && projects.length === 0) return null;

  const directPackages = projects.filter((p) => Boolean(p.checkoutUrl));
  const customProjects = projects.filter((p) => !p.checkoutUrl);
  const onboardingWhatsApp = features.showWhatsApp
    ? whatsappUrl(settings.whatsapp, "Hi Zirka! I just paid for a package and I'm ready to get started.")
    : null;

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
              {engagements.map((tier) => {
                const planId = `plan-${toAnchorSlug(tier.name)}`;
                return (
                  <article className={`tier${tier.featured ? " featured" : ""}`} id={planId} key={tier.name}>
                    {tier.featured && <span className="tier-badge">Most popular</span>}
                    <div className="tier-card__top">
                      <h3>{tier.name}</h3>
                      <ShareButton
                        title={`${tier.name} (${tier.price} ${tier.cadence})`}
                        text={tier.summary}
                        path={`/pricing#${planId}`}
                        checkoutUrl={tier.checkoutUrl || undefined}
                        variant="icon"
                      />
                    </div>
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
                );
              })}
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
                Not every business needs a monthly marketing retainer. Order a fixed-price website
                package directly online, or request a quote for custom projects.
              </p>
            </div>

            {directPackages.length > 0 && (
              <div className="website-grid">
                {directPackages.map((p) => {
                  const meta = WEBSITE_PACKAGE_META[p.name.trim().toLowerCase()];
                  const featured = Boolean(meta?.featured);
                  const displayPrice = meta?.displayPrice ?? p.price;
                  const cadence =
                    meta?.cadence ??
                    (p.price.toLowerCase().includes("/mo") ? "per month" : "one-time payment");
                  const pkgId = `pkg-${toAnchorSlug(p.name)}`;

                  return (
                    <article
                      className={`website-card${featured ? " featured" : ""}`}
                      id={pkgId}
                      key={p.name}
                    >
                      {featured && <span className="tier-badge">Most popular</span>}
                      <div className="tier-card__top">
                        <span className="website-card__tag">{meta?.tag ?? "Fixed package"}</span>
                        <ShareButton
                          title={`${p.name} — ${p.price}`}
                          text={meta?.description ?? p.note ?? `${p.name} package from Zirka Digital Solutions`}
                          path={`/pricing#${pkgId}`}
                          checkoutUrl={p.checkoutUrl || undefined}
                          variant="icon"
                        />
                      </div>
                      <h3>{meta?.title ?? p.name}</h3>
                      <div className="tier-price">
                        <span className="amount">{displayPrice}</span>
                        <span className="cadence">{cadence}</span>
                      </div>
                      {(meta?.description || p.note) && (
                        <p className="website-card__desc">{meta?.description ?? p.note}</p>
                      )}
                      {meta?.highlights && meta.highlights.length > 0 && (
                        <ul className="tier-list">
                          {meta.highlights.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      )}
                      <div className="tier-actions">
                        <a
                          className={`btn ${featured ? "btn-gold" : "btn-outline"} tier-cta`}
                          href={p.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-track="pricing_cta_click"
                        >
                          {meta?.ctaLabel ?? "Order now"}
                          <ArrowIcon />
                        </a>
                        <Link
                          className="tier-quote-link"
                          href={`/quote?plan=${encodeURIComponent(p.name)}`}
                          data-track="pricing_cta_click"
                        >
                          Or request a custom quote
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {customProjects.length > 0 && (
              <div className="addon-panel">
                <div className="addon-panel__head">
                  <div>
                    <span className="eyebrow">Custom projects</span>
                    <h3>More one-off services</h3>
                  </div>
                  <p>Priced to scope with no monthly retainer attached.</p>
                </div>

                <ul className="addon-list">
                  {customProjects.map((p) => {
                    const serviceId = `service-${toAnchorSlug(p.name)}`;
                    return (
                      <li id={serviceId} key={p.name}>
                        <span className="addon-list__name">
                          {p.name}
                          {p.note && <span className="addon-list__note">{p.note}</span>}
                        </span>
                        <span className="addon-list__actions">
                          <span className="addon-list__price">{p.price}</span>
                          <Link
                            className="btn btn-outline addon-list__cta"
                            href={`/quote?plan=${encodeURIComponent(p.name)}`}
                            data-track="pricing_cta_click"
                          >
                            Get a quote
                            <ArrowIcon />
                          </Link>
                          <ShareButton
                            title={`${p.name} (${p.price})`}
                            text={`${p.name} — ${p.price} from Zirka Digital Solutions`}
                            path={`/pricing#${serviceId}`}
                            variant="icon"
                          />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <p className="tier-note">{settings.projectPricingNote}</p>
          </div>
        )}

        <div className="delivery-panel" id="how-delivery-works">
          <div className="delivery-panel__head">
            <div>
              <span className="eyebrow">After you pay</span>
              <h3>How you get your service once paid</h3>
            </div>
            <p>
              Every Stripe checkout kicks off a simple, guided process — you are never left
              wondering what happens next.
            </p>
          </div>

          <div className="delivery-steps">
            <div className="delivery-step">
              <span className="delivery-step__num">01</span>
              <h4>Instant Stripe Receipt</h4>
              <p>
                Pay securely via Stripe and receive an instant email confirmation and official
                receipt.
              </p>
            </div>
            <div className="delivery-step">
              <span className="delivery-step__num">02</span>
              <h4>2-Minute Onboarding</h4>
              <p>
                Submit your business details, goals, and brand links on our onboarding page (or send
                them via WhatsApp).
              </p>
            </div>
            <div className="delivery-step">
              <span className="delivery-step__num">03</span>
              <h4>Kickoff Within 24 Hours</h4>
              <p>
                Your dedicated strategist reviews your brief and confirms your timeline and access
                within 1 business day.
              </p>
            </div>
            <div className="delivery-step">
              <span className="delivery-step__num">04</span>
              <h4>Build, Launch &amp; Reports</h4>
              <p>
                Websites launch with full handover &amp; training; Social Media and Website Care
                plans run monthly with clear reports.
              </p>
            </div>
          </div>

          <div className="delivery-panel__cta">
            <span>Already paid on Stripe? Submit your details so we can start right away.</span>
            <div className="delivery-panel__buttons">
              <Link className="btn btn-gold" href="/onboarding">
                Start Client Onboarding
                <ArrowIcon />
              </Link>
              {onboardingWhatsApp && (
                <a
                  className="btn btn-outline"
                  href={onboardingWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon />
                  Message on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
