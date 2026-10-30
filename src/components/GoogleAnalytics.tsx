import Script from "next/script";
import { AD_CONSENT_KEY } from "@/lib/ads";

/**
 * Countries where analytics cookies need consent before they are set (EEA,
 * UK, Switzerland). There is no analytics consent banner, so visitors from
 * these places get Consent Mode's cookieless pings instead of GA cookies.
 */
const CONSENT_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV",
  "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

/**
 * Google's tag (gtag.js), loaded when the owner has entered a GA4 measurement
 * ID in Features → Visitor analytics, a Google Ads ID (NEXT_PUBLIC_GOOGLE_ADS_ID),
 * or both. Advertising storage stays denied for everyone until they accept the
 * cookie banner; a choice saved on an earlier visit is applied before any tag runs.
 */
export default function GoogleAnalytics({ id, adsId }: { id?: string | null; adsId?: string }) {
  const tagId = id || adsId;
  if (!tagId) return null;
  const init = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'denied', region: ${JSON.stringify(CONSENT_REGIONS)}
});
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'granted'
});
try {
  if (localStorage.getItem(${JSON.stringify(AD_CONSENT_KEY)}) === 'granted') {
    gtag('consent', 'update', {
      ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted'
    });
  }
} catch (e) {}
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);
gtag('js', new Date());
${id ? `gtag('config', ${JSON.stringify(id)}, { allow_google_signals: false });` : ""}
${adsId ? `gtag('config', ${JSON.stringify(adsId)});` : ""}
`;
  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {init}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`} strategy="afterInteractive" />
    </>
  );
}
