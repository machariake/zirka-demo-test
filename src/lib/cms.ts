import { getPayload, type Where } from "payload";
import config from "@payload-config";
import type { Service, CaseStudy, TeamMember, Faq, Engagement, Testimonial, Project, Post } from "@/payload-types";
import { services as seedServices } from "@/lib/data";
import { isSiteTheme, type SiteThemeId } from "@/lib/site-themes";
import { DEFAULT_EMAIL, whatsappDigits } from "@/lib/contact";

export const getCms = async () => getPayload({ config });

type MediaLike = { url?: string | null; alt?: string | null } | string | number | null | undefined;

const urlOf = (media: MediaLike, fallback: string): string =>
  media && typeof media === "object" && typeof media.url === "string" ? media.url : fallback;

const altOf = (media: MediaLike, fallback: string): string =>
  media && typeof media === "object" && typeof media.alt === "string" ? media.alt : fallback;

/**
 * Until the team uploads their own photography, fall back to the images that
 * already ship with the project so the site never renders an empty frame.
 */
const SERVICE_FALLBACK: Record<string, string> = Object.fromEntries(
  seedServices.map((s) => [s.slug, s.image])
);

const WORK_FALLBACK: Record<string, string> = {
  "Solace Skincare": "/images/work-skincare.jpg",
  "Northline Freight": "/images/work-freight.jpg",
  "Fernwhistle Coffee": "/images/work-coffee.jpg",
  "Atlas Fitness": "/images/work-fitness.jpg",
  "Harlow & Rye": "/images/work-homegoods.jpg",
  "Meridian Legal": "/images/work-legal.jpg",
};

const PLACEHOLDER = "/images/svc-performance.jpg";

const published = { _status: { equals: "published" } };

const findAll = async <T>(collection: string, limit = 100): Promise<T[]> => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: collection as never,
    limit,
    sort: "order",
    depth: 1,
    where: published,
  });
  return docs as T[];
};

export type ServiceView = {
  slug: string;
  name: string;
  short: string;
  description: string;
  outcomes: string;
  capabilities: string[];
  core: boolean;
  video: { url: string | null; file: string | null; title: string };
  plate: string;
  icon: "target" | "compass" | "network" | "prism";
  image: string;
  alt: string;
};

const toServiceView = (s: Service): ServiceView => ({
  slug: s.slug,
  name: s.name,
  short: s.short,
  description: s.description,
  outcomes: s.outcomes ?? "",
  core: Boolean(s.core),
  video: {
    url: s.videoUrl ?? null,
    file: urlOf(s.videoFile as MediaLike, "") || null,
    title: s.videoTitle || s.name,
  },
  capabilities: (s.capabilities ?? []).map((c) => c.label),
  plate: s.accent ?? "plate-1",
  icon: (s.icon ?? "target") as ServiceView["icon"],
  image: urlOf(s.image as MediaLike, SERVICE_FALLBACK[s.slug] ?? PLACEHOLDER),
  alt: altOf(s.image as MediaLike, s.name),
});

export const getServices = async (): Promise<ServiceView[]> => {
  const docs = await findAll<Service>("services");
  return docs.map(toServiceView);
};

export type WorkView = {
  slug: string;
  name: string;
  category: string;
  metric: string;
  summary: string;
  plate: string;
  image: string;
  alt: string;
  /** Not a verified client result — the card and page say so publicly. */
  sample: boolean;
};

const toWorkView = (w: CaseStudy): WorkView => ({
  slug: w.slug ?? "",
  name: w.name,
  category: w.category,
  metric: w.metric,
  summary: w.summary,
  plate: w.accent ?? "w1",
  image: urlOf(w.image as MediaLike, WORK_FALLBACK[w.name] ?? PLACEHOLDER),
  alt: altOf(w.image as MediaLike, `${w.name} — ${w.category}`),
  sample: Boolean(w.sample),
});

export const getCaseStudies = async (): Promise<WorkView[]> => {
  const docs = await findAll<CaseStudy>("case-studies");
  return docs.map(toWorkView);
};

/** Portrait card crops blur when stretched across a wide hero, so keep landscape ones. */
const WORK_WIDE_FALLBACK: Record<string, string> = Object.fromEntries(
  Object.entries(WORK_FALLBACK).map(([name, src]) => [name, src.replace(".jpg", "-wide.jpg")])
);

/** Prefer the 1920px "wide" size Payload generates on upload. */
const wideUrlOf = (media: MediaLike, fallback: string): string => {
  if (media && typeof media === "object") {
    const sized = (media as { sizes?: { wide?: { url?: string | null } } }).sizes?.wide?.url;
    if (sized) return sized;
  }
  return urlOf(media, fallback);
};

export type CaseStudyView = WorkView & {
  heroImage: string;
  challenge: string;
  approach: string;
  outcome: string;
  timeframe: string;
  results: { value: string; label: string }[];
  servicesUsed: { name: string; slug: string }[];
  testimonial: { quote: string; attribution: string } | null;
};

export const getCaseStudy = async (slug: string): Promise<CaseStudyView | null> => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "case-studies",
    limit: 1,
    depth: 1,
    where: { and: [published, { slug: { equals: slug } }] },
  });
  const w = docs[0] as CaseStudy | undefined;
  if (!w) return null;
  return {
    ...toWorkView(w),
    heroImage: wideUrlOf(w.image as MediaLike, WORK_WIDE_FALLBACK[w.name] ?? "/images/hero.jpg"),
    challenge: w.challenge ?? "",
    approach: w.approach ?? "",
    outcome: w.outcome ?? "",
    timeframe: w.timeframe ?? "",
    testimonial: w.testimonialQuote
      ? { quote: w.testimonialQuote, attribution: w.testimonialAttribution ?? "" }
      : null,
    results: (w.results ?? []).map((r) => ({ value: r.value, label: r.label })),
    servicesUsed: (w.servicesUsed ?? [])
      .filter((s): s is Service => typeof s === "object" && s !== null)
      .map((s) => ({ name: s.name, slug: s.slug })),
  };
};

export type ProjectView = {
  slug: string;
  name: string;
  client: string;
  deliverables: string;
  industry: string;
  year: number | null;
  summary: string;
  image: string;
  alt: string;
};

const toProjectView = (p: Project): ProjectView => ({
  slug: p.slug ?? "",
  name: p.name,
  client: p.client,
  deliverables: p.deliverables,
  industry: p.industry ?? "",
  year: p.year ?? null,
  summary: p.summary,
  image: urlOf(p.cover as MediaLike, PLACEHOLDER),
  alt: altOf(p.cover as MediaLike, `${p.name} for ${p.client}`),
});

/** Published projects the client has agreed to show, in the admin's order. */
const projectWhere = (extra?: Where): Where => ({
  and: [published, { clientPermission: { equals: true } }, ...(extra ? [extra] : [])],
});

export const getProjects = async (options: { featured?: boolean; limit?: number } = {}): Promise<ProjectView[]> => {
  try {
    const payload = await getCms();
    const { docs } = await payload.find({
      collection: "projects",
      limit: options.limit ?? 100,
      sort: "order",
      depth: 1,
      where: projectWhere(options.featured ? { featured: { equals: true } } : undefined),
    });
    return (docs as Project[]).map(toProjectView);
  } catch {
    return [];
  }
};

export type ProjectDetailView = ProjectView & {
  heroImage: string;
  description: string;
  liveUrl: string;
  gallery: { src: string; alt: string; caption: string; width: number | null; height: number | null }[];
  services: { name: string; slug: string }[];
};

export const getProject = async (slug: string): Promise<ProjectDetailView | null> => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "projects",
    limit: 1,
    depth: 1,
    where: projectWhere({ slug: { equals: slug } }),
  });
  const p = docs[0] as Project | undefined;
  if (!p) return null;
  return {
    ...toProjectView(p),
    heroImage: wideUrlOf(p.cover as MediaLike, PLACEHOLDER),
    description: p.description ?? "",
    liveUrl: p.liveUrl ?? "",
    gallery: (p.gallery ?? [])
      .filter((g) => typeof g.image === "object" && g.image !== null)
      .map((g) => {
        const m = g.image as { url?: string | null; alt?: string | null; width?: number | null; height?: number | null };
        return {
          src: urlOf(m as MediaLike, ""),
          alt: m.alt || g.caption || p.name,
          caption: g.caption ?? "",
          width: m.width ?? null,
          height: m.height ?? null,
        };
      })
      .filter((g) => g.src),
    services: (p.services ?? [])
      .filter((s): s is Service => typeof s === "object" && s !== null)
      .map((s) => ({ name: s.name, slug: s.slug })),
  };
};

export type PostView = {
  slug: string;
  title: string;
  excerpt: string;
  topic: string;
  publishedAt: string;
  image: string | null;
  alt: string;
  author: string;
};

const toPostView = (p: Post): PostView => ({
  slug: p.slug ?? "",
  title: p.title,
  excerpt: p.excerpt,
  topic: p.topic ?? "",
  publishedAt: p.publishedAt ?? p.createdAt,
  image: urlOf(p.cover as MediaLike, "") || null,
  alt: altOf(p.cover as MediaLike, p.title),
  author: typeof p.author === "object" && p.author ? p.author.name : "",
});

/** Newest first. Posts dated in the future stay hidden until that day. */
const postWhere = (extra?: Where): Where => ({
  and: [published, { publishedAt: { less_than_equal: new Date().toISOString() } }, ...(extra ? [extra] : [])],
});

export const getPosts = async (limit = 100): Promise<PostView[]> => {
  try {
    const payload = await getCms();
    const { docs } = await payload.find({ collection: "posts", limit, sort: "-publishedAt", depth: 1, where: postWhere() });
    return (docs as Post[]).map(toPostView);
  } catch {
    return [];
  }
};

export const hasPosts = async () => (await getPosts(1)).length > 0;

export type PostDetailView = PostView & {
  content: Post["content"];
  heroImage: string | null;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
};

export const getPost = async (slug: string): Promise<PostDetailView | null> => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "posts",
    limit: 1,
    depth: 1,
    where: postWhere({ slug: { equals: slug } }),
  });
  const p = docs[0] as Post | undefined;
  if (!p) return null;
  return {
    ...toPostView(p),
    content: p.content,
    heroImage: wideUrlOf(p.cover as MediaLike, "") || null,
    seoTitle: p.seo?.title ?? "",
    seoDescription: p.seo?.description ?? "",
    updatedAt: p.updatedAt,
  };
};

/** Addresses and edit dates for the sitemap. */
export const getProjectSitemap = async () => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "projects",
    limit: 500,
    depth: 0,
    where: projectWhere(),
    select: { slug: true, updatedAt: true },
  });
  return (docs as { slug?: string | null; updatedAt: string }[])
    .filter((d) => d.slug)
    .map((d) => ({ slug: d.slug as string, updatedAt: d.updatedAt }));
};

export const getPostSitemap = async () => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "posts",
    limit: 1000,
    depth: 0,
    where: postWhere(),
    select: { slug: true, updatedAt: true },
  });
  return (docs as { slug?: string | null; updatedAt: string }[])
    .filter((d) => d.slug)
    .map((d) => ({ slug: d.slug as string, updatedAt: d.updatedAt }));
};

export type ServiceDetailView = ServiceView & {
  /** What is going wrong for the business before Zirka is involved (brief §21). */
  problem: string;
  faqs: { q: string; a: string }[];
  /** Case studies tagged with this service, so the page can prove the claim. */
  relatedWork: WorkView[];
  /** Delivered client projects that used this service. */
  relatedProjects: ProjectView[];
};

export const getService = async (slug: string): Promise<ServiceDetailView | null> => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "services",
    limit: 1,
    depth: 1,
    where: { and: [published, { slug: { equals: slug } }] },
  });
  const service = docs[0] as Service | undefined;
  if (!service) return null;

  const [{ docs: studies }, { docs: projects }] = await Promise.all([
    payload.find({
      collection: "case-studies",
      limit: 3,
      depth: 1,
      where: { and: [published, { servicesUsed: { in: [service.id] } }] },
    }),
    payload.find({
      collection: "projects",
      limit: 3,
      depth: 1,
      sort: "order",
      where: projectWhere({ services: { in: [service.id] } }),
    }),
  ]);

  return {
    ...toServiceView(service),
    problem: service.problem ?? "",
    faqs: (service.faqs ?? []).map((f) => ({ q: f.question, a: f.answer })),
    // Real client work first: it is proof. Concepts only illustrate.
    relatedWork: (studies as CaseStudy[]).map(toWorkView).sort((a, b) => Number(a.sample) - Number(b.sample)),
    relatedProjects: (projects as Project[]).map(toProjectView),
  };
};

/** Slugs and edit dates for the sitemap and for prerendering every service page. */
export const getServiceSitemap = async () => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "services",
    limit: 500,
    depth: 0,
    sort: "order",
    where: published,
    select: { slug: true, updatedAt: true },
  });
  return (docs as { slug?: string | null; updatedAt: string }[])
    .filter((d) => d.slug)
    .map((d) => ({ slug: d.slug as string, updatedAt: d.updatedAt }));
};

export type TeamView = {
  name: string;
  role: string;
  image: string;
  bio: string;
  experience: string;
  certifications: string[];
  linkedin: string;
};

/**
 * Published team members with a real uploaded photo (brief §3). There is no
 * fallback image on purpose: a person without a photo is left out rather than
 * shown with a placeholder, stock or generated face.
 */
export const getTeam = async (): Promise<TeamView[]> => {
  const docs = await findAll<TeamMember>("team-members");
  return docs
    .filter((m) => urlOf(m.photo as MediaLike, "") !== "")
    .map((m) => ({
      name: m.name,
      role: m.role,
      image: urlOf(m.photo as MediaLike, ""),
      bio: m.bio ?? "",
      experience: m.experience ?? "",
      certifications: (m.certifications ?? []).map((c) => c.name).filter(Boolean),
      linkedin: m.linkedin ?? "",
    }));
};

/** Published case study addresses with their last edit, for the sitemap. */
export const getCaseStudySitemap = async () => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "case-studies",
    limit: 500,
    depth: 0,
    where: published,
    select: { slug: true, updatedAt: true },
  });
  return (docs as { slug?: string | null; updatedAt: string }[])
    .filter((d) => d.slug)
    .map((d) => ({ slug: d.slug as string, updatedAt: d.updatedAt }));
};

export const getFaqs = async () => {
  const docs = await findAll<Faq>("faqs");
  return docs.map((f) => ({ q: f.question, a: f.answer }));
};

export const getProcessSteps = async () => {
  const docs = await findAll<{ name: string; description: string }>("process-steps");
  return docs.map((s, i) => ({
    idx: String(i + 1).padStart(2, "0"),
    name: s.name,
    description: s.description,
  }));
};

export const getValues = async () => {
  const docs = await findAll<{ name: string; description: string }>("values");
  return docs.map((v) => ({ name: v.name, description: v.description }));
};

export const getEngagements = async () => {
  const docs = await findAll<Engagement>("engagements");
  return docs.map((e) => ({
    name: e.name,
    price: e.price,
    cadence: e.cadence,
    summary: e.summary,
    includes: (e.includes ?? []).map((i) => i.label),
    featured: Boolean(e.featured),
  }));
};

export const getProjectPricing = async () => {
  const docs = await findAll<{ name: string; price: string; note?: string | null }>(
    "project-pricing"
  );
  return docs.map((p) => ({ name: p.name, price: p.price, note: p.note ?? "" }));
};

export type TestimonialView = {
  quote: string;
  name: string;
  role: string;
  company: string;
  photo: string;
  logo: string;
  result: string;
  caseStudy: { name: string; slug: string } | null;
};

/**
 * Published testimonials, featured first (brief §7). Returns an empty list
 * rather than anything to fill the space when there are none.
 */
export const getTestimonials = async (limit = 3): Promise<TestimonialView[]> => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "testimonials",
    limit,
    depth: 1,
    sort: ["-featured", "-createdAt"],
    where: published,
  });
  return (docs as Testimonial[]).map((t) => {
    const cs = t.caseStudy && typeof t.caseStudy === "object" ? t.caseStudy : null;
    return {
      quote: t.quote,
      name: t.name,
      role: t.role ?? "",
      company: t.company,
      photo: urlOf(t.photo as MediaLike, ""),
      logo: urlOf(t.logo as MediaLike, ""),
      result: t.result ?? "",
      // Only link a case study that is itself published.
      caseStudy: cs && cs._status === "published" && cs.slug ? { name: cs.name, slug: cs.slug } : null,
    };
  });
};

const FEATURE_DEFAULTS = {
  showStats: true,
  showTrustedBy: true,
  showServices: true,
  showWork: true,
  showTestimonial: true,
  showWhoWeHelp: true,
  showProcess: true,
  showPricing: true,
  showFaq: true,
  showVideo: true,
  showValues: true,
  showLeadership: true,
  showWhatsApp: true,
  whatsappFloat: true,
  translateEnabled: true,
  contactFormEnabled: true,
  quotesEnabled: true,
  bookingEnabled: true,
  analyticsEnabled: true,
  alertsEnabled: false,
  maintenanceMode: false,
};

export type FeatureFlags = typeof FEATURE_DEFAULTS;

/** The site theme chosen in Features → Theme; Emerald when unset or unknown. */
export const getSiteTheme = async (): Promise<SiteThemeId> => {
  try {
    const payload = await getCms();
    const f = (await payload.findGlobal({ slug: "features", depth: 0 })) as { siteTheme?: string | null };
    return isSiteTheme(f.siteTheme) ? f.siteTheme : "emerald";
  } catch {
    return "emerald";
  }
};

/** When audit findings are promised, from Features → Enquiry alerts; null when not set. */
export const getAuditReplyTime = async (): Promise<string | null> => {
  try {
    const payload = await getCms();
    const f = (await payload.findGlobal({ slug: "features", depth: 0 })) as { auditReplyTime?: string | null };
    return f.auditReplyTime?.trim() || null;
  } catch {
    return null;
  }
};

/** Search Console and Bing ownership codes from Features → Search engines. */
export const getSiteVerification = async (): Promise<{ google: string | null; bing: string | null }> => {
  try {
    const payload = await getCms();
    const f = (await payload.findGlobal({ slug: "features", depth: 0 })) as {
      googleVerification?: string | null;
      bingVerification?: string | null;
    };
    return { google: f.googleVerification?.trim() || null, bing: f.bingVerification?.trim() || null };
  } catch {
    return { google: null, bing: null };
  }
};

/** The owner's GA4 measurement ID from Features → Visitor analytics, or null when unset. */
export const getGaMeasurementId = async (): Promise<string | null> => {
  try {
    const payload = await getCms();
    const f = (await payload.findGlobal({ slug: "features", depth: 0 })) as { gaMeasurementId?: string | null };
    const id = f.gaMeasurementId?.trim().toUpperCase();
    return id && /^G-[A-Z0-9]{4,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

/**
 * Until the Features page is first saved its values are empty, so an unset
 * switch must mean "default" — otherwise every section would vanish on day one.
 * Read through the local API, which is how the public site reads this
 * super-admin-only global without exposing it.
 */
export const getFeatures = async (): Promise<FeatureFlags> => {
  const payload = await getCms();
  const f = (await payload.findGlobal({ slug: "features", depth: 0 })) as unknown as Record<string, unknown>;
  const flags = { ...FEATURE_DEFAULTS };
  for (const key of Object.keys(FEATURE_DEFAULTS) as (keyof FeatureFlags)[]) {
    if (typeof f[key] === "boolean") flags[key] = f[key] as boolean;
  }
  return flags;
};

/** What the maintenance notice says, as set under Features → Maintenance. */
export const getMaintenance = async () => {
  const payload = await getCms();
  const f = (await payload.findGlobal({ slug: "features", depth: 0 })) as unknown as Record<string, unknown>;
  return {
    on: f.maintenanceMode === true,
    heading: (f.maintenanceHeading as string) || "We're making some improvements.",
    message:
      (f.maintenanceMessage as string) ||
      "Our website is being updated and will be back shortly. We're still working in the meantime, and happy to help.",
  };
};

export type SolutionCategoryView = {
  name: string;
  slug: string;
  description: string;
  services: { name: string; slug: string; short: string }[];
};

/** The four solution categories (brief §5), each with its published services. */
export const getSolutionCategories = async (): Promise<SolutionCategoryView[]> => {
  const docs = await findAll<{
    name: string;
    slug: string;
    description: string;
    services?: (Service | number)[] | null;
  }>("solution-categories");
  return docs.map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    services: (c.services ?? [])
      // An unpublished service comes back as a bare id at depth 1; skip it.
      .filter((s): s is Service => typeof s === "object" && s !== null && s._status === "published")
      .map((s) => ({ name: s.name, slug: s.slug, short: s.short })),
  }));
};

export type LegalContent = {
  entity: string;
  jurisdiction: string;
  termsIntro: string;
  refundsIntro: string;
  terms: { heading: string; body: string }[];
  refunds: { heading: string; body: string }[];
};

export const getLegal = async (): Promise<LegalContent> => {
  const payload = await getCms();
  const s = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  const list = (rows: unknown) =>
    Array.isArray(rows)
      ? (rows as { heading?: string; body?: string }[])
          .filter((r) => r.heading && r.body)
          .map((r) => ({ heading: r.heading as string, body: r.body as string }))
      : [];
  return {
    entity: s.legalEntity || "",
    jurisdiction: s.legalJurisdiction || "",
    termsIntro: s.termsIntro || "",
    refundsIntro: s.refundsIntro || "",
    terms: list(s.terms),
    refunds: list(s.refunds),
  };
};

export const getSettings = async () => {
  const payload = await getCms();
  const s = await payload.findGlobal({ slug: "site-settings", depth: 1 });
  return {
    companyName: s.companyName,
    slogan: s.slogan,
    descriptor: s.descriptor ?? "Digital Marketing Agency",
    heroHeadline: s.heroHeadline,
    heroEmphasis: s.heroEmphasis ?? "",
    heroLede: s.heroLede,
    heroImage: urlOf(s.heroImage as MediaLike, "/images/hero.jpg"),
    heroAlt: altOf(
      s.heroImage as MediaLike,
      "Zirka strategists reviewing campaign performance together"
    ),
    video: {
      heading: s.videoHeading || "",
      intro: s.videoIntro || "",
      url: s.videoUrl ?? null,
      file: urlOf(s.videoFile as MediaLike, "") || null,
      poster: urlOf(s.videoPoster as MediaLike, "") || null,
    },
    aboutTitle: s.aboutTitle || "Named for a star.",
    aboutLede:
      s.aboutLede ||
      "Zirka means star — a fixed point to navigate by. That's what we aim to be for the businesses we work with.",
    storyHeading: s.storyHeading || "Who we are",
    story: (s.story ?? []).map((p) => p.text).filter(Boolean),
    storyImage: urlOf(s.storyImage as MediaLike, "/images/about-office.jpg"),
    storyAlt: altOf(s.storyImage as MediaLike, "The Zirka team at work"),
    // Digits only, whatever was typed in the admin, so every wa.me link works.
    whatsapp: whatsappDigits(s.whatsapp ?? "16787994634"),
    phoneDisplay: s.phoneDisplay ?? "",
    email: s.email?.trim() || DEFAULT_EMAIL,
    socialHandle: s.socialHandle ?? "",
    // Only links that are actually set, in a fixed order for the icon row.
    social: (
      [
        ["Facebook", s.facebookUrl],
        ["Instagram", s.instagramUrl],
        ["LinkedIn", s.linkedinUrl],
      ] as const
    )
      .filter((entry): entry is readonly ["Facebook" | "Instagram" | "LinkedIn", string] => Boolean(entry[1]?.trim()))
      .map(([network, url]) => ({ network, url: url.trim() })),
    hours: s.hours ?? "",
    stats: (s.stats ?? []).map((x) => ({ num: x.value, label: x.label })),
    trustedBy: (s.trustedBy ?? []).map((x) => x.name),
    whoWeHelp: {
      heading: s.whoWeHelp?.heading || "Built for businesses ready to grow.",
      body:
        s.whoWeHelp?.body ||
        "We work with growing businesses that want marketing tied to real business outcomes — more visibility, better leads, stronger conversion, and scalable growth.",
      industries: (s.whoWeHelp?.industries ?? []).map((i) => i.name).filter(Boolean),
    },
    projectPricingNote:
      s.projectPricingNote || "Final pricing depends on project scope and requirements.",
  };
};
