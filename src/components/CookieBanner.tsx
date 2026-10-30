"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { AD_CONSENT_KEY } from "@/lib/ads";

type AdWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

/**
 * Asks once whether ad platforms (Google Ads, Meta) may set cookies to measure
 * which ads bring enquiries. Only rendered when an ad tag is switched on. The
 * answer is kept in the visitor's browser and applied on every later visit.
 */
const noop = () => () => {};
const readChoice = () => {
  try {
    return localStorage.getItem(AD_CONSENT_KEY);
  } catch {
    return null;
  }
};

export default function CookieBanner() {
  // Read on the client only; the server renders nothing, so there is no flash.
  const saved = useSyncExternalStore(noop, readChoice, () => "server");
  const [answered, setAnswered] = useState(false);
  const open = !saved && !answered;

  const choose = (granted: boolean) => {
    try {
      localStorage.setItem(AD_CONSENT_KEY, granted ? "granted" : "denied");
    } catch {}
    const w = window as AdWindow;
    const value = granted ? "granted" : "denied";
    w.gtag?.("consent", "update", { ad_storage: value, ad_user_data: value, ad_personalization: value });
    w.fbq?.("consent", granted ? "grant" : "revoke");
    setAnswered(true);
  };

  if (!open) return null;
  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie choice">
      <p>
        We use cookies from Google and Meta to see which of our ads bring enquiries.{" "}
        <Link href="/privacy#advertising">Learn more</Link>
      </p>
      <div className="cookie-banner__actions">
        <button type="button" className="btn btn-outline" onClick={() => choose(false)}>
          Decline
        </button>
        <button type="button" className="btn btn-gold" onClick={() => choose(true)}>
          Accept
        </button>
      </div>
    </div>
  );
}
