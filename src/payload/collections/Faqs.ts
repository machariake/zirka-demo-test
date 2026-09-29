import type { CollectionConfig } from "payload";
import { isStaff, isPublicOrStaff, isAdmin } from "../access";

export const Faqs: CollectionConfig = {
  slug: "faqs",
  labels: { singular: "FAQ", plural: "FAQs" },
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "order", "_status"],
    group: "Website",
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
    { name: "question", type: "text", required: true },
    { name: "answer", type: "textarea", required: true },
    { name: "order", label: "Position in list", type: "number", defaultValue: 0 },
  ],
};
