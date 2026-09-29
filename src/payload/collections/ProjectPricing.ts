import type { CollectionConfig } from "payload";
import { isAdmin, isPublicOrStaff, hiddenUnlessSuperAdmin } from "../access";

/**
 * One-off pieces of work with a fixed starting price, shown under the monthly
 * retainers. Separate from Monthly Plans because these are priced per project
 * rather than per month, and they carry no included-items list.
 */
export const ProjectPricing: CollectionConfig = {
  slug: "project-pricing",
  labels: { singular: "One-off Price", plural: "One-off Prices" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "price", "order", "_status"],
    group: "Pricing",
    hidden: hiddenUnlessSuperAdmin,
    description: "One-off project prices. Restricted to admins and super admins.",
  },
  // Same rule as the retainers: pricing is commercially sensitive.
  access: {
    read: isPublicOrStaff,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  versions: { drafts: true },
  defaultSort: "order",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: 'e.g. "Business Websites"' },
    },
    {
      name: "price",
      type: "text",
      required: true,
      admin: { description: 'e.g. "from $1,500"' },
    },
    {
      name: "note",
      type: "text",
      admin: { description: "Optional one-line clarification shown under the name." },
    },
    { name: "order", label: "Position in list", type: "number", defaultValue: 0 },
  ],
};
