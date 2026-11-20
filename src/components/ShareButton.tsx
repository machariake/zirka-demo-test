"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

const SITE_ORIGIN = "https://zirkadigitalsolutions.com";

export type ShareButtonProps = {
  /** Human-readable name of the service or package being shared. */
  title: string;
  /** Short summary or price line included in share messages. */
  text?: string;
  /** Relative path (e.g. "/services/website-development" or "/pricing#pkg-landing-page"). */
  path: string;
  /** Optional direct Stripe checkout link for packages that can be paid immediately. */
  checkoutUrl?: string;
  /** Visual style: compact pill, icon-only button, or full inline share bar. */
  variant?: "compact" | "icon" | "bar";
  /** Optional alignment for the dropdown menu. */
  align?: "left" | "right";
  /** Optional label override for compact mode. */
  label?: string;
};

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="15" cy="4.5" r="2.2" />
      <circle cx="5" cy="10" r="2.2" />
      <circle cx="15" cy="15.5" r="2.2" />
      <path d="M7 9l6-3.4M7 11l6 3.4" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="7" y="7" width="9.5" height="9.5" rx="2" />
      <path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function CheckMarkIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.17 8.17 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.3-.02-.47-.02-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.4.52.59.18 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

function LinkedInSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M6.9 8.7H3.6V20h3.3V8.7ZM5.25 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.4 13.5c0-3.03-.65-5.1-4.2-5.1-1.7 0-2.84.93-3.3 1.8h-.05V8.7H9.7V20H13v-5.6c0-1.48.28-2.9 2.1-2.9 1.8 0 1.82 1.68 1.82 3V20h3.3l.18-6.5Z" />
    </svg>
  );
}

function FacebookSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.3 4.3c-2.3 0-3.8 1.4-3.8 3.96v2.24H7.9v3h2.6V21h3Z" />
    </svg>
  );
}

function XSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function MailSmallIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
      <path d="M3.5 5.5l6.5 5 6.5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
      <path d="M2.5 8.5h15" />
    </svg>
  );
}

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall back to execCommand below.
  }
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export default function ShareButton({
  title,
  text,
  path,
  checkoutUrl,
  variant = "compact",
  align = "right",
  label = "Share",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<"page" | "checkout" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const buildUrl = () => {
    const normalizedPath = path.startsWith("http")
      ? path
      : `${typeof window !== "undefined" ? window.location.origin : SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
    return normalizedPath;
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const shareUrl = buildUrl();
  const shareSummary = text ? `${title} — ${text}` : `${title} | Zirka Digital Solutions`;
  const shareMessage = `${shareSummary}\n${shareUrl}`;

  const handleCopy = async (kind: "page" | "checkout") => {
    const target = kind === "checkout" && checkoutUrl ? checkoutUrl : shareUrl;
    const ok = await copyText(target);
    if (ok) {
      setCopiedKey(kind);
      trackEvent("share_service", { title, method: kind === "checkout" ? "copy_checkout" : "copy_link" });
      window.setTimeout(() => setCopiedKey(null), 2200);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `${title} | Zirka Digital Solutions`, text: shareSummary, url: shareUrl });
        trackEvent("share_service", { title, method: "native_share" });
        setOpen(false);
        return;
      } catch (err) {
        // User cancelled or browser rejected; fall back to opening the popover menu.
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    setOpen((v) => !v);
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareSummary)}&url=${encodeURIComponent(shareUrl)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(`${title} — Zirka Digital Solutions`)}&body=${encodeURIComponent(shareMessage)}`;

  if (variant === "bar") {
    return (
      <div className="share-bar" ref={rootRef}>
        <span className="share-bar__label">Share this service</span>
        <div className="share-bar__buttons">
          <button
            type="button"
            className={`share-chip${copiedKey === "page" ? " is-copied" : ""}`}
            onClick={() => handleCopy("page")}
            aria-label={`Copy link for ${title}`}
          >
            {copiedKey === "page" ? <CheckMarkIcon /> : <CopyIcon />}
            <span>{copiedKey === "page" ? "Copied!" : "Copy link"}</span>
          </button>
          <a
            className="share-chip"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share ${title} on WhatsApp`}
            onClick={() => trackEvent("share_service", { title, method: "whatsapp" })}
          >
            <WhatsAppSmallIcon />
            <span>WhatsApp</span>
          </a>
          <a
            className="share-chip"
            href={linkedInHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share ${title} on LinkedIn`}
            onClick={() => trackEvent("share_service", { title, method: "linkedin" })}
          >
            <LinkedInSmallIcon />
            <span>LinkedIn</span>
          </a>
          <a
            className="share-chip"
            href={facebookHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share ${title} on Facebook`}
            onClick={() => trackEvent("share_service", { title, method: "facebook" })}
          >
            <FacebookSmallIcon />
            <span>Facebook</span>
          </a>
          <a
            className="share-chip"
            href={xHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share ${title} on X`}
            onClick={() => trackEvent("share_service", { title, method: "x" })}
          >
            <XSmallIcon />
            <span>X</span>
          </a>
          <a
            className="share-chip"
            href={mailHref}
            aria-label={`Share ${title} via email`}
            onClick={() => trackEvent("share_service", { title, method: "email" })}
          >
            <MailSmallIcon />
            <span>Email</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`share-control${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className={variant === "icon" ? "share-trigger share-trigger--icon" : "share-trigger"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Share ${title}`}
        title={`Share ${title}`}
        onClick={() => setOpen((v) => !v)}
      >
        {copiedKey ? <CheckMarkIcon /> : <ShareIcon />}
        {variant !== "icon" && <span>{copiedKey ? "Copied!" : label}</span>}
      </button>

      {open && (
        <div
          className={`share-menu share-menu--${align}`}
          role="menu"
          aria-label={`Share options for ${title}`}
        >
          <button
            type="button"
            role="menuitem"
            className="share-menu__item"
            onClick={() => handleCopy("page")}
          >
            {copiedKey === "page" ? <CheckMarkIcon /> : <CopyIcon />}
            <span>{copiedKey === "page" ? "Link copied!" : "Copy service link"}</span>
          </button>

          {checkoutUrl && (
            <button
              type="button"
              role="menuitem"
              className="share-menu__item"
              onClick={() => handleCopy("checkout")}
            >
              {copiedKey === "checkout" ? <CheckMarkIcon /> : <CardIcon />}
              <span>{copiedKey === "checkout" ? "Payment link copied!" : "Copy Stripe checkout link"}</span>
            </button>
          )}

          <a
            role="menuitem"
            className="share-menu__item"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent("share_service", { title, method: "whatsapp" });
              setOpen(false);
            }}
          >
            <WhatsAppSmallIcon />
            <span>WhatsApp</span>
          </a>

          <a
            role="menuitem"
            className="share-menu__item"
            href={facebookHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent("share_service", { title, method: "facebook" });
              setOpen(false);
            }}
          >
            <FacebookSmallIcon />
            <span>Facebook</span>
          </a>

          <a
            role="menuitem"
            className="share-menu__item"
            href={linkedInHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent("share_service", { title, method: "linkedin" });
              setOpen(false);
            }}
          >
            <LinkedInSmallIcon />
            <span>LinkedIn</span>
          </a>

          <a
            role="menuitem"
            className="share-menu__item"
            href={xHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent("share_service", { title, method: "x" });
              setOpen(false);
            }}
          >
            <XSmallIcon />
            <span>X / Twitter</span>
          </a>

          <a
            role="menuitem"
            className="share-menu__item"
            href={mailHref}
            onClick={() => {
              trackEvent("share_service", { title, method: "email" });
              setOpen(false);
            }}
          >
            <MailSmallIcon />
            <span>Email</span>
          </a>

          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <button
              type="button"
              role="menuitem"
              className="share-menu__item"
              onClick={handleNativeShare}
            >
              <ShareIcon />
              <span>More apps…</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
