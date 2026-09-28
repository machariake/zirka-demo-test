import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PageTracker from "@/components/PageTracker";
import PreviewBadge from "@/components/PreviewBadge";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import AutoTranslate from "@/components/AutoTranslate";
import { SITE_URL } from "@/lib/site";
import { getFeatures, getGaMeasurementId, getSiteTheme, getSiteVerification } from "@/lib/cms";
import { themeScript } from "@/components/ThemeToggle";
import "./globals.css";

// One family throughout: its geometric caps echo the ZIRKA wordmark in the logo.
const urbanist = Urbanist({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

/**
 * Every page reads its content from the CMS, so a page built once at deploy
 * would show whatever was in the database that day and never change again.
 * Rebuilding at most once a minute means edits made in admin appear on the live
 * site shortly after saving, without a page hitting the database on every visit.
 */
export const revalidate = 60;

const description =
  "Zirka Digital Solutions is a digital marketing agency running performance media, SEO, social, and web experience for growing brands.";

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Zirka Digital Solutions",
    default: "Zirka Digital Solutions | Digital Marketing Agency",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Zirka Digital Solutions",
    title: "Zirka Digital Solutions — Where Ideas Become Impact",
    description,
    images: [{ url: "/images/og.png", width: 1200, height: 630, alt: "Zirka Digital Solutions — Where ideas become impact" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zirka Digital Solutions — Where Ideas Become Impact",
    description,
    images: ["/images/og.png"],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  // Ownership codes pasted in Features → Search engines.
  const { google, bing } = await getSiteVerification();
  if (!google && !bing) return baseMetadata;
  return {
    ...baseMetadata,
    verification: {
      ...(google ? { google } : {}),
      ...(bing ? { other: { "msvalidate.01": bing } } : {}),
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [gaId, siteTheme, features] = await Promise.all([getGaMeasurementId(), getSiteTheme(), getFeatures()]);
  return (
    <html
      lang="en"
      className={urbanist.variable}
      data-site-theme={siteTheme}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppFloat />
        {features.translateEnabled && <AutoTranslate />}
        <PageTracker />
        <PreviewBadge />
        {gaId && <GoogleAnalytics id={gaId} />}
      </body>
    </html>
  );
}
