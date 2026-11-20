/**
 * Applies the owner's pricing update and makes the unverified portfolio content
 * honest. Run with: npm run apply:pricing
 *
 * Safe to re-run. Nothing is deleted: the placeholder stats, client names,
 * testimonial and team profiles stay in the database but are switched off on
 * the public site, so they can be replaced with real material rather than lost.
 */
import { getPayload } from "payload";
import config from "../payload.config";
import { engagements, projectPricing, projectPricingNote, work } from "../lib/data";

const payload = await getPayload({ config });
const published = { _status: "published" as const };

// --- 1. Monthly plans -------------------------------------------------------
const existingTiers = await payload.find({ collection: "engagements", limit: 100, depth: 0 });
for (const tier of existingTiers.docs as { id: number | string }[]) {
  await payload.delete({ collection: "engagements", id: tier.id });
}
for (const [i, e] of engagements.entries()) {
  await payload.create({
    collection: "engagements",
    data: {
      ...published,
      name: e.name,
      price: e.price,
      cadence: e.cadence,
      checkoutUrl: e.checkoutUrl ?? "",
      summary: e.summary,
      includes: e.includes.map((label) => ({ label })),
      order: i,
      featured: Boolean(e.featured),
    },
  });
}
console.log(`pricing tiers: ${engagements.map((e) => `${e.name} ${e.price}`).join(", ")}`);

// --- 2. One-off project pricing --------------------------------------------
const existingProjects = await payload.find({ collection: "project-pricing", limit: 100, depth: 0 });
for (const p of existingProjects.docs as { id: number | string }[]) {
  await payload.delete({ collection: "project-pricing", id: p.id });
}
for (const [i, p] of projectPricing.entries()) {
  await payload.create({
    collection: "project-pricing",
    data: { ...published, name: p.name, price: p.price, checkoutUrl: p.checkoutUrl ?? "", order: i },
  });
}
console.log(`project prices: ${projectPricing.length}`);

await payload.updateGlobal({ slug: "site-settings", data: { projectPricingNote } });

// --- 3. Label every unverified case study as a sample -----------------------
// Service slugs in data.ts have to become real relationship ids.
const allServices = await payload.find({ collection: "services", limit: 200, depth: 0 });
const idBySlug = new Map(
  (allServices.docs as { id: number | string; slug: string }[]).map((s) => [s.slug, s.id])
);

const studies = await payload.find({ collection: "case-studies", limit: 200, depth: 0 });
for (const s of studies.docs as { id: number | string; name: string }[]) {
  // The worked example, where data.ts carries one, shows the six-part format.
  const story = work.find((w) => w.name === s.name)?.story;
  await payload.update({
    collection: "case-studies",
    id: s.id,
    data: {
      ...published,
      sample: true,
      // Concept projects claim no outcome (brief §4), so anything that reads
      // as a result — figures, timeframe, a quote — is cleared, not just hidden.
      timeframe: "",
      outcome: "",
      results: [],
      testimonialQuote: "",
      testimonialAttribution: "",
      ...(story
        ? {
            challenge: story.challenge,
            approach: story.approach,
            servicesUsed: story.serviceSlugs
              .map((slug) => idBySlug.get(slug))
              .filter((id) => id !== undefined)
              .map(Number),
          }
        : {}),
    },
  });
}
console.log(`marked as concept projects: ${(studies.docs as { name: string }[]).map((s) => s.name).join(", ")}`);

// --- 4. Hide the claims that cannot honestly be labelled --------------------
// A fabricated "94% client retention" cannot be shown with a sample badge — it
// would still read as a claim about Zirka. These stay in the database, switched
// off, until real figures replace them.
await payload.updateGlobal({
  slug: "features",
  data: {
    showStats: false,
    showTrustedBy: false,
    showTestimonial: false,
    showLeadership: false,
  },
});
console.log("switched off: homepage stats, trusted-by names, testimonial, leadership");

const testimonials = await payload.find({ collection: "testimonials", limit: 100, depth: 0 });
for (const t of testimonials.docs as { id: number | string; _status?: string }[]) {
  if (t._status === "published") {
    await payload.update({ collection: "testimonials", id: t.id, data: { _status: "draft" } });
  }
}
console.log(`testimonials held as drafts: ${testimonials.totalDocs}`);

process.exit(0);
