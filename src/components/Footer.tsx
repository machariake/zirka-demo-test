import Link from "next/link";
import Image from "next/image";
import { getFeatures, getSettings, getSolutionCategories, hasPosts } from "@/lib/cms";
import { WHATSAPP_GREETING, whatsappUrl } from "@/lib/contact";

/**
 * Brief §27: who Zirka is, the four solutions, the main pages and the legal
 * links. Only real details — no invented address, registrations or badges.
 */
export default async function Footer() {
  const [settings, categories, showBlog, features] = await Promise.all([
    getSettings(),
    getSolutionCategories(),
    hasPosts(),
    getFeatures(),
  ]);
  const whatsapp = features.showWhatsApp ? whatsappUrl(settings.whatsapp, WHATSAPP_GREETING) : null;

  return (
    <footer>
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <Link className="foot-logo" href="/">
            <Image
              src="/images/logo.png"
              alt="Zirka Digital Solutions — home"
              width={101}
              height={82}
              style={{ width: "auto", height: 82 }}
            />
          </Link>
          <p className="slogan">{settings.slogan}</p>
          <p className="foot-about">
            A digital marketing agency helping growing businesses get found, win more leads, build
            a trusted brand and convert with smart automation.
          </p>
        </div>

        {categories.length > 0 && (
          <nav className="foot-col" aria-label="Solutions">
            <h2 className="foot-heading">Solutions</h2>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/services#${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <nav className="foot-col" aria-label="Company">
          <h2 className="foot-heading">Company</h2>
          <ul>
            <li>
              <Link href="/services">Services</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/work">Work</Link>
            </li>
            {showBlog && (
              <li>
                <Link href="/blog">Blog</Link>
              </li>
            )}
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/free-marketing-audit">Free Marketing Audit</Link>
            </li>
          </ul>
        </nav>

        {/* Only the details actually set in Site Settings → Contact. */}
        <div className="foot-col">
          <h2 className="foot-heading">Get in touch</h2>
          <ul>
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  WhatsApp {settings.phoneDisplay || `+${settings.whatsapp}`}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            )}
            {settings.hours && <li className="foot-note">{settings.hours}</li>}
            <li>
              <Link href="/contact">All contact options</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap foot-base">
        <span>
          &copy; {new Date().getFullYear()} {settings.companyName}
        </span>
        <span className="foot-legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refunds">Refunds</Link>
        </span>
      </div>
    </footer>
  );
}
