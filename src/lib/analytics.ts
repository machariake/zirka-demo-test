import { GOOGLE_ADS_ID, GOOGLE_ADS_LEAD_LABEL } from "./ads";

/**
 * Named conversion events from brief §16 — marketing_audit_submit,
 * contact_form_submit, whatsapp_click and the rest.
 *
 * Google Analytics only loads once the owner enters a measurement ID in
 * Features → Visitor analytics. Until then `gtag` doesn't exist and this does
 * nothing at all: no network request, nothing stored. The same goes for the
 * Google Ads and Meta tags (see lib/ads.ts), which also receive the lead events.
 */
type AdWindow = Window & {
  gtag?: (command: "event", name: string, params: Record<string, unknown>) => void;
  fbq?: (command: "track", name: string, params?: Record<string, unknown>) => void;
};

/** Which site events count as a lead for the ad platforms, and Meta's standard name for each. */
const META_EVENTS: Record<string, string> = {
  marketing_audit_submit: "Lead",
  contact_form_submit: "Lead",
  quote_submit: "Lead",
  booking_submit: "Schedule",
  whatsapp_click: "Contact",
  phone_click: "Contact",
  email_click: "Contact",
};

const FORM_LEADS = new Set(["marketing_audit_submit", "contact_form_submit", "quote_submit", "booking_submit"]);

export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as AdWindow;
  w.gtag?.("event", event, params);

  const metaEvent = META_EVENTS[event];
  if (metaEvent) w.fbq?.("track", metaEvent, { content_name: event });

  if (GOOGLE_ADS_ID && GOOGLE_ADS_LEAD_LABEL && FORM_LEADS.has(event)) {
    w.gtag?.("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}` });
  }
}
