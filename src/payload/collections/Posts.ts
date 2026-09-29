import type { CollectionConfig } from "payload";
import { isAdmin, isPublicOrStaff, isStaff } from "../access";
import { slugField } from "../fields/slug";

export const POST_TOPICS = [
  "Advertising",
  "SEO",
  "Social media",
  "Branding",
  "Websites",
  "Automation",
  "Strategy",
];

/** Articles for the blog at /blog. Nothing shows publicly until it is published. */
export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Blog Post", plural: "Blog Posts" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "topic", "publishedAt", "_status"],
    group: "Website",
    description:
      "Articles for the blog. Write, save as a draft, and press Publish when it's ready. The Blog link appears in the menu once the first post is published.",
  },
  access: {
    read: isPublicOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  versions: { drafts: true },
  defaultSort: "-publishedAt",
  fields: [
    { name: "title", type: "text", required: true, maxLength: 120 },
    {
      name: "excerpt",
      label: "Summary",
      type: "textarea",
      required: true,
      maxLength: 200,
      admin: {
        description:
          "One or two sentences shown on the blog page and in Google results. Aim for about 120–160 characters.",
      },
    },
    {
      name: "cover",
      label: "Cover image",
      type: "upload",
      relationTo: "media",
      admin: { description: "Landscape works best (about 1600 × 900). Also used when the post is shared." },
    },
    { name: "content", type: "richText", required: true },
    slugField("title", "The page address, e.g. /blog/why-your-ads-arent-converting. Filled in from the title."),
    {
      name: "publishedAt",
      label: "Publish date",
      type: "date",
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" } },
    },
    {
      name: "topic",
      type: "select",
      options: POST_TOPICS.map((t) => ({ label: t, value: t })),
      admin: { position: "sidebar" },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "team-members",
      admin: { position: "sidebar", description: "Optional. Leave empty to credit Zirka Digital Solutions." },
    },
    {
      name: "seo",
      label: "Search engine settings (optional)",
      type: "group",
      admin: { description: "Leave empty to use the title and summary." },
      fields: [
        { name: "title", label: "Title in Google", type: "text", maxLength: 60 },
        { name: "description", label: "Description in Google", type: "textarea", maxLength: 160 },
      ],
    },
  ],
};
