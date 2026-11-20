export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type StarterArticle = {
  slug: string;
  title: string;
  excerpt: string;
  topic: string;
  publishedAt: string;
  updatedAt: string;
  image: string;
  alt: string;
  author: string;
  seoTitle: string;
  seoDescription: string;
  sections: ArticleSection[];
};

export const STARTER_ARTICLES: StarterArticle[] = [
  {
    slug: "social-media-management-pricing-guide",
    title: "Social Media Management Pricing & ROI: What Growing Businesses Should Expect",
    excerpt:
      "A clear breakdown of what social media management costs, what deliverables matter, and how to turn consistent posts into qualified leads.",
    topic: "Social media",
    publishedAt: "2026-11-18T09:00:00.000Z",
    updatedAt: "2026-11-18T09:00:00.000Z",
    image: "/images/svc-social-media.jpg",
    alt: "Social media apps including Instagram, TikTok, and LinkedIn on a smartphone",
    author: "Zirka Strategy Team",
    seoTitle: "Social Media Management Pricing & ROI Guide",
    seoDescription:
      "Compare social media management pricing tiers ($299–$900/mo), included deliverables, and how growing brands turn social content into measurable leads.",
    sections: [
      {
        heading: "Why cheap social posting rarely moves the needle",
        paragraphs: [
          "Most small and mid-sized businesses hit the same wall with social media: they post sporadically when someone has a spare hour, or hire a freelancer who drops generic quote graphics three times a week without any link back to revenue.",
          "Algorithms on Instagram, Facebook, TikTok, and LinkedIn reward two things above everything else — consistency and genuine engagement. When a channel goes quiet for weeks, reach drops; when every post looks like a template, potential customers scroll right past.",
        ],
      },
      {
        heading: "How to choose the right monthly management tier",
        paragraphs: [
          "Instead of locking every business into an oversized retainer, we structure our Social Media Management plans around where your business is today:",
        ],
        bullets: [
          "Starter Visibility ($299/mo): Ideal when you need two core channels kept active with custom branded posts, captions, scheduling, Google Business Profile updates, and monthly reporting.",
          "Business Growth ($599/mo): Built for businesses ready to pair multi-platform content (16–20 pieces/month) with local SEO and managed Meta or Google Ads to capture active demand.",
          "Premium Digital Growth ($900/mo): Designed for multi-channel scaling with 20–30 assets per month, combined Meta and Google Ads management, funnel optimization, and live ROI dashboards.",
        ],
      },
      {
        heading: "Connecting social channels to real enquiries",
        paragraphs: [
          "Impressions and follower counts only matter if they feed your pipeline. Every post, reel, and campaign should point prospects toward a clear next step: a fast landing page, a free marketing audit, or an instant WhatsApp conversation.",
          "When your social media calendar, website conversion flow, and ad retargeting work as one connected system, cost per lead drops steadily month over month.",
        ],
      },
    ],
  },
  {
    slug: "landing-page-vs-business-website",
    title: "Landing Page vs. Business Website: Which One Should You Build First?",
    excerpt:
      "Compare a focused $997 landing page against a 3–10 page business website so you invest in the right web build for your growth stage.",
    topic: "Websites",
    publishedAt: "2026-11-15T09:00:00.000Z",
    updatedAt: "2026-11-15T09:00:00.000Z",
    image: "/images/svc-website.jpg",
    alt: "Web development workspace showing responsive landing page design and code",
    author: "Zirka Web Team",
    seoTitle: "Landing Page vs. Business Website: Which Converts Better?",
    seoDescription:
      "Not sure whether you need a $997 landing page or a multi-page business website? Learn when each converts best and how to launch fast.",
    sections: [
      {
        heading: "When a dedicated Landing Page ($997) wins",
        paragraphs: [
          "If you are running Google Ads, Meta Ads, or promoting a single flagship offer, sending paid traffic to a cluttered homepage leaks budget. A dedicated landing page removes distractions and walks visitors through one clear promise, proof points, and a single call to action.",
          "Because every section is built around conversion, landing pages routinely outperform generic homepages by 2x to 3x on paid campaigns.",
        ],
        bullets: [
          "Best for single offers, lead magnets, local service promos, and ad campaigns.",
          "Includes mobile-first layout, lead capture forms, WhatsApp integration, and pixel tracking.",
          "Fast turnaround so your campaigns can start generating enquiries immediately.",
        ],
      },
      {
        heading: "When a Business Website (3–5 or 6–10 pages) is the smarter investment",
        paragraphs: [
          "When prospects search your brand name on Google, compare agencies, or want to verify your credibility before buying, a single page isn't enough. A Business Website (3–5 pages at $2,000) gives visitors dedicated Home, Services, About, Work, and Contact pages.",
          "Larger teams or multi-service companies benefit from our Large Business Website (6–10 pages at $4,000), giving each core service its own SEO-optimized landing hub so Google can rank you for multiple commercial keywords.",
        ],
      },
      {
        heading: "Protecting your investment with Website Care",
        paragraphs: [
          "Launching a site is day one, not the finish line. Unpatched plugins, broken forms, or slow hosting quietly cost leads. Adding Website Care ($129/mo) covers automated backups, security monitoring, speed checks, and ongoing updates so your site stays fast and reliable year-round.",
        ],
      },
    ],
  },
  {
    slug: "local-seo-google-maps-checklist",
    title: "Local SEO & Google Maps Checklist: How to Rank Above Competitors",
    excerpt:
      "Practical on-page SEO, technical speed, schema markup, and Google Business Profile steps that help local businesses capture high-intent searches.",
    topic: "SEO",
    publishedAt: "2026-11-12T09:00:00.000Z",
    updatedAt: "2026-11-12T09:00:00.000Z",
    image: "/images/svc-seo.jpg",
    alt: "SEO strategist reviewing search rankings and technical audits on a laptop",
    author: "Zirka SEO Team",
    seoTitle: "Local SEO & Google Maps Checklist for Higher Rankings",
    seoDescription:
      "Step-by-step local SEO checklist covering Google Business Profile optimization, schema markup, page speed, and service pages that rank in Google.",
    sections: [
      {
        heading: "1. Give every core service its own optimized page",
        paragraphs: [
          "One of the most common reasons business websites stall on page three is bundling ten services onto one page. Google ranks specific pages for specific search intent.",
          "Each service page should include a clear H1, a unique 140–160 character meta description, problem-and-solution copy above 500 words, and internal links back to pricing and related services.",
        ],
      },
      {
        heading: "2. Fix technical speed and structured data (JSON-LD)",
        paragraphs: [
          "Search engines rely on Core Web Vitals and Schema.org structured data to understand who you are, what you sell, and what your packages cost.",
        ],
        bullets: [
          "Serve responsive AVIF/WebP images with proper caching headers.",
          "Add Organization, ProfessionalService, Service, OfferCatalog, FAQPage, and BreadcrumbList JSON-LD markup.",
          "Maintain a clean XML sitemap and robots.txt pointing crawlers to every public service and blog page.",
        ],
      },
      {
        heading: "3. Optimize your Google Business Profile weekly",
        paragraphs: [
          "Your Google Business Profile is often the first thing customers see on mobile search and Google Maps. Keep your primary and secondary categories accurate, list every individual service with descriptions, upload real project photos, and reply promptly to every customer review.",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-ai-lead-automation-guide",
    title: "How WhatsApp & AI Automation Capture After-Hours Leads Automatically",
    excerpt:
      "Slow lead follow-up kills conversions. Learn how automated WhatsApp workflows and AI assistants qualify prospects 24/7.",
    topic: "Automation",
    publishedAt: "2026-11-08T09:00:00.000Z",
    updatedAt: "2026-11-08T09:00:00.000Z",
    image: "/images/svc-whatsapp.jpg",
    alt: "Customer messaging a business on WhatsApp for quick lead qualification",
    author: "Zirka Automation Team",
    seoTitle: "WhatsApp & AI Lead Automation for 24/7 Conversions",
    seoDescription:
      "Discover how WhatsApp marketing and AI chatbots reply to leads in seconds, qualify buyers after hours, and book strategy calls automatically.",
    sections: [
      {
        heading: "The 5-minute response gap",
        paragraphs: [
          "Studies consistently show that prospects who wait more than 15 minutes for a reply move on to the next Google result or Instagram ad. Most growing businesses receive a large share of enquiries in the evenings and on weekends when no staff member is online.",
        ],
      },
      {
        heading: "What a smart WhatsApp & AI workflow handles for you",
        paragraphs: [
          "Automation doesn't mean robotic spam. A well-designed WhatsApp Business and AI system greets prospects warmly, answers common pricing or timeline questions accurately, and routes ready buyers straight to booking or checkout:",
        ],
        bullets: [
          "Instant greeting and service menu when a prospect clicks a WhatsApp ad or website button.",
          "Automated lead qualification collecting name, business type, goal, and budget range.",
          "Direct handoff to your Stripe checkout link, onboarding form, or calendar booking slot.",
          "Follow-up reminders so warm enquiries never slip through the cracks.",
        ],
      },
    ],
  },
  {
    slug: "meta-ads-vs-google-ads-budget",
    title: "Meta Ads vs. Google Ads: Where Should You Spend Your First Marketing Budget?",
    excerpt:
      "Understand the difference between capturing existing search demand on Google and creating demand on Facebook and Instagram.",
    topic: "Advertising",
    publishedAt: "2026-11-04T09:00:00.000Z",
    updatedAt: "2026-11-04T09:00:00.000Z",
    image: "/images/svc-performance.jpg",
    alt: "Marketing analytics dashboard showing Google Ads and Meta Ads conversion metrics",
    author: "Zirka Media Team",
    seoTitle: "Meta Ads vs. Google Ads: Where to Invest First",
    seoDescription:
      "Should your business start with Google Ads or Facebook & Instagram Ads? Compare intent, creative needs, tracking, and budget strategy.",
    sections: [
      {
        heading: "Google Ads: Capturing high-intent buyers already searching",
        paragraphs: [
          "When someone types 'website designer near me' or 'B2B digital marketing agency' into Google, they already know they have a problem and are actively looking for a provider. Google Search Ads put your offer directly in front of that ready-to-buy intent.",
          "To make Google Ads profitable, pair tightly themed keyword groups with dedicated landing pages and accurate conversion tracking.",
        ],
      },
      {
        heading: "Meta Ads (Facebook & Instagram): Creating demand with strong creative",
        paragraphs: [
          "People scrolling Instagram Reels or Facebook aren't searching for an agency — they are browsing. Meta Ads win when your hook, visual proof, and offer stop the scroll and invite a low-friction action like a Free Marketing Audit or WhatsApp chat.",
        ],
        bullets: [
          "Start with Google Ads when customers actively search for your service by name.",
          "Start with Meta Ads when your offer is visual, impulse-friendly, or needs education.",
          "Combine both with retargeting once tracking pixels and conversion APIs are verified.",
        ],
      },
    ],
  },
];

export function getStarterArticle(slug: string): StarterArticle | undefined {
  return STARTER_ARTICLES.find((a) => a.slug === slug);
}
