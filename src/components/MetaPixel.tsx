import Script from "next/script";
import { AD_CONSENT_KEY } from "@/lib/ads";

/**
 * Meta (Facebook/Instagram) pixel, loaded only when NEXT_PUBLIC_META_PIXEL_ID is
 * set. Consent starts revoked, so the pixel sends nothing and sets no cookies
 * until the visitor accepts the cookie banner (or accepted on an earlier visit).
 */
export default function MetaPixel({ id }: { id: string }) {
  const init = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
var granted = false;
try { granted = localStorage.getItem(${JSON.stringify(AD_CONSENT_KEY)}) === 'granted'; } catch (e) {}
fbq('consent', granted ? 'grant' : 'revoke');
fbq('init', ${JSON.stringify(id)});
fbq('track', 'PageView');
`;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {init}
    </Script>
  );
}
