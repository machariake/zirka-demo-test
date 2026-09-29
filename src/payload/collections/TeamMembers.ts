import type { CollectionConfig } from "payload";
import { isStaff, isPublicOrStaff, isAdmin } from "../access";

export const TeamMembers: CollectionConfig = {
  slug: "team-members",
  labels: { singular: "Team Member", plural: "Team Members" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "order", "_status"],
    group: "Website",
    description:
      "Real team members only — never stock, AI-generated or placeholder people (brief §3). Someone appears on the site only when they are published, have a real photo, and Features → Leadership is switched on.",
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
    {
      name: "role",
      type: "text",
      required: true,
      admin: { description: 'Job title, e.g. "Head of Performance Media"' },
    },
    { name: "order", label: "Position in list", type: "number", defaultValue: 0 },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "A real photo of this person — square crops work best. Without one they are not shown, rather than showing a placeholder.",
      },
    },
    {
      name: "bio",
      label: "Short biography",
      type: "textarea",
      admin: { description: "Two or three sentences, in plain language." },
    },
    {
      name: "experience",
      label: "Relevant professional experience",
      type: "textarea",
      admin: { description: 'e.g. "Eight years running paid search for retail brands."' },
    },
    {
      name: "certifications",
      type: "array",
      labels: { singular: "Certification", plural: "Certifications" },
      admin: { description: "Only certifications this person actually holds and can show." },
      fields: [{ name: "name", type: "text", required: true }],
    },
    {
      name: "linkedin",
      label: "LinkedIn URL",
      type: "text",
      validate: (value: unknown) =>
        !value || /^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(String(value)) || "Use the full LinkedIn address, starting https://www.linkedin.com/",
    },
  ],
};
