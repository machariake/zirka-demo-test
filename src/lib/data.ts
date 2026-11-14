export const stats = [
  { num: "3.4×", label: "Average client ROAS" },
  { num: "128", label: "Brands guided since 2019" },
  { num: "$42M", label: "Ad spend managed yearly" },
  { num: "94%", label: "Client retention rate" },
];

export const trustedNames = [
  "Solace Skincare",
  "Northline Freight",
  "Fernwhistle Coffee",
  "Atlas Fitness",
  "Harlow & Rye",
];

export type Service = {
  slug: string;
  name: string;
  short: string;
  /** The customer's situation before Zirka (brief §21). Describes, never claims. */
  problem: string;
  description: string;
  capabilities: string[];
  core: boolean;
  plate: "plate-1" | "plate-2" | "plate-3" | "plate-4";
  icon: "target" | "compass" | "network" | "prism";
  image: string;
  alt: string;
};

/** Zirka's real service list. The first ten are core services promoted on the homepage. */
export const services: Service[] = [
  {
    slug: "digital-advertising",
    problem:
      "You're paying for ads but can't say which ones bring in customers. Budget spreads across platforms with no clear picture of what each dollar returns, so it's hard to know whether to spend more or stop.",
    name: "Digital Advertising",
    short: "Paid campaigns on the platforms your customers actually use, built to bring in leads and sales.",
    description:
      "We plan, launch and manage paid campaigns across Meta, Google, TikTok, YouTube and LinkedIn — from lead generation to e-commerce sales — and keep adjusting them against what's really converting.",
    capabilities: [
      "Facebook & Instagram Ads",
      "Google Ads",
      "TikTok Ads",
      "YouTube Ads",
      "LinkedIn Ads",
      "Retargeting Campaigns",
      "Lead Generation Campaigns",
      "E-commerce Advertising",
    ],
    core: true,
    plate: "plate-1",
    icon: "target",
    image: "/images/svc-performance.jpg",
    alt: "Advertising performance dashboard on a laptop screen",
  },
  {
    slug: "social-media-management",
    problem:
      "Your channels go quiet for weeks, then get a burst of posts whenever someone finds the time. Without a plan or a consistent look, followers don't know what to expect, and the channels rarely lead to enquiries.",
    name: "Social Media Management",
    short: "Consistent, on-brand social channels your audience wants to follow.",
    description:
      "We run your Facebook, Instagram, TikTok and LinkedIn end to end — strategy, content calendars, short-form video and community replies — so your channels stay active and on-message.",
    capabilities: [
      "Facebook Management",
      "Instagram Management",
      "TikTok Management",
      "LinkedIn Management",
      "Social Media Strategy",
      "Content Calendar Management",
      "Community Management",
      "Reels & Short-Form Content",
      "Influencer Marketing",
    ],
    core: true,
    plate: "plate-3",
    icon: "network",
    image: "/images/svc-social-media.jpg",
    alt: "Phone screen showing social media apps including Instagram, TikTok and LinkedIn",
  },
  {
    slug: "website-development",
    problem:
      "Your website looks dated, loads slowly on phones, or doesn't make it obvious what you do and how to get in touch — so visitors leave before they ever enquire.",
    name: "Website Development",
    short: "Fast, professional websites designed to turn visitors into enquiries.",
    description:
      "From business and corporate sites to e-commerce stores, landing pages and booking systems, we design and build websites that load fast, look right on every device, and stay secure and up to date.",
    capabilities: [
      "Business Websites",
      "E-commerce Websites",
      "Landing Pages",
      "Portfolio Websites",
      "Corporate Websites",
      "Booking & Appointment Websites",
      "Website Redesign",
      "Website Maintenance",
      "Website Security & Updates",
    ],
    core: true,
    plate: "plate-4",
    icon: "prism",
    image: "/images/svc-website.jpg",
    alt: "Monitor showing website code beside a landing page design",
  },
  {
    slug: "seo-online-visibility",
    problem:
      "When customers search for what you offer, competitors show up and you don't — on Google or on the map. Each of those searches is someone ready to buy, going somewhere else.",
    name: "SEO & Online Visibility",
    short: "Get found on Google and Google Maps when customers search for what you offer.",
    description:
      "Technical fixes, keyword research, on-page and off-page SEO, and Google Business Profile optimisation — so your business shows up in search and on the map, locally and beyond.",
    capabilities: [
      "Search Engine Optimization (SEO)",
      "Local SEO",
      "Google Business Profile Optimization",
      "Keyword Research",
      "Technical SEO",
      "On-Page SEO",
      "Off-Page SEO",
      "SEO Content Writing",
      "Google Maps Visibility",
      "Website SEO Audits",
    ],
    core: true,
    plate: "plate-2",
    icon: "compass",
    image: "/images/svc-seo.jpg",
    alt: "Hands typing on a laptop while researching",
  },
  {
    slug: "content-creation",
    problem:
      "Your photos, graphics and videos don't look as good as your work really is, or there simply isn't enough content to keep your channels and ads fresh.",
    name: "Content Creation",
    short: "Scroll-stopping graphics, photos and videos made for your brand.",
    description:
      "Social graphics, promotional and corporate videos, reels and TikToks, product photography and motion graphics — produced and edited to look professional and fit each platform.",
    capabilities: [
      "Social Media Graphics",
      "Promotional Videos",
      "Video Editing",
      "Reels & TikTok Videos",
      "Product Photography",
      "Corporate Videos",
      "Motion Graphics",
      "Marketing Creatives",
    ],
    core: true,
    plate: "plate-3",
    icon: "network",
    image: "/images/svc-social.jpg",
    alt: "Camera body and lenses laid out on a dark surface",
  },
  {
    slug: "lead-generation-sales",
    problem:
      "Enquiries arrive in a trickle, or arrive and go nowhere: replies are slow, follow-up is forgotten, and there's no clear record of which leads became customers.",
    name: "Lead Generation & Sales",
    short: "A steady flow of qualified leads, and the systems to follow them up.",
    description:
      "Lead campaigns, landing-page and sales funnels, WhatsApp lead generation, CRM setup and follow-up systems — so fewer enquiries slip through the cracks and more of them become customers.",
    capabilities: [
      "Lead Generation Campaigns",
      "WhatsApp Lead Generation",
      "Landing Page Funnels",
      "Sales Funnels",
      "Customer Acquisition Campaigns",
      "Conversion Rate Optimization",
      "Lead Management",
      "CRM Setup",
      "Customer Follow-Up Systems",
    ],
    core: true,
    plate: "plate-1",
    icon: "target",
    image: "/images/svc-leads.jpg",
    alt: "Two people shaking hands after a business meeting",
  },
  {
    slug: "whatsapp-marketing",
    problem:
      "Customers message you on WhatsApp, but replies depend on whoever happens to see the chat. Questions sit unanswered after hours, and there's no easy way to reach past customers again.",
    name: "WhatsApp Marketing",
    short: "Turn WhatsApp into a sales channel, from catalogue to automated follow-up.",
    description:
      "We set up WhatsApp Business and catalogues, run broadcast campaigns, and build automated replies and sales funnels so customers get answers quickly and leads keep moving.",
    capabilities: [
      "WhatsApp Business Setup",
      "WhatsApp Marketing Campaigns",
      "WhatsApp Catalog Setup",
      "Automated Responses",
      "WhatsApp Lead Generation",
      "Customer Follow-Up",
      "WhatsApp Chat Automation",
      "WhatsApp Sales Funnels",
    ],
    core: true,
    plate: "plate-2",
    icon: "network",
    image: "/images/svc-whatsapp.jpg",
    alt: "Hand holding a phone with a WhatsApp conversation open",
  },
  {
    slug: "ai-business-automation",
    problem:
      "Your team spends hours on the same questions, the same follow-ups and the same admin, and enquiries that arrive after hours wait until morning — or go to a competitor.",
    name: "AI & Business Automation",
    short: "AI chatbots and automations that answer, qualify and follow up around the clock.",
    description:
      "AI chatbots and customer support, WhatsApp automation, lead qualification and automated follow-up — plus process automation that takes repetitive work off your team's plate.",
    capabilities: [
      "AI Chatbots",
      "AI Customer Support",
      "WhatsApp Automation",
      "AI Lead Qualification",
      "Automated Customer Follow-Up",
      "AI Content Creation Systems",
      "Business Process Automation",
      "AI-Powered Marketing Automation",
    ],
    core: true,
    plate: "plate-4",
    icon: "prism",
    image: "/images/svc-ai.jpg",
    alt: "A robot hand and a human hand reaching toward the letters AI",
  },
  {
    slug: "branding-graphic-design",
    problem:
      "Your logo, colours and materials don't match from one place to the next, so the business looks less established than it is and is harder to remember.",
    name: "Branding & Graphic Design",
    short: "A brand identity and marketing materials that look as good as your work.",
    description:
      "Logos and full brand identities, business profiles, posters, flyers, brochures, business cards, packaging and social designs — consistent everywhere your customers see you.",
    capabilities: [
      "Logo Design",
      "Brand Identity",
      "Business Profiles",
      "Posters & Flyers",
      "Brochures",
      "Business Cards",
      "Social Media Designs",
      "Packaging Designs",
      "Marketing Materials",
    ],
    core: true,
    plate: "plate-3",
    icon: "prism",
    image: "/images/svc-brand.jpg",
    alt: "Designer working with a drawing tablet and colour swatches",
  },
  {
    slug: "digital-marketing-strategy",
    problem:
      "You're doing some marketing, but it isn't joined up. It's hard to say which channels are worth the money, what to do next, or how any of it connects to revenue.",
    name: "Digital Marketing Strategy",
    short: "A clear plan for where to spend, what to say, and how to grow.",
    description:
      "Market and competitor research, customer insight and brand positioning, turned into a practical campaign plan, content strategy and growth roadmap your team can act on.",
    capabilities: [
      "Digital Marketing Strategy",
      "Competitor Analysis",
      "Market Research",
      "Brand Positioning",
      "Customer Research",
      "Marketing Campaign Planning",
      "Content Strategy",
      "Growth Strategy",
    ],
    core: true,
    plate: "plate-1",
    icon: "compass",
    image: "/images/svc-strategy.jpg",
    alt: "Two people planning on a whiteboard",
  },
  {
    slug: "email-marketing",
    problem:
      "You have a list of customers and past enquiries but rarely email them — or send everyone the same message — so repeat business is left on the table.",
    name: "Email Marketing",
    short: "Email campaigns and automations that keep customers coming back.",
    description:
      "Newsletters, promotional campaigns and automated follow-up emails, backed by a clear email strategy and a well-managed list.",
    capabilities: [
      "Email Campaigns",
      "Newsletter Management",
      "Promotional Emails",
      "Customer Follow-Up Emails",
      "Email Automation",
      "Email Marketing Strategy",
      "Email List Management",
    ],
    core: false,
    plate: "plate-2",
    icon: "target",
    image: "/images/svc-email.jpg",
    alt: "Person typing on a laptop showing a contact list",
  },
  {
    slug: "blogging-copywriting",
    problem:
      "The words on your website and posts don't explain clearly what you do or why someone should choose you, and there's little written content for search engines to find.",
    name: "Blogging & Copywriting",
    short: "Words that explain what you do and persuade people to act.",
    description:
      "Website and landing-page copy, SEO blog articles, ad and social copy, product descriptions, business profiles and email copy — written for your audience and your goals.",
    capabilities: [
      "Website Content",
      "Blog Articles",
      "SEO Blog Writing",
      "Social Media Copy",
      "Advertisement Copy",
      "Landing Page Copy",
      "Product Descriptions",
      "Business Profiles",
      "Email Copywriting",
    ],
    core: false,
    plate: "plate-4",
    icon: "compass",
    image: "/images/svc-copywriting.jpg",
    alt: "Hand writing notes in an open notebook",
  },
  {
    slug: "influencer-marketing",
    problem:
      "You'd like trusted voices to introduce your brand, but finding the right creators, agreeing terms and knowing whether it worked takes time you don't have.",
    name: "Influencer Marketing",
    short: "The right creators, the right partnerships, and results you can track.",
    description:
      "We research and approach influencers, manage partnerships and campaign coordination, collaborate on content, and track how each campaign performs.",
    capabilities: [
      "Influencer Research",
      "Influencer Campaign Management",
      "Influencer Partnerships",
      "Campaign Coordination",
      "Content Collaboration",
      "Campaign Performance Tracking",
    ],
    core: false,
    plate: "plate-3",
    icon: "network",
    image: "/images/svc-influencer.jpg",
    alt: "Creator filming with a phone in front of a ring light",
  },
  {
    slug: "analytics-reporting",
    problem:
      "Reports are missing, or full of numbers that don't answer the real question: what is your marketing actually returning?",
    name: "Analytics & Reporting",
    short: "Clear reports that show what your marketing is really returning.",
    description:
      "Google Analytics, Meta and Google Ads analytics and conversion tracking set up properly, with regular performance and ROI reports you can actually read.",
    capabilities: [
      "Google Analytics Setup",
      "Meta Ads Analytics",
      "Google Ads Analytics",
      "Conversion Tracking",
      "Social Media Analytics",
      "Campaign Performance Reports",
      "Website Performance Reports",
      "ROI & Marketing Reports",
    ],
    core: false,
    plate: "plate-1",
    icon: "target",
    image: "/images/svc-analytics.jpg",
    alt: "Hand-drawn growth chart on paper beside a ruler and pens",
  },
];

export type WorkItem = {
  name: string;
  category: string;
  metric: string;
  summary: string;
  plate: "w1" | "w2" | "w3" | "w4" | "w5" | "w6";
  image: string;
  alt: string;
  /**
   * A concept brief and the strategy Zirka would propose for it. Only the first
   * entry carries one, so the Work page shows the concept format rather than an
   * empty page. Concept projects claim no timeframe, results or testimonial
   * (brief §4) — there was no engagement for any of those to come from.
   */
  story?: {
    challenge: string;
    approach: string;
    /** Slugs from `services` above — resolved to real records when written. */
    serviceSlugs: string[];
  };
};

export const work: WorkItem[] = [
  {
    name: "Solace Skincare",
    category: "Skincare · Performance",
    metric: "3.2× ROAS in 90 days",
    summary: "A concept for rebuilding paid social around separate audiences and a tiered retargeting funnel.",
    plate: "w1",
    image: "/images/work-skincare.jpg",
    alt: "Minimal skincare serum bottle with a gold cap on a marble surface",
    story: {
      challenge:
        "An illustrative brief: a skincare brand spends steadily on paid social but cannot say which of it works. Every campaign targets the same cold audience, the same few images run for months, and the only figure anyone reviews is total monthly sales.",
      approach:
        "We would start by separating audiences, so new, returning and lapsed customers each get their own campaigns and budgets. That shows which spend finds new customers and which pays for people who would have bought anyway.\n\nWe would then set a fortnightly creative cycle — new concepts tested against the current best, with weaker ads retired rather than left running — and rebuild tracking so each sale can be traced back to the ad that started it.",
      serviceSlugs: ["digital-advertising", "content-creation", "analytics-reporting"],
    },
  },
  {
    name: "Northline Freight",
    category: "Freight · SEO",
    metric: "+118% organic traffic",
    summary: "A concept for a technical SEO overhaul and a content plan built around how shippers actually search.",
    plate: "w2",
    image: "/images/work-freight.jpg",
    alt: "Freight truck on a highway at dusk",
  },
  {
    name: "Fernwhistle Coffee",
    category: "Coffee · Brand + Web",
    metric: "4.6× revenue in 1 year",
    summary: "A concept identity system and subscription-first website for a specialty coffee brand.",
    plate: "w3",
    image: "/images/work-coffee.jpg",
    alt: "Bright specialty coffee shop interior with arched windows and a hand-set menu board",
  },
  {
    name: "Atlas Fitness",
    category: "Fitness App · Paid Social",
    metric: "−62% cost per install",
    summary: "A concept for a creative-testing routine that helps a fitness app find its strongest ads sooner.",
    plate: "w4",
    image: "/images/work-fitness.jpg",
    alt: "Moody gym interior with weight racks under warm lighting",
  },
  {
    name: "Harlow & Rye",
    category: "Home Goods · Email / CRM",
    metric: "+41% repeat purchase rate",
    summary: "A concept lifecycle email programme built around how often customers actually buy, not a weekly blast.",
    plate: "w5",
    image: "/images/work-homegoods.jpg",
    alt: "Row of handmade ceramic vases in neutral glazes",
  },
  {
    name: "Meridian Legal",
    category: "Professional Services · SEO",
    metric: "3.1× qualified leads",
    summary: "A concept local SEO and digital PR programme for a law firm with several offices.",
    plate: "w6",
    image: "/images/work-legal.jpg",
    alt: "Modern glass-walled meeting room with a long table in raking daylight",
  },
];

export const steps = [
  {
    idx: "01",
    name: "Chart",
    description: "Audit the market, the funnel, and the data — find out where the growth is actually stuck.",
  },
  {
    idx: "02",
    name: "Align",
    description: "Set the channel mix and budget plan against one shared revenue target, not vanity metrics.",
  },
  {
    idx: "03",
    name: "Launch",
    description: "Ship campaigns, content, and pages in weeks, not quarters — built to be measured from day one.",
  },
  {
    idx: "04",
    name: "Navigate",
    description: "Weekly optimization against the data, so spend keeps moving toward what's actually working.",
  },
];

export type Engagement = {
  name: string;
  price: string;
  cadence: string;
  summary: string;
  includes: string[];
  featured?: boolean;
};

export const engagements: Engagement[] = [
  {
    name: "Zirka Starter",
    price: "From $950",
    cadence: "per month",
    summary:
      "Best for a small business that needs a steady, professional presence but has nobody running it.",
    includes: [
      "2 social media platforms",
      "12 custom posts/month",
      "Captions and scheduling",
      "Google Business Profile support",
      "Monthly performance report",
      "1 strategy call/month",
    ],
  },
  {
    name: "Zirka Growth",
    price: "From $1,850",
    cadence: "per month",
    summary:
      "Best for a business ready to spend on ads and see exactly what comes back.",
    includes: [
      "Up to 3 social platforms",
      "16–20 content pieces/month",
      "Basic/local SEO",
      "Meta Ads OR Google Ads management",
      "Lead/conversion tracking",
      "Monthly strategy call",
      "Detailed monthly reporting",
      "Ad spend is separate",
    ],
    featured: true,
  },
  {
    name: "Zirka Scale",
    price: "From $3,500",
    cadence: "per month",
    summary: "Best for a business growing on several channels at once.",
    includes: [
      "Multi-channel digital marketing",
      "20–30 content assets/month",
      "SEO",
      "Meta + Google Ads management",
      "Landing page/funnel optimization",
      "Analytics/dashboard",
      "Ongoing growth strategy",
      "Ad spend is separate",
    ],
  },
  {
    name: "Custom Partnership",
    price: "Custom Quote",
    cadence: "tailored scope",
    summary:
      "For larger companies requiring extensive marketing, automation, websites, multiple campaigns or custom solutions.",
    // No line items: the owner supplied a description for this tier and no list,
    // so inventing four would be putting words in their mouth.
    includes: [],
  },
];

/** One-off pieces of work, priced per project rather than per month. */
export const projectPricing = [
  { name: "Landing Pages", price: "$997" },
  { name: "Business Websites (3-5 pages)", price: "$2,000" },
  { name: "Large Business Website (6-10 pages)", price: "$4,000" },
  { name: "Website Care & Maintenance", price: "$129/month" },
  { name: "E-commerce Websites", price: "from $2,500" },
  { name: "Logo/Mini Brand Identity", price: "from $600" },
  { name: "Full Brand Identity", price: "from $1,500" },
  { name: "SEO Audit", price: "from $500" },
  { name: "Ad Campaign Setup", price: "from $400" },
  { name: "AI/WhatsApp Automation", price: "from $750" },
];

export const projectPricingNote =
  "Final pricing depends on project scope and requirements.";

/**
 * Shared by the quote form and the contact form so the two can never disagree.
 * The breaks line up with the plan boundaries ($950 Starter, $1,850 Growth,
 * $3,500 Scale), so an answer says which plan the enquiry is really about.
 * The last option is for one-off websites and logos, which have no monthly fee.
 *
 * If the plan prices change, change these with them.
 */
export const budgetRanges = [
  "Not sure yet",
  "Under $950 a month",
  "$950 – $1,850 a month",
  "$1,850 – $3,500 a month",
  "$3,500+ a month",
  "One-off project, not monthly",
];

export const faqs = [
  {
    q: "How quickly will we see results?",
    a: "It depends on the channel, and we'll tell you which at kickoff rather than after. Paid media usually shows a readable signal in two to three weeks. SEO and content compound over three to six months. Anyone promising you rankings in thirty days is selling you something.",
  },
  {
    q: "What's the minimum commitment?",
    a: "Retainers start on a three-month initial term, then run month to month. The initial term exists because most channels need that long to produce data worth acting on — not to lock you in. Projects are scoped as one-off work with no ongoing commitment.",
  },
  {
    q: "Do you work alongside our in-house team?",
    a: "Often, yes. Sometimes we run the channels a small team can't staff; sometimes we build the system and train your team to take it over. We'd rather hand something off well than manufacture a dependency.",
  },
  {
    q: "Who actually works on my account?",
    a: "The strategist you meet in the first conversation runs your account in month twelve. There's no pitch team that disappears after signing and no handoff to a junior pod — that's the main reason we stay deliberately small.",
  },
  {
    q: "How do you report on performance?",
    a: "You get access to the same live dashboard we work from, so you can check any number at any time without asking. On top of that there's a monthly review call where we talk through what moved, what didn't, and what changes next month.",
  },
  {
    q: "What happens if it isn't working?",
    a: "We tell you before you have to ask. If a channel isn't earning its spend, we say so, explain why, and either fix it or move the budget somewhere that will. After the initial term you're month to month, so staying is always your choice.",
  },
];

export const testimonial = {
  quote:
    "We'd been through two agencies that sent beautiful reports and no revenue. Zirka rebuilt our funnel in six weeks and showed us the number that actually mattered. We've tripled spend since, because every dollar is accounted for.",
  name: "Priya Raman",
  role: "Chief Marketing Officer",
  company: "Solace Skincare",
};

export const values = [
  {
    name: "Revenue is the brief",
    description:
      "Reach and impressions are inputs, not the deliverable. Every plan is written back against pipeline or sales.",
  },
  {
    name: "Show the working",
    description:
      "Clients see the same dashboards we do. No metric ships in a report that they can't also pull themselves.",
  },
  {
    name: "Small team, senior hands",
    description:
      "No handoff to a junior pod after the pitch. The strategist you meet in week one runs the account in month twelve.",
  },
];

export type TeamMember = {
  name: string;
  role: string;
  image: string;
};

export const team: TeamMember[] = [
  { name: "Dara Osei", role: "Founder & Strategy Director", image: "/images/team-dara.jpg" },
  { name: "Marcus Wren", role: "Head of Performance Media", image: "/images/team-marcus.jpg" },
  { name: "Imogen Castellan", role: "Head of SEO & Content", image: "/images/team-imogen.jpg" },
  { name: "Teo Alvarez", role: "Creative & Brand Director", image: "/images/team-teo.jpg" },
];
