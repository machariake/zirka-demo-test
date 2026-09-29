import type { CollectionConfig } from "payload";
import { isAdmin, isPublicOrStaff, isStaff } from "../access";
import { slugField } from "../fields/slug";

/**
 * Real, delivered client work shown as a gallery: what we made, for whom, with
 * photos and a live link. No results figures are asked for, so there is
 * nothing to exaggerate. Measured outcomes belong in a Case Study.
 */
export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Project", plural: "Projects" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "client", "year", "featured", "_status"],
    group: "Website",
    description:
      "Work you have delivered for real clients: websites, logos, campaigns and more. Shown on the Work page, and on the homepage when marked Featured. Only add genuine client work.",
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
      type: "row",
      fields: [
        {
          name: "name",
          label: "Project name",
          type: "text",
          required: true,
          admin: { width: "50%", description: "e.g. “New website for Bloom Spa”." },
        },
        { name: "client", label: "Client", type: "text", required: true, admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "deliverables",
          label: "What we did",
          type: "text",
          required: true,
          admin: { width: "50%", description: "Short label for the card, e.g. “Website & SEO” or “Logo & brand identity”." },
        },
        { name: "industry", type: "text", admin: { width: "30%", description: "e.g. Beauty & wellness" } },
        { name: "year", type: "number", min: 2000, max: 2100, admin: { width: "20%" } },
      ],
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      maxLength: 220,
      admin: { description: "One or two sentences for the card and Google results." },
    },
    {
      name: "description",
      label: "About the project",
      type: "textarea",
      admin: {
        rows: 8,
        description: "Optional. What the client needed and what we delivered. Leave a blank line between paragraphs.",
      },
    },
    {
      name: "cover",
      label: "Cover image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "The main picture on the card, e.g. a screenshot or mockup. Landscape works best." },
    },
    {
      name: "gallery",
      label: "More images",
      type: "array",
      labels: { singular: "Image", plural: "Images" },
      admin: { description: "Optional screenshots, mockups or photos shown on the project's page." },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" },
      ],
    },
    {
      name: "services",
      label: "Services used",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      admin: { description: "Links the project to those service pages." },
    },
    {
      name: "liveUrl",
      label: "Live link",
      type: "text",
      admin: { description: "Optional, e.g. the website you built. Must start with https://" },
      validate: (value: unknown) =>
        !value || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(String(value).trim())
          ? true
          : "Enter a full address starting with https://",
    },
    slugField("name", "The page address, e.g. /work/projects/bloom-spa-website. Filled in from the project name."),
    {
      name: "featured",
      label: "Show on the homepage",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Up to three featured projects appear on the homepage." },
    },
    {
      name: "order",
      label: "Position in list",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Lower numbers appear first." },
    },
    {
      name: "clientPermission",
      label: "The client is happy for us to show this",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Tick once the client has agreed. A project can't be published without it." },
      validate: (value: unknown, { data }: { data?: { _status?: string } }) =>
        data?._status === "published" && !value ? "Tick this before publishing: we only show work clients have agreed to." : true,
    },
  ],
};
