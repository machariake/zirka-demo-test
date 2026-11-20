import type { Metadata } from "next";

export const SITE_NAME = "Zirka Digital Solutions";

const DEFAULT_IMAGE = {
  url: "/images/og.png",
  width: 1200,
  height: 630,
  alt: "Zirka Digital Solutions — digital marketing agency",
};

const DEFAULT_KEYWORDS = [
  "Atlanta digital marketing agency",
  "digital marketing agency Atlanta GA",
  "digital marketing agency",
  "social media management",
  "website development",
  "SEO services",
  "paid advertising",
  "Google Ads management",
  "Meta Ads",
  "WhatsApp marketing",
  "AI business automation",
  "Zirka Digital Solutions",
];

/**
 * Everything a page needs for search and for link previews (brief §19), built
 * in one place so no page can end up with a missing canonical, a missing
 * og:url, or the homepage's title and description in its share preview.
 *
 * Next replaces a layout's openGraph object wholesale when a page sets its
 * own, so each page gets a complete one rather than relying on inheritance.
 * The canonical is given as an absolute path: a relative "./" resolved to
 * "/index" on the homepage, pointing Google at a page that does not exist.
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  keywords,
}: {
  /** Omit on the homepage to use the site's default title. */
  title?: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const shareTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Digital Marketing Agency`;
  const images = image ? [{ url: image }] : [DEFAULT_IMAGE];
  return {
    ...(title ? { title } : {}),
    description,
    keywords: keywords && keywords.length > 0 ? [...keywords, ...DEFAULT_KEYWORDS] : DEFAULT_KEYWORDS,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, title: shareTitle, description, url: path, images },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: images.map((i) => i.url) },
  };
}
