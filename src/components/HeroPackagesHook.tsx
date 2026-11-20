"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowIcon } from "./Icons";
import { trackEvent } from "@/lib/analytics";

export type QuickPackage = {
  name: string;
  price: string;
  sublabel: string;
  checkoutUrl: string;
  anchor: string;
  featured?: boolean;
};

export default function HeroPackagesHook({
  socialPlans,
  websitePackages,
}: {
  socialPlans: QuickPackage[];
  websitePackages: QuickPackage[];
}) {
  const [tab, setTab] = useState<"social" | "websites">("social");
  const items = tab === "social" ? socialPlans : websitePackages;

  return (
    <aside className="hero-hook" aria-label="Quick-start packages and online checkout">
      <div className="hero-hook__head">
        <span className="hero-hook__badge">
          <span className="hero-hook__dot" aria-hidden="true" />
          Order online &middot; Start in 24h
        </span>
        <h2>Pick a package &amp; get started today.</h2>
      </div>

      <div className="hero-hook__tabs" role="tablist" aria-label="Package categories">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "social"}
          className={`hero-hook__tab${tab === "social" ? " is-active" : ""}`}
          onClick={() => setTab("social")}
        >
          Social Media
          <span>from $299/mo</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "websites"}
          className={`hero-hook__tab${tab === "websites" ? " is-active" : ""}`}
          onClick={() => setTab("websites")}
        >
          Websites
          <span>from $997</span>
        </button>
      </div>

      <ul className="hero-hook__list">
        {items.map((item) => (
          <li className={`hero-hook__item${item.featured ? " is-featured" : ""}`} key={item.name}>
            <div className="hero-hook__info">
              <div className="hero-hook__title-row">
                <strong>{item.name}</strong>
                {item.featured && <span className="hero-hook__pop">Popular</span>}
              </div>
              <span className="hero-hook__sub">{item.sublabel}</span>
            </div>
            <div className="hero-hook__action">
              <span className="hero-hook__price">{item.price}</span>
              <a
                className={`btn ${item.featured ? "btn-gold" : "btn-ghost"} hero-hook__btn`}
                href={item.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track="pricing_cta_click"
                onClick={() => trackEvent("hero_package_checkout", { plan: item.name })}
              >
                Buy now
                <ArrowIcon />
              </a>
            </div>
          </li>
        ))}
      </ul>

      <div className="hero-hook__flow">
        <span>1. Pay via Stripe</span>
        <span aria-hidden="true">&rarr;</span>
        <span>2. Quick onboarding</span>
        <span aria-hidden="true">&rarr;</span>
        <span>3. Kickoff in 24h</span>
      </div>

      <div className="hero-hook__foot">
        <a href="#pricing" className="hero-hook__link">
          Compare full details
          <ArrowIcon />
        </a>
        <Link href="/onboarding" className="hero-hook__link hero-hook__link--muted">
          Already paid? Start onboarding
        </Link>
      </div>
    </aside>
  );
}
