import type { CollectionConfig } from "payload";
import { isAdmin, hiddenUnlessSuperAdmin } from "../access";

/**
 * Deliberately minimal: no IP address, no cookie, no personal data.
 * `session` is a random id held in sessionStorage that dies when the tab closes,
 * which is enough to tell one visit from ten page views without identifying anyone.
 */
export const PageViews: CollectionConfig = {
  slug: "page-views",
  labels: { singular: "Page View", plural: "Page Views" },
  admin: {
    useAsTitle: "path",
    defaultColumns: ["path", "referrer", "createdAt"],
    group: "Setup",
    description: "Anonymous traffic log. No IP addresses or cookies are stored.",
    // The dashboard already charts page views; the raw list is for the super admin.
    hidden: hiddenUnlessSuperAdmin,
  },
  access: {
    // Only the tracker's server action may write; the public REST API may not.
    create: () => false,
    read: isAdmin,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    { name: "path", type: "text", required: true, index: true },
    { name: "referrer", type: "text" },
    { name: "session", type: "text", index: true },
  ],
};
