import type { CollectionConfig } from "payload";
import { isStaff, isPublicOrStaff, isAdmin, hiddenUnlessSuperAdmin } from "../access";

export const Values: CollectionConfig = {
  slug: "values",
  labels: { singular: "Value", plural: "Values" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "order", "_status"],
    group: "Setup",
    hidden: hiddenUnlessSuperAdmin,
    description: "The operating principles shown on the about page.",
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
    { name: "name", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "order", label: "Position in list", type: "number", defaultValue: 0 },
  ],
};
