import type { CollectionConfig } from "payload";
import { isStaff, isPublicOrStaff, isAdmin, hiddenUnlessSuperAdmin } from "../access";

export const ProcessSteps: CollectionConfig = {
  slug: "process-steps",
  labels: { singular: "Process Step", plural: "Process Steps" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "order", "_status"],
    group: "Setup",
    hidden: hiddenUnlessSuperAdmin,
    description: 'The "How we work" stages on the homepage. Order matters — they read as a sequence.',
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
    { name: "name", type: "text", required: true, admin: { description: 'e.g. "Chart"' } },
    { name: "description", type: "textarea", required: true },
    {
      name: "order",
      label: "Position in list",
      type: "number",
      defaultValue: 0,
      admin: { description: "Numbering on the site follows this order." },
    },
  ],
};
