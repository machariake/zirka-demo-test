import type { CollectionConfig } from "payload";
import { isAdmin, isPublicOrStaff, hiddenUnlessSuperAdmin } from "../access";

export const Engagements: CollectionConfig = {
  slug: "engagements",
  labels: { singular: "Monthly Plan", plural: "Monthly Plans" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "price", "featured", "_status"],
    group: "Pricing",
    hidden: hiddenUnlessSuperAdmin,
    description: "Pricing is restricted to admins and super admins.",
  },
  // Pricing is commercially sensitive — workers cannot touch it.
  access: {
    read: isPublicOrStaff,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  versions: { drafts: true },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true, admin: { description: 'e.g. "Zirka Growth"' } },
    { name: "price", type: "text", required: true, admin: { description: 'e.g. "From $950" or "Custom Quote"' } },
    {
      name: "cadence",
      type: "text",
      required: true,
      defaultValue: "per month",
      admin: { description: 'e.g. "per month" or "one-off scope"' },
    },
    { name: "summary", type: "textarea", required: true },
    {
      name: "includes",
      type: "array",
      // A tier described in a sentence rather than a list (Custom Partnership)
      // has no line items, so this cannot be required.
      labels: { singular: "Line item", plural: "Line items" },
      fields: [{ name: "label", type: "text", required: true }],
    },
    { name: "order", label: "Position in list", type: "number", defaultValue: 0 },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { description: 'Highlights the tier and adds the "Most common" badge.' },
    },
  ],
};
