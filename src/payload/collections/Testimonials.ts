import type { CollectionConfig } from "payload";
import { isStaff, isPublicOrStaff, isAdmin } from "../access";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "company", "featured", "_status"],
    group: "Website",
    description:
      "Genuine testimonials only, supplied by the client (brief §7) — never written for them. Published ones appear on the homepage when Features → Testimonial is on.",
  },
  access: {
    read: isPublicOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  versions: { drafts: true },
  fields: [
    { name: "quote", type: "textarea", required: true },
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", admin: { description: 'e.g. "Chief Marketing Officer"' } },
    { name: "company", type: "text", required: true },
    {
      name: "photo",
      label: "Client photo",
      type: "upload",
      relationTo: "media",
      admin: { description: "Optional, and only with their permission." },
    },
    {
      name: "logo",
      label: "Company logo",
      type: "upload",
      relationTo: "media",
      admin: { description: "Optional, and only with their permission." },
    },
    {
      name: "result",
      label: "Measurable result",
      type: "text",
      admin: { description: 'Optional, and only if documented, e.g. "42% more enquiries in 3 months".' },
    },
    {
      name: "caseStudy",
      label: "Related case study",
      type: "relationship",
      relationTo: "case-studies",
      admin: { description: "Optional link to the full story." },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Shown first when there is more than one." },
    },
  ],
};
