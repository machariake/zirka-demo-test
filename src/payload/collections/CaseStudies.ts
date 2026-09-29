import type { CollectionConfig } from "payload";
import { isStaff, isPublicOrStaff, isAdmin } from "../access";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const CaseStudies: CollectionConfig = {
  slug: "case-studies",
  labels: { singular: "Case Study", plural: "Case Studies" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "metric", "_status"],
    group: "Website",
    description: "Client work shown on the homepage, the work page, and each case study's own page.",
  },
  access: {
    read: isPublicOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  versions: { drafts: true },
  defaultSort: "order",
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Card",
          description: "What shows on the homepage and work page.",
          fields: [
            { name: "name", type: "text", required: true, admin: { description: "Client name." } },
            {
              name: "category",
              type: "text",
              required: true,
              admin: { description: 'e.g. "Skincare · Performance"' },
            },
            {
              name: "metric",
              type: "text",
              required: true,
              admin: {
                description:
                  'The headline result, e.g. "3.2× ROAS in 90 days". Real, documented results only — it is never shown on a Concept Project.',
              },
            },
            {
              name: "summary",
              type: "textarea",
              required: true,
              admin: { description: "One line on what you did." },
            },
            { name: "image", type: "upload", relationTo: "media" },
            {
              name: "accent",
              type: "select",
              defaultValue: "w1",
              options: [
                { label: "Copper", value: "w1" },
                { label: "Deep green", value: "w2" },
                { label: "Warm brown", value: "w3" },
                { label: "Forest", value: "w4" },
                { label: "Sand", value: "w5" },
                { label: "Teal", value: "w6" },
              ],
            },
          ],
        },
        {
          label: "Full story",
          description:
            "Shown on the case study's own page, in this order: challenge, solution, services, timeframe, results, testimonial. Leave blank to show the card details only.",
          fields: [
            {
              name: "challenge",
              label: "Client challenge",
              type: "textarea",
              admin: { description: "Where the client was stuck when they came to you." },
            },
            {
              // Kept as "approach" so the existing saved copy is not lost to a rename.
              name: "approach",
              label: "Zirka solution",
              type: "textarea",
              admin: { description: "What you did, and why that and not something else." },
            },
            {
              name: "servicesUsed",
              label: "Services provided",
              type: "relationship",
              relationTo: "services",
              hasMany: true,
            },
            {
              name: "timeframe",
              type: "text",
              admin: { description: 'How long the work ran, e.g. "3 months" or "Jan – Apr 2026".' },
            },
            {
              name: "outcome",
              label: "Results summary",
              type: "textarea",
              admin: { description: "What changed for the business, in words." },
            },
            {
              name: "results",
              label: "Results figures",
              type: "array",
              maxRows: 4,
              labels: { singular: "Result", plural: "Results" },
              admin: { description: "Up to four headline numbers for the results strip." },
              fields: [
                { name: "value", type: "text", required: true, admin: { description: 'e.g. "3.2×"' } },
                { name: "label", type: "text", required: true, admin: { description: 'e.g. "Return on ad spend"' } },
              ],
            },
            {
              name: "testimonialQuote",
              label: "Client testimonial",
              type: "textarea",
              admin: { description: "In the client's own words. Only use a quote they actually gave you." },
            },
            {
              name: "testimonialAttribution",
              label: "Testimonial — who said it",
              type: "text",
              admin: { description: 'e.g. "Priya Raman, Marketing Director"' },
            },
          ],
        },
      ],
    },
    {
      name: "slug",
      label: "Page address",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "The page address, e.g. /work/solace-skincare. Filled in from the name automatically.",
      },
      hooks: {
        beforeValidate: [
          // A partial update may not include `name`, so fall back to the saved document.
          // Never store "" — an empty string would collide with every other empty slug.
          ({ value, data, originalDoc }) => {
            if (value) return slugify(String(value));
            const name = data?.name ?? originalDoc?.name;
            return name ? slugify(String(name)) : undefined;
          },
        ],
      },
    },
    {
      name: "order",
      label: "Position in list",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Lower numbers appear first. The first one is the featured card.",
      },
    },
    {
      name: "sample",
      label: "Concept Project (not client work)",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Tick this for anything that is not genuine, documented client work. The site then labels it a Concept Project and hides every result, timeframe and testimonial, so a concept can never read as a client outcome.",
      },
    },
  ],
};
