/**
 * Ad platform tags for Google Ads and Meta (Facebook/Instagram) Ads. Each one is
 * off until its ID is set, so the site works exactly as before without them:
 *
 *   NEXT_PUBLIC_GOOGLE_ADS_ID            Google Ads → Goals → Conversions → tag setup, "AW-123456789"
 *   NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL    the label of a "Submit lead form" conversion action
 *   NEXT_PUBLIC_META_PIXEL_ID            Meta Events Manager → Data sources → your pixel, digits only
 *   NEXT_PUBLIC_META_DOMAIN_VERIFICATION Meta Business Settings → Brand safety → Domains → meta tag
 *
 * Neither tag sets advertising cookies until the visitor accepts the cookie
 * banner, which only appears once one of them is on.
 */
const clean = (v: string | undefined, pattern: RegExp) => {
  const value = v?.trim() || "";
  return pattern.test(value) ? value : "";
};

export const GOOGLE_ADS_ID = clean(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.toUpperCase(), /^AW-\d{6,15}$/);
export const GOOGLE_ADS_LEAD_LABEL = clean(process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL, /^[\w-]{6,40}$/);
export const META_PIXEL_ID = clean(process.env.NEXT_PUBLIC_META_PIXEL_ID, /^\d{10,20}$/);
export const META_DOMAIN_VERIFICATION = clean(process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION, /^[a-z0-9]{20,40}$/);

export const ADS_ENABLED = Boolean(GOOGLE_ADS_ID || META_PIXEL_ID);

/** Where the visitor's cookie choice is kept, in their own browser. */
export const AD_CONSENT_KEY = "zirka-ad-consent";
