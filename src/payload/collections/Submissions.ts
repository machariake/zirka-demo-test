import type { CollectionConfig } from "payload";
import { isAdmin, isStaff } from "../access";
import { SITE_URL } from "../../lib/site";
import { escapeHtml, mailSetup } from "../mailer";
import { sendAutoReply } from "../auto-reply";
import { LEAD_STAGES, leadFields } from "../fields/lead";
import { submissionsExport } from "../export";

export const Submissions: CollectionConfig = {
  slug: "submissions",
  labels: { singular: "Enquiry", plural: "Enquiries" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "kind", "company", "status", "followUp", "createdAt"],
    group: "Leads",
    description:
      "Everything sent through the website's contact and free-audit forms, in one list. Filter by Type to see audit requests alone.",
    components: {
      beforeListTable: [
        {
          path: "/payload/components/ExportButton",
          clientProps: { href: "/api/submissions/export", label: "Download all enquiries (spreadsheet)" },
        },
      ],
    },
  },
  endpoints: [submissionsExport],
  access: {
    // Closed to the public REST API: the contact form writes through a server
    // action using Payload's local API, which is not bound by this rule.
    create: () => false,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return doc;

        await sendAutoReply(req.payload, doc.email, String(doc.name ?? ""), doc.kind === "audit" ? "audit" : "enquiry");

        const mail = await mailSetup(req.payload);
        const to = mail.teamInbox;
        if (!to) return doc;

        const row = (label: string, value: unknown) =>
          value
            ? `<tr><td style="padding:6px 16px 6px 0;color:#5f6b64;vertical-align:top">${label}</td><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`
            : "";

        const isAudit = doc.kind === "audit";
        const who = `${String(doc.name).slice(0, 80)}${doc.company ? ` (${String(doc.company).slice(0, 80)})` : ""}`;
        const src = (doc.attribution ?? {}) as Record<string, string | null | undefined>;
        const message = {
          to,
          replyTo: doc.email as string,
          subject: isAudit ? `Free audit request from ${who}` : `New enquiry from ${who}`,
          html: `
              <div style="font-family:Arial,sans-serif;font-size:15px;color:#0e2a20;max-width:560px">
                <p style="font-size:18px;margin:0 0 16px">${isAudit ? "New free marketing audit request" : "New enquiry through the website"}</p>
                <table style="border-collapse:collapse;margin-bottom:18px">
                  ${row("Name", doc.name)}
                  ${row("Email", doc.email)}
                  ${row("Phone / WhatsApp", doc.phone)}
                  ${row("Business", doc.company)}
                  ${row("Website", doc.website)}
                  ${row("Main goal", doc.goal)}
                  ${row("Budget", doc.budget)}
                  ${row("Came from", [src.utmSource, src.utmMedium, src.utmCampaign].filter(Boolean).join(" / ") || src.referrer)}
                </table>
                ${doc.message ? `<p style="white-space:pre-wrap;background:#f6f3ea;padding:14px 16px;border-radius:8px;margin:0 0 20px">${escapeHtml(doc.message)}</p>` : ""}
                <p style="margin:0">
                  <a href="${SITE_URL}/admin/collections/submissions/${doc.id}" style="color:#9c5c33">Open in the admin</a>
                  &nbsp;·&nbsp; Reply to this email to answer them directly.
                </p>
              </div>`,
        };

        try {
          await mail.send(message);
        } catch (err) {
          // A mail outage must never lose the enquiry itself — it is already saved.
          req.payload.logger.error({ err }, "Could not send new-enquiry notification");
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "kind",
      label: "Type",
      type: "select",
      defaultValue: "enquiry",
      options: [
        { label: "Enquiry", value: "enquiry" },
        { label: "Free audit request", value: "audit" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", label: "Phone / WhatsApp", type: "text" },
    { name: "company", label: "Business name", type: "text" },
    { name: "website", type: "text" },
    { name: "goal", label: "Main marketing goal", type: "text" },
    { name: "budget", type: "text" },
    // Required on the contact form (checked there), optional on the audit form.
    { name: "message", type: "textarea" },
    {
      name: "attribution",
      type: "group",
      admin: {
        description:
          "Where this lead came from, captured from the link they arrived on. Only campaign tags and the referring site — never anything personal.",
      },
      fields: [
        { name: "utmSource", label: "utm_source", type: "text" },
        { name: "utmMedium", label: "utm_medium", type: "text" },
        { name: "utmCampaign", label: "utm_campaign", type: "text" },
        { name: "utmContent", label: "utm_content", type: "text" },
        { name: "utmTerm", label: "utm_term", type: "text" },
        { name: "landingPage", label: "Landing page", type: "text" },
        { name: "referrer", label: "Referring site", type: "text" },
      ],
    },
    ...leadFields(LEAD_STAGES.enquiry),
  ],
};
