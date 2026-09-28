import type { CollectionConfig } from "payload";
import { isAdmin, isStaff } from "../access";
import { SITE_URL } from "../../lib/site";
import { escapeHtml, mailSetup } from "../mailer";
import { sendAutoReply } from "../auto-reply";
import { LEAD_STAGES, leadFields } from "../fields/lead";

export const Quotes: CollectionConfig = {
  slug: "quotes",
  labels: { singular: "Quote Request", plural: "Quote Requests" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "company", "budget", "status", "followUp", "createdAt"],
    group: "Enquiries",
    description: "Quote requests from the website, including the services each person asked about.",
  },
  access: {
    // Written by the quote form's server action through Payload's local API.
    create: () => false,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return doc;
        await sendAutoReply(req.payload, doc.email, String(doc.name ?? ""), "quote");
        const mail = await mailSetup(req.payload);
        if (!mail.teamInbox) return doc;

        const picked = (doc.services ?? [])
          .map((s: unknown) => (typeof s === "object" && s !== null ? (s as { name?: string }).name : null))
          .filter(Boolean) as string[];

        const row = (label: string, value: unknown) =>
          value
            ? `<tr><td style="padding:6px 16px 6px 0;color:#5f6b64;vertical-align:top">${label}</td><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`
            : "";

        try {
          await mail.send({
            to: mail.teamInbox,
            replyTo: doc.email as string,
            subject: `Quote request from ${String(doc.name).slice(0, 60)}${doc.company ? ` (${String(doc.company).slice(0, 60)})` : ""}`,
            html: `
              <div style="font-family:Arial,sans-serif;font-size:15px;color:#0e2a20;max-width:560px">
                <p style="font-size:18px;margin:0 0 16px">New quote request</p>
                <table style="border-collapse:collapse;margin-bottom:16px">
                  ${row("Name", doc.name)}
                  ${row("Email", doc.email)}
                  ${row("Phone", doc.phone)}
                  ${row("Company", doc.company)}
                  ${row("Plan", doc.plan)}
                  ${row("Monthly budget", doc.budget)}
                  ${row("Timeline", doc.timeline)}
                  ${row("Services", picked.join(", "))}
                </table>
                ${doc.details ? `<p style="white-space:pre-wrap;background:#f6f3ea;padding:14px 16px;border-radius:8px">${escapeHtml(doc.details)}</p>` : ""}
                <p style="margin:0"><a href="${SITE_URL}/admin/collections/quotes/${doc.id}" style="color:#9c5c33">Open in the admin</a> &nbsp;·&nbsp; Reply to this email to answer them directly.</p>
              </div>`,
          });
        } catch (err) {
          req.payload.logger.error({ err }, "Could not send quote-request notification");
        }
        return doc;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "company", type: "text" },
    {
      name: "plan",
      label: "Plan of interest",
      type: "text",
      admin: { description: "Filled in when the visitor came from a plan on the Pricing page." },
    },
    {
      name: "services",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      admin: { description: "What they asked us to quote for." },
    },
    {
      name: "budget",
      label: "Monthly budget",
      type: "text",
      admin: { description: "The range they picked on the form, or a one-off project." },
    },
    { name: "timeline", type: "text" },
    { name: "details", type: "textarea" },
    ...leadFields(LEAD_STAGES.quote),
  ],
};
