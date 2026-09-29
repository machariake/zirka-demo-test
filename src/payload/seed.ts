/**
 * Loads the placeholder content into a fresh database so the admin isn't empty
 * on first login. Safe to re-run: it skips anything that already exists.
 * Run with: npm run seed
 */
import { getPayload } from "payload";
import config from "../payload.config";
import { seedServices } from "./seed-services";
import {
  services,
  work,
  team,
  faqs,
  engagements,
  projectPricing,
  testimonial,
  stats,
  trustedNames,
  steps,
  values,
} from "../lib/data";

{
  const payload = await getPayload({ config });

  const count = async (collection: string) => {
    const { totalDocs } = await payload.find({
      collection: collection as never,
      limit: 0,
      depth: 0,
    });
    return totalDocs;
  };

  const published = { _status: "published" as const };

  if ((await count("services")) === 0) {
    await seedServices(payload);
    console.log(`seeded ${services.length} services`);
  }

  if ((await count("case-studies")) === 0) {
    for (const [i, w] of work.entries()) {
      await payload.create({
        collection: "case-studies",
        data: {
          ...published,
          name: w.name,
          category: w.category,
          metric: w.metric,
          summary: w.summary,
          order: i,
          accent: w.plate,
          // These are illustrations of the format, not Zirka clients. They ship
          // flagged so the site discloses that until real work replaces them.
          sample: true,
          // servicesUsed is linked separately by apply-pricing, once the
          // service records exist and their ids are known.
          ...(w.story ? { challenge: w.story.challenge, approach: w.story.approach } : {}),
        },
      });
    }
    console.log(`seeded ${work.length} case studies (flagged as samples)`);
  }

  if ((await count("team-members")) === 0) {
    for (const [i, m] of team.entries()) {
      await payload.create({
        collection: "team-members",
        data: { ...published, name: m.name, role: m.role, order: i },
      });
    }
    console.log(`seeded ${team.length} team members`);
  }

  if ((await count("process-steps")) === 0) {
    for (const [i, s] of steps.entries()) {
      await payload.create({
        collection: "process-steps",
        data: { ...published, name: s.name, description: s.description, order: i },
      });
    }
    console.log(`seeded ${steps.length} process steps`);
  }

  if ((await count("values")) === 0) {
    for (const [i, v] of values.entries()) {
      await payload.create({
        collection: "values",
        data: { ...published, name: v.name, description: v.description, order: i },
      });
    }
    console.log(`seeded ${values.length} values`);
  }

  if ((await count("faqs")) === 0) {
    for (const [i, f] of faqs.entries()) {
      await payload.create({
        collection: "faqs",
        data: { ...published, question: f.q, answer: f.a, order: i },
      });
    }
    console.log(`seeded ${faqs.length} FAQs`);
  }

  if ((await count("engagements")) === 0) {
    for (const [i, e] of engagements.entries()) {
      await payload.create({
        collection: "engagements",
        data: {
          ...published,
          name: e.name,
          price: e.price,
          cadence: e.cadence,
          summary: e.summary,
          includes: e.includes.map((label) => ({ label })),
          order: i,
          featured: Boolean(e.featured),
        },
      });
    }
    console.log(`seeded ${engagements.length} pricing tiers`);
  }

  if ((await count("project-pricing")) === 0) {
    for (const [i, p] of projectPricing.entries()) {
      await payload.create({
        collection: "project-pricing",
        data: { ...published, name: p.name, price: p.price, order: i },
      });
    }
    console.log(`seeded ${projectPricing.length} project prices`);
  }

  // Seeded as a DRAFT on purpose: this quote is placeholder copy and must not
  // appear on the live site until a real client has actually given one.
  if ((await count("testimonials")) === 0) {
    await payload.create({
      collection: "testimonials",
      data: {
        _status: "draft",
        quote: testimonial.quote,
        name: testimonial.name,
        role: testimonial.role,
        company: testimonial.company,
        featured: true,
      },
    });
    console.log("seeded 1 testimonial (as draft — replace before publishing)");
  }

  // Never overwrite settings the team has already edited.
  const existing = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  if (existing.heroLede) {
    console.log("site settings already set — left untouched");
  } else await payload.updateGlobal({
    slug: "site-settings",
    data: {
      companyName: "Zirka Digital Solutions",
      slogan: "Where Ideas Become Impact",
      descriptor: "Digital Marketing Agency",
      heroHeadline: "Turn clicks into customers.",
      heroEmphasis: "customers",
      heroLede:
        "Zirka helps growing businesses generate more leads and revenue through paid advertising, SEO, high-converting websites, content, and smart automation.",
      whatsapp: "16787994634",
      phoneDisplay: "+1 (678) 799–4634",
      email: "info@zirkadigitalsolutions.com",
      facebookUrl: "https://www.facebook.com/share/19MhNyMNVX/",
      instagramUrl: "https://www.instagram.com/iamessy_blessed",
      socialHandle: "zirka digital solutions",
      hours: "Monday – Friday, 9am – 6pm",
      stats: stats.map((s) => ({ value: s.num, label: s.label })),
      trustedBy: trustedNames.map((name) => ({ name })),
    },
  });
}

process.exit(0);
