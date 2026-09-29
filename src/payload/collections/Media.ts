import type { CollectionConfig } from "payload";
import { isStaff } from "../access";

export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Website" },
  access: {
    read: () => true,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  upload: {
    staticDir: "public/uploads",
    mimeTypes: ["image/*", "video/*"],
    imageSizes: [
      { name: "thumb", width: 400, height: 400, position: "centre" },
      { name: "card", width: 900, height: 1200, position: "centre" },
      { name: "wide", width: 1920, height: 1080, position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Describe the image for screen readers and search engines.",
      },
    },
  ],
};
