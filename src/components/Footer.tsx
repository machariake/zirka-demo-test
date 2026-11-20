import Link from "next/link";
import Image from "next/image";
import { getFeatures, getSettings, getSolutionCategories, hasPosts } from "@/lib/cms";
import { SMS_GREETING, WHATSAPP_GREETING, smsUrl, telUrl, whatsappUrl } from "@/lib/contact";
import { SocialIcon } from "./Icons";

/**
 * Brief §27: who Zirka is, the four solutions, the main pages and the legal
 * links. Includes real phone, SMS, WhatsApp, and Atlanta, Georgia studio info.
 */
export default async function Footer() {
  const [settings, categories, showBlog, features] = await Promise.all([
    getSettings(),
    getSolutionCategories(),
    hasPosts(),
    getFeatures(),
  ]);
  const whatsapp = features.showWhatsApp ? whatsappUrl(settings.whatsapp, WHATSAPP_GREETING) : null;
  const phoneHref = telUrl(settings.whatsapp);
  const textHref = smsUrl(settings.whatsapp, SMS_GREETING);

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
            Based in Atlanta, Georgia — a digital marketing agency helping growing businesses get
            found, win more leads, build a trusted brand and convert with smart automation.
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
            {phoneHref && (
              <li>
                <a href={phoneHref}>
                  Call {settings.phoneDisplay || `+${settings.whatsapp}`}
                </a>
              </li>
            )}
            {textHref && (
              <li>
                <a href={textHref}>Text Us (SMS)</a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            )}
            <li className="foot-note">Based in Atlanta, Georgia, USA</li>
            {settings.hours && <li className="foot-note">{settings.hours}</li>}
            <li>
              <Link href="/contact">All contact options</Link>
            </li>
          </ul>
          {settings.social.length > 0 && (
            <ul className="foot-social" aria-label="Zirka on social media">
              {settings.social.map((s) => (
                <li key={s.network}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Zirka on ${s.network}`}>
                    <SocialIcon network={s.network} />
                  </a>
                </li>
              ))}
            </ul>
          )}
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
