import type { GlobalConfig } from "payload";
import { revalidatePath } from "next/cache";
import { isSuperAdmin } from "../access";
import { mailSetup } from "../mailer";
import { SITE_THEMES } from "../../lib/site-themes";

/** Accepts the bare code or the whole <meta … content="…"> tag and keeps just the code. */
const verificationCode = (value: unknown) => {
  if (!value) return value;
  const text = String(value).trim();
  return (text.match(/content\s*=\s*["']([^"']+)["']/i)?.[1] ?? text).trim();
};

const toggle = (name: string, label: string, description: string, defaultValue = true) => ({
  name,
  label,
  type: "checkbox" as const,
  defaultValue,
  admin: { description },
});

/**
 * Super-admin-only switchboard. The public site reads these through the
 * server-side API, so none of it — least of all the mail password — is exposed
 * through the public REST API.
 */
export const Features: GlobalConfig = {
  slug: "features",
  label: "Features",
  admin: {
    group: "Setup",
    description: "Turn parts of the website on or off. Changes apply as soon as you save.",
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== "superadmin",
  },
  access: {
    read: isSuperAdmin,
    update: isSuperAdmin,
  },
  endpoints: [
    {
      // POST /api/globals/features/test-email — sends one email through the
      // saved mail server to the alerts inbox, or to the signed-in super admin.
      path: "/test-email",
      method: "post",
      handler: async (req) => {
        const user = req.user as { role?: string; email?: string } | null;
        if (user?.role !== "superadmin") {
          return Response.json({ message: "Only super admins can send a test email." }, { status: 403 });
        }
        const f = (await req.payload.findGlobal({ slug: "features", depth: 0 })) as {
          smtpHost?: string | null;
          smtpUser?: string | null;
          smtpPass?: string | null;
          notifyEmail?: string | null;
        };
        if (!f.smtpHost || !f.smtpUser || !f.smtpPass) {
          return Response.json(
            { message: "Fill in the server, username and password under “1. Mail server”, press Save, then try again." },
            { status: 400 }
          );
        }
        const to = f.notifyEmail || user.email;
        if (!to) return Response.json({ message: "Add an address under “Send alerts to” first." }, { status: 400 });
        const mail = await mailSetup(req.payload);
        try {
          await mail.send({
            to,
            subject: "Test email from your Zirka website",
            html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0e2a20">
              <p style="font-size:18px;margin:0 0 12px">It works.</p>
              <p style="margin:0">Your website can send email. Enquiry alerts and automatic replies will go out from this account.</p>
            </div>`,
          });
          return Response.json({ message: `Sent to ${to}. Check that inbox (and its spam folder).` });
        } catch (err) {
          const reason = err instanceof Error ? err.message : String(err);
          const hint = /auth|535|534|username|password/i.test(reason)
            ? " The username or password was refused. For Gmail, use an App Password, not your normal password."
            : /ECONN|ETIMEDOUT|ENOTFOUND|getaddrinfo/i.test(reason)
              ? " The server couldn't be reached. Check the server name and port (465 or 587)."
              : "";
          return Response.json({ message: `Not sent: ${reason}.${hint}` }, { status: 502 });
        }
      },
    },
  ],
  hooks: {
    afterChange: [
      // Pages are cached for up to a minute. A switch — maintenance above all —
      // should take effect when it is saved, not a minute later.
      () => {
        try {
          revalidatePath("/", "layout");
          revalidatePath("/site-status");
        } catch {
          // Saved from a script outside the web server: nothing cached to clear.
        }
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Theme",
          fields: [
            {
              name: "siteTheme",
              label: "Website theme",
              type: "select",
              defaultValue: "emerald",
              options: SITE_THEMES.map((t) => ({ label: t.name, value: t.id })),
              admin: { components: { Field: "/payload/components/ThemePicker" } },
            },
          ],
        },
        {
          label: "Maintenance",
          description:
            "Close the public website while you work on it. Visitors see your logo, a short message and how to contact you. The admin keeps working, and signed-in admins can still preview the full site from the dashboard.",
          fields: [
            toggle(
              "maintenanceMode",
              "Maintenance mode",
              "When on, every public page shows the maintenance notice instead. Search engines are told the site is temporarily unavailable, so your rankings are kept.",
              false
            ),
            {
              name: "maintenanceHeading",
              label: "Heading",
              type: "text",
              defaultValue: "We're making some improvements.",
            },
            {
              name: "maintenanceMessage",
              label: "Message",
              type: "textarea",
              defaultValue:
                "Our website is being updated and will be back shortly. We're still working in the meantime, and happy to help.",
            },
          ],
        },
        {
          label: "Emails",
          description:
            "The email account the website sends from, the alerts you get about new enquiries, and the automatic thank-you visitors get. Start with the mail server: nothing is sent without it.",
          fields: [
            {
              type: "collapsible",
              label: "1. Mail server (the account that sends the emails)",
              admin: {
                initCollapsed: false,
                description:
                  "For Gmail: server smtp.gmail.com, port 465, your Gmail address as the username, and a Gmail App Password (Google Account → Security → 2-Step Verification → App passwords). Never your normal password.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "smtpHost",
                      label: "Server",
                      type: "text",
                      admin: { width: "60%", placeholder: "smtp.gmail.com" },
                    },
                    {
                      name: "smtpPort",
                      label: "Port",
                      type: "number",
                      defaultValue: 465,
                      admin: { width: "40%", description: "465 (SSL) or 587" },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "smtpUser",
                      label: "Username",
                      type: "text",
                      admin: { width: "50%", description: "Usually the full email address that sends." },
                    },
                    {
                      name: "smtpPass",
                      label: "Password",
                      type: "text",
                      admin: { width: "50%", description: "An App Password for Gmail. Visible only to super admins." },
                    },
                  ],
                },
                {
                  name: "fromAddress",
                  label: "Send from",
                  type: "email",
                  admin: { description: "Leave blank to use the username." },
                },
                {
                  name: "testEmail",
                  type: "ui",
                  admin: { components: { Field: "/payload/components/TestEmailButton" } },
                },
              ],
            },
            {
              type: "collapsible",
              label: "2. Alerts to you about new enquiries",
              admin: { initCollapsed: false },
              fields: [
                toggle(
                  "alertsEnabled",
                  "Send me an email for every new enquiry",
                  "Contact messages, free audit requests, quote requests and booked calls.",
                  false
                ),
                {
                  name: "notifyEmail",
                  label: "Send alerts to",
                  type: "email",
                  admin: {
                    description: "The inbox that receives the alerts.",
                    condition: (data) => Boolean(data?.alertsEnabled),
                  },
                },
              ],
            },
            {
              type: "collapsible",
              label: "3. Automatic thank-you to the person who sent the form",
              admin: { initCollapsed: false },
              fields: [
                toggle(
                  "autoReplyEnabled",
                  "Send an automatic thank-you",
                  "Right after someone sends the contact, free-audit or quote form, they get a short email confirming we have it. Booked calls already get their own confirmation."
                ),
                {
                  type: "row",
                  fields: [
                    {
                      name: "replyTime",
                      label: "When you reply to enquiries",
                      type: "text",
                      admin: {
                        width: "50%",
                        placeholder: "within one business day",
                        description:
                          "Finishes “We'll get back to you …”. Only promise what you can keep. Leave blank for “as soon as we can”.",
                      },
                    },
                    {
                      name: "auditReplyTime",
                      label: "When audit results are sent",
                      type: "text",
                      admin: {
                        width: "50%",
                        placeholder: "within 3 business days",
                        description: "Finishes “We'll send your findings …”. Leave blank for “as soon as we've reviewed it”.",
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: "collapsible",
              label: "4. Scheduled emails to you (every morning, 8am Kenya time)",
              admin: {
                initCollapsed: false,
                description: "Sent to the alerts inbox above, so alerts must be switched on. Nothing is sent on a day with nothing to report.",
              },
              fields: [
                toggle(
                  "followUpReminders",
                  "Daily follow-up reminder",
                  "Leads whose “Follow up on” date is today or already passed."
                ),
                toggle(
                  "untouchedLeadNudges",
                  "Nudge for unanswered leads",
                  "Enquiries, audit requests and quotes still marked New a day after they arrived."
                ),
                toggle(
                  "weeklySummary",
                  "Weekly summary on Mondays",
                  "Last week's audit requests, enquiries, quotes, booked calls, deals won and page views."
                ),
              ],
            },
          ],
        },
        {
          label: "Homepage sections",
          description:
            "Show or hide each section (widget) of the homepage. Hidden sections keep their content, so you can switch them back on at any time.",
          fields: [
            toggle("showStats", "Stats strip", "The four figures under the homepage headline (Site Settings → Stats). Only real, provable numbers."),
            toggle(
              "showTrustedBy",
              "Trusted by",
              "The row of client names below the hero (Site Settings → Trusted by). Only list real clients who agreed to be named. The list currently holds concept project names, so replace them before switching this on."
            ),
            toggle("showServices", "Solutions", "The four solution categories on the homepage."),
            toggle("showWork", "Selected work", "The case studies on the homepage."),
            toggle("showTestimonial", "Testimonial", "The large client quote (only appears if one is published)."),
            toggle("showWhoWeHelp", "Who we help", "Who Zirka works with. Edit the wording under Site Settings → Who we help."),
            toggle("showProcess", "How we work", "The numbered process steps."),
            toggle("showPricing", "Pricing", "The engagement tiers and prices."),
            toggle("showFaq", "FAQ", "Common questions."),
            toggle("showVideo", "Video section", "The homepage video. Only appears when a video is set under Site Settings → Homepage video."),
          ],
        },
        {
          label: "About page",
          fields: [
            toggle("showValues", "How we think", "The operating principles."),
            toggle("showLeadership", "Leadership", "The team members and their photos."),
          ],
        },
        {
          label: "Contact & WhatsApp",
          fields: [
            toggle("showWhatsApp", "WhatsApp buttons", "WhatsApp buttons in the hero and closing banners."),
            toggle(
              "whatsappFloat",
              "Floating WhatsApp button",
              "A round WhatsApp button fixed to the corner of every page. Needs WhatsApp buttons switched on too."
            ),
            toggle("contactFormEnabled", "Contact form", "When off, the contact page shows your WhatsApp and details only."),
            toggle("quotesEnabled", "Quote requests", "Let visitors pick services and request a quote from the website."),
            toggle("bookingEnabled", "Online booking", "Let people book a free consultation from the website. Set your hours under Bookings → Booking Availability."),
          ],
        },
        {
          label: "Languages",
          fields: [
            toggle(
              "translateEnabled",
              "Automatic translation",
              "Shows a language menu, and translates the site automatically for visitors whose device is set to another language (visitors from a non-English country are offered it instead). Uses Google Translate, which only loads once a visitor uses another language; the privacy policy updates itself to match."
            ),
          ],
        },
        {
          label: "Visitor analytics",
          fields: [
            toggle(
              "analyticsEnabled",
              "Record page views",
              "Anonymous page-view counting for the dashboard charts. Turning this off stops new data; existing data is kept."
            ),
            {
              name: "gaMeasurementId",
              label: "Google Analytics measurement ID",
              type: "text",
              admin: {
                placeholder: "G-XXXXXXXXXX",
                description:
                  "Paste the ID from Google Analytics → Admin → Data streams → your website. Leave empty to keep Google Analytics off. The privacy policy updates itself to match.",
              },
              validate: (value: unknown) =>
                !value || /^G-[A-Z0-9]{4,20}$/.test(String(value).trim().toUpperCase())
                  ? true
                  : "That doesn't look like a measurement ID. It starts with G-, for example G-AB12CD34EF.",
              hooks: {
                beforeChange: [({ value }) => (value ? String(value).trim().toUpperCase() : value)],
              },
            },
          ],
        },
        {
          label: "Search engines",
          description:
            "Prove to Google and Bing that you own this website, so you can see which searches find you. Paste the code each one gives you. The whole <meta …> tag works too.",
          fields: [
            {
              name: "googleVerification",
              label: "Google Search Console code",
              type: "text",
              admin: {
                placeholder: "e.g. aBcD123…",
                description:
                  "In Search Console, add a URL-prefix property for https://zirkadigitalsolutions.com and pick the “HTML tag” method. Save here first, then press Verify there.",
              },
              hooks: { beforeChange: [({ value }) => verificationCode(value)] },
            },
            {
              name: "bingVerification",
              label: "Bing Webmaster Tools code",
              type: "text",
              admin: {
                description:
                  "In Bing Webmaster Tools, choose the “Meta tag” option. Or simply import your site from Google Search Console and skip this.",
              },
              hooks: { beforeChange: [({ value }) => verificationCode(value)] },
            },
          ],
        },
      ],
    },
  ],
};
