"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MenuIcon, CloseIcon } from "./Icons";
import ThemeToggle from "./ThemeToggle";
import LanguageMenu from "./LanguageMenu";

/** Services is a menu of its own (brief §26), so it is not in this list. */
const NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export type NavCategory = { name: string; slug: string; description: string };

/** The Blog link appears once the first post is published. */
const BLOG_LINK = { href: "/blog", label: "Blog" };

export default function HeaderNav({
  categories,
  showBlog = false,
  showLanguages = false,
}: {
  categories: NavCategory[];
  showBlog?: boolean;
  showLanguages?: boolean;
}) {
  const links = showBlog ? [...NAV_LINKS.slice(0, 2), BLOG_LINK, ...NAV_LINKS.slice(2)] : NAV_LINKS;
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const menuId = useId();
  const mobileId = useId();
  const servicesRef = useRef<HTMLLIElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  /** Marks the section the visitor is in, for sighted and screen-reader users alike. */
  const current = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`) ? ("page" as const) : undefined;
  const inServices = pathname === "/services" || pathname.startsWith("/services/");

  // Close both menus on navigation, on Escape, and the Services menu on a click elsewhere.
  useEffect(() => {
    queueMicrotask(() => {
      setServicesOpen(false);
      setOpen(false);
    });
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    if (!servicesOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setServicesOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [servicesOpen]);

  return (
    <>
      <header className="site">
        <div className="navrow">
          <Link className="wordmark notranslate" translate="no" href="/">
            {/* Declared at display size so the optimizer serves a ~110px file, not a 1920px one. */}
            <Image
              className="mark"
              src="/images/logo-mark.png"
              alt=""
              width={55}
              height={38}
              loading="eager"
              fetchPriority="high"
            />
            <span className="lockup">
              <span className="name">Zirka</span>{" "}
              <span className="sub">Digital Solutions</span>
            </span>
          </Link>
          <ul className="links" aria-label="Main">
            <li className="nav-services" ref={servicesRef}>
              <button
                type="button"
                className={`nav-services__toggle${inServices ? " is-current" : ""}`}
                aria-expanded={servicesOpen}
                aria-controls={menuId}
                onClick={() => setServicesOpen((v) => !v)}
              >
                Services
                <span className="nav-services__chevron" aria-hidden="true" />
              </button>
              <div className="nav-services__menu" id={menuId} hidden={!servicesOpen}>
                <ul>
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/services#${c.slug}`}>
                        <strong>{c.name}</strong>
                        <span>{c.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link className="nav-services__all" href="/services">
                  All services &rarr;
                </Link>
              </div>
            </li>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={current(link.href)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav-right">
            {showLanguages && <LanguageMenu />}
            <ThemeToggle />
            <Link
              className="btn btn-gold nav-cta"
              href="/free-marketing-audit"
              data-track="main_cta_click"
            >
              Get a Free Marketing Audit
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls={mobileId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-panel" id={mobileId} aria-label="Main">
            <Link href="/services" aria-current={current("/services")} onClick={() => setOpen(false)}>
              Services
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                className="mobile-sub"
                href={`/services#${c.slug}`}
                onClick={() => setOpen(false)}
              >
                {c.name}
              </Link>
            ))}
            {links.map((link) => (
              <Link key={link.href} href={link.href} aria-current={current(link.href)} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link
              className="btn btn-gold mobile-cta"
              href="/free-marketing-audit"
              data-track="main_cta_click"
              onClick={() => setOpen(false)}
            >
              Get a Free Marketing Audit
            </Link>
          </nav>
        )}
      </header>
      {/* Where "Skip to content" lands: just past the navigation, which on this
          site sits inside each page's hero rather than above <main>. */}
      <span id="content" tabIndex={-1} className="skip-target" />
    </>
  );
}
