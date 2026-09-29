import type { GlobalConfig } from "payload";
import { isAdmin } from "../access";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  admin: {
    group: "Settings",
    description: "Brand details, hero copy and contact channels used across the site.",
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Brand",
          fields: [
            { name: "companyName", type: "text", required: true, defaultValue: "Zirka Digital Solutions" },
            { name: "slogan", type: "text", required: true, defaultValue: "Where Ideas Become Impact" },
            {
              name: "descriptor",
              type: "text",
              defaultValue: "Digital Marketing Agency",
              admin: { description: "The small label above the hero headline." },
            },
          ],
        },
        {
          label: "Homepage hero",
          fields: [
            {
              name: "heroHeadline",
              type: "text",
              required: true,
              defaultValue: "Turn clicks into customers.",
            },
            {
              name: "heroEmphasis",
              type: "text",
              defaultValue: "customers",
              admin: { description: "Which word in the headline is picked out in copper." },
            },
            { name: "heroLede", type: "textarea", required: true },
            { name: "heroImage", type: "upload", relationTo: "media" },
          ],
        },
        {
          label: "Legal pages",
          description:
            "Terms of service and refund policy. These are starting points — edit them to match how you actually work, and have someone qualified check them before you rely on them.",
          fields: [
            {
              name: "legalEntity",
              label: "Legal business name",
              type: "text",
              admin: { description: 'e.g. "Zirka Digital Solutions LLC". Used in both documents.' },
            },
            {
              name: "legalJurisdiction",
              label: "Governing law / country",
              type: "text",
              admin: { description: 'e.g. "the State of Georgia, USA" or "Kenya".' },
            },
            {
              name: "termsIntro",
              label: "Terms — intro",
              type: "textarea",
              defaultValue:
                "These terms cover the work we do for you and what each of us can expect. By asking us to start work, you agree to them.",
            },
            {
              name: "terms",
              label: "Terms — sections",
              type: "array",
              labels: { singular: "Section", plural: "Sections" },
              fields: [
                { name: "heading", type: "text", required: true },
                { name: "body", type: "textarea", required: true },
              ],
            },
            {
              name: "refundsIntro",
              label: "Refunds — intro",
              type: "textarea",
              defaultValue:
                "We want you to be happy with the work. This page explains when money is refundable and when it isn't.",
            },
            {
              name: "refunds",
              label: "Refunds — sections",
              type: "array",
              labels: { singular: "Section", plural: "Sections" },
              fields: [
                { name: "heading", type: "text", required: true },
                { name: "body", type: "textarea", required: true },
              ],
            },
          ],
        },
        {
          label: "Homepage video",
          description: "An optional video section on the homepage. Leave the link and file empty to hide it.",
          fields: [
            {
              name: "videoHeading",
              type: "text",
              defaultValue: "Social media marketing in five minutes",
            },
            {
              name: "videoIntro",
              type: "textarea",
              defaultValue:
                "A short explainer on what social media marketing actually involves, and where it pays off.",
            },
            {
              name: "videoUrl",
              label: "Video link",
              type: "text",
              admin: { description: "A YouTube or Vimeo link. Leave blank if you upload a file below." },
            },
            {
              name: "videoFile",
              label: "Or upload a video file",
              type: "upload",
              relationTo: "media",
            },
            {
              name: "videoPoster",
              label: "Cover image (for uploaded files)",
              type: "upload",
              relationTo: "media",
            },
          ],
        },
        {
          label: "About page",
          fields: [
            {
              name: "aboutTitle",
              type: "text",
              defaultValue: "Named for a star.",
              admin: { description: "The headline at the top of the about page." },
            },
            {
              name: "aboutLede",
              type: "textarea",
              defaultValue:
                "Zirka means star — a fixed point to navigate by. That's what we aim to be for the businesses we work with.",
            },
            {
              name: "storyHeading",
              type: "text",
              defaultValue: "Who we are",
            },
            {
              name: "story",
              label: "Your story",
              type: "array",
              labels: { singular: "Paragraph", plural: "Paragraphs" },
              admin: {
                description:
                  "Tell visitors who you are and why you started. Leave empty to hide this section.",
              },
              fields: [{ name: "text", type: "textarea", required: true }],
            },
            { name: "storyImage", type: "upload", relationTo: "media" },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              name: "whatsapp",
              type: "text",
              defaultValue: "16787994634",
              admin: { description: "Digits only, including country code — used for the wa.me link." },
              // Spaces, dashes and a leading + are stripped when the site reads it;
              // this only stops a number too short to reach anyone.
              validate: (value: unknown) => {
                const digits = String(value ?? "").replace(/\D/g, "");
                if (!digits) return true;
                return digits.length >= 8 && digits.length <= 15
                  ? true
                  : "Enter the full number with country code, e.g. 16787994634.";
              },
            },
            { name: "phoneDisplay", type: "text", defaultValue: "+1 (678) 799–4634" },
            {
              name: "email",
              type: "email",
              defaultValue: "info@zirkadigitalsolutions.com",
              admin: { description: "Shown on the contact page, footer and privacy policy." },
            },
            { name: "socialHandle", type: "text", defaultValue: "zirka digital solutions" },
            {
              type: "row",
              fields: (
                [
                  ["facebookUrl", "Facebook page", "facebook.com", "https://www.facebook.com/share/19MhNyMNVX/"],
                  ["instagramUrl", "Instagram profile", "instagram.com", "https://www.instagram.com/iamessy_blessed"],
                  ["linkedinUrl", "LinkedIn page", "linkedin.com", undefined],
                ] as const
              ).map(([name, label, host, defaultValue]) => ({
                name,
                label,
                type: "text" as const,
                ...(defaultValue ? { defaultValue } : {}),
                admin: {
                  description: `Full link, e.g. https://www.${host}/yourpage. Leave empty to hide it.`,
                },
                validate: (value: unknown) => {
                  const raw = String(value ?? "").trim();
                  if (!raw) return true;
                  try {
                    const url = new URL(raw);
                    return url.protocol === "https:" && url.hostname.replace(/^www\./, "").endsWith(host)
                      ? true
                      : `Use the full https:// link to your ${host} page.`;
                  } catch {
                    return `Use the full https:// link to your ${host} page.`;
                  }
                },
              })),
            },
            { name: "hours", type: "text", defaultValue: "Monday – Friday, 9am – 6pm" },
          ],
        },
        {
          label: "Stats",
          description:
            "Only publish figures and client names you can evidence. These read as claims about real Zirka results.",
          fields: [
            {
              name: "stats",
              type: "array",
              maxRows: 4,
              admin: { description: "The four figures under the hero." },
              fields: [
                { name: "value", type: "text", required: true },
                { name: "label", type: "text", required: true },
              ],
            },
            {
              name: "trustedBy",
              type: "array",
              labels: { singular: "Brand", plural: "Brands" },
              fields: [{ name: "name", type: "text", required: true }],
            },
          ],
        },
        {
          label: "Who we help",
          description:
            "The homepage section on who Zirka works with (brief §6). Only name industries you genuinely work with — leave the list empty rather than invent a specialism.",
          fields: [
            {
              name: "whoWeHelp",
              type: "group",
              fields: [
                {
                  name: "heading",
                  type: "text",
                  defaultValue: "Built for businesses ready to grow.",
                },
                {
                  name: "body",
                  type: "textarea",
                  defaultValue:
                    "We work with growing businesses that want marketing tied to real business outcomes — more visibility, better leads, stronger conversion, and scalable growth.",
                },
                {
                  name: "industries",
                  type: "array",
                  labels: { singular: "Industry", plural: "Industries" },
                  admin: { description: "Optional. Shown as a row of tags under the text." },
                  fields: [{ name: "name", type: "text", required: true }],
                },
              ],
            },
          ],
        },
        {
          label: "Pricing",
          fields: [
            {
              name: "projectPricingNote",
              label: "Note under the one-off project prices",
              type: "text",
              defaultValue: "Final pricing depends on project scope and requirements.",
            },
          ],
        },
      ],
    },
  ],
};
