/**
 * Applies the content changes from the Website Implementation Brief.
 * Run with: npm run apply:brief — take a backup first (npm run backup).
 *
 * Safe to re-run: each step sets the brief's wording, so running it twice
 * changes nothing the second time.
 */
import { getPayload } from "payload";
import config from "../payload.config";
import { services as serviceData, team as placeholderTeam, work } from "../lib/data";

const payload = await getPayload({ config });

// --- §2 Homepage hero ---------------------------------------------------------
await payload.updateGlobal({
  slug: "site-settings",
  data: {
    descriptor: "Digital Marketing Agency",
    heroHeadline: "Turn clicks into customers.",
    heroEmphasis: "customers",
    heroLede:
      "Zirka helps growing businesses generate more leads and revenue through paid advertising, SEO, high-converting websites, content, and smart automation.",
  },
});
console.log("hero: Turn clicks into customers.");

// --- §5 Four solution categories ----------------------------------------------
// Existing services grouped under the brief's four headings. Strategy sits under
// Get Leads so the homepage shows all fourteen services.
const CATEGORIES = [
  {
    slug: "get-found",
    name: "Get Found",
    description:
      "Help businesses become more visible when potential customers are actively searching for what they offer.",
    services: ["seo-online-visibility"],
  },
  {
    slug: "get-leads",
    name: "Get Leads",
    description:
      "Generate qualified opportunities and improve the path from advertising click to enquiry or customer.",
    services: ["digital-marketing-strategy", "digital-advertising", "lead-generation-sales", "analytics-reporting"],
  },
  {
    slug: "build-your-brand",
    name: "Build Your Brand",
    description:
      "Build a credible, consistent digital presence that helps customers understand and trust the business.",
    services: [
      "website-development",
      "branding-graphic-design",
      "social-media-management",
      "content-creation",
      "blogging-copywriting",
      "influencer-marketing",
    ],
  },
  {
    slug: "convert-automate",
    name: "Convert & Automate",
    description:
      "Convert more opportunities and reduce repetitive manual work through better follow-up and automation.",
    services: ["ai-business-automation", "whatsapp-marketing", "email-marketing"],
  },
];

const allServices = await payload.find({ collection: "services", limit: 200, depth: 0, pagination: false });
const serviceId = new Map((allServices.docs as { id: number; slug: string }[]).map((s) => [s.slug, s.id]));

for (const [order, c] of CATEGORIES.entries()) {
  const ids = c.services.map((slug) => serviceId.get(slug)).filter((id): id is number => id !== undefined);
  const missing = c.services.filter((slug) => !serviceId.has(slug));
  if (missing.length) console.log(`  (no service found for: ${missing.join(", ")})`);
  const data = { _status: "published" as const, name: c.name, slug: c.slug, description: c.description, services: ids, order };
  const existing = await payload.find({
    collection: "solution-categories",
    limit: 1,
    depth: 0,
    where: { slug: { equals: c.slug } },
  });
  if (existing.docs[0]) {
    await payload.update({ collection: "solution-categories", id: existing.docs[0].id, data });
  } else {
    await payload.create({ collection: "solution-categories", data });
  }
}
console.log(`categories: ${CATEGORIES.map((c) => c.name).join(", ")}`);

// --- §13 Five-stage process ---------------------------------------------------
const STEPS = [
  {
    name: "Audit & Discovery",
    description: "We understand the business, goals, current marketing, competitors, and opportunities.",
  },
  { name: "Strategy", description: "We identify priorities, channels, messaging, and the plan." },
  { name: "Build & Launch", description: "We create and launch the campaigns, assets, pages, and systems." },
  { name: "Optimize", description: "We measure performance and continuously improve what is working." },
  { name: "Report & Scale", description: "We communicate results clearly and scale what is working." },
];

const oldSteps = await payload.find({ collection: "process-steps", limit: 100, depth: 0, pagination: false });
for (const step of oldSteps.docs as { id: number }[]) {
  await payload.delete({ collection: "process-steps", id: step.id });
}
for (const [order, step] of STEPS.entries()) {
  await payload.create({
    collection: "process-steps",
    data: { _status: "published", name: step.name, description: step.description, order },
  });
}
console.log(`process: ${STEPS.map((s) => s.name).join(" → ")}`);

// --- §4 Concept project summaries ---------------------------------------------
// The one-line summaries described outcomes as though they had happened ("cut
// acquisition cost", "took a firm to page one"). Concepts claim no outcome, so
// they now describe what the concept proposes.
const conceptSummaries = new Map(work.map((w) => [w.name, w.summary]));
const concepts = await payload.find({
  collection: "case-studies",
  limit: 200,
  depth: 0,
  pagination: false,
  where: { sample: { equals: true } },
});
for (const c of concepts.docs as { id: number; name: string }[]) {
  const summary = conceptSummaries.get(c.name);
  if (summary) {
    await payload.update({ collection: "case-studies", id: c.id, data: { _status: "published", summary } });
  }
}
console.log(`concept summaries: ${concepts.docs.length}`);

// --- §21 Service problem statements ---------------------------------------------
// Only fills services whose problem is still empty, so wording the team has
// already written in the admin is never overwritten.
const problemBySlug = new Map(serviceData.map((s) => [s.slug, s.problem]));
const svcDocs = await payload.find({ collection: "services", limit: 200, depth: 0, pagination: false });
let filled = 0;
for (const svc of svcDocs.docs as { id: number; slug: string; problem?: string | null }[]) {
  const text = problemBySlug.get(svc.slug);
  if (text && !svc.problem) {
    await payload.update({ collection: "services", id: svc.id, data: { _status: "published", problem: text } });
    filled++;
  }
}
console.log(`service problems filled: ${filled}`);

// --- §3 Placeholder team -------------------------------------------------------
// The four seeded people are invented, and their photos were stock images of
// real strangers. Unpublished, so they can never appear even if Leadership is
// switched on; the records stay so their structure is there to overwrite.
const invented = new Set(placeholderTeam.map((m) => m.name));
const members = await payload.find({ collection: "team-members", limit: 100, depth: 0, pagination: false });
let hidden = 0;
for (const m of members.docs as { id: number; name: string; _status?: string }[]) {
  if (invented.has(m.name) && m._status !== "draft") {
    await payload.update({ collection: "team-members", id: m.id, data: { _status: "draft" } });
    hidden++;
  }
}
console.log(`placeholder team members unpublished: ${hidden}`);

process.exit(0);
