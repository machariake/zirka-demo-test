import type { CollectionConfig } from "payload";
import { isAdmin, isPublicOrStaff, isStaff } from "../access";

/**
 * The four ways the homepage explains Zirka (brief §5): Get Found, Get Leads,
 * Build Your Brand, Convert & Automate. Each groups existing services rather
 * than replacing them — every service keeps its own page, and the full
 * catalogue stays on /services.
 */
export const SolutionCategories: CollectionConfig = {
  slug: "solution-categories",
  labels: { singular: "Solution Category", plural: "Solution Categories" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "order", "_status"],
    group: "Website",
    description:
      "The four headline categories on the homepage, the Services page and the Services menu. Pick which services belong to each.",
  },
  access: {
    read: isPublicOrStaff,
    create: isAdmin,
    update: isStaff,
    delete: isAdmin,
  },
  versions: { drafts: true },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true, admin: { description: 'e.g. "Get Found"' } },
    {
      name: "slug",
      label: "Page address",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        description: 'Used in links, e.g. "get-found" gives /services#get-found. Lowercase and hyphens only.',
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      admin: { description: "One or two sentences on the outcome, not the tasks." },
    },
    {
      name: "services",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      admin: { description: "The services shown under this category. A service can sit in more than one." },
    },
    { name: "order", label: "Position in list", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
