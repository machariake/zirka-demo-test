import type { Endpoint, PayloadRequest } from "payload";
import { LEAD_STAGES } from "./fields/lead";

/**
 * "Download as spreadsheet" for the lead lists: a CSV that opens in Excel,
 * Google Sheets or Numbers. Admins and super admins only, since it is every
 * lead's contact details in one file.
 */

type Row = Record<string, unknown>;
type Column = { label: string; value: (doc: Row) => unknown };

/**
 * One CSV cell. Everything in these lists was typed by the public, so a value
 * starting with = + - @ is prefixed with ' to stop a spreadsheet from running
 * it as a formula ("CSV injection").
 */
const cell = (value: unknown): string => {
  let text = value == null ? "" : Array.isArray(value) ? value.join("; ") : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const date = (value: unknown) => (typeof value === "string" && value ? value.slice(0, 10) : "");

const stageLabel = (stages: { label: string; value: string }[]) => (doc: Row) =>
  stages.find((s) => s.value === doc.status)?.label ?? doc.status;

const canExport = (req: PayloadRequest) => {
  const role = (req.user as { role?: string } | null)?.role;
  return role === "superadmin" || role === "admin";
};

const exportEndpoint = (collection: "submissions" | "quotes", filename: string, columns: Column[]): Endpoint => ({
  // GET /api/<collection>/export
  path: "/export",
  method: "get",
  handler: async (req) => {
    if (!canExport(req)) {
      return Response.json({ message: "Only admins can download leads." }, { status: 403 });
    }
    const rows: Row[] = [];
    for (let page = 1; ; page++) {
      const result = await req.payload.find({
        collection,
        depth: 1,
        limit: 500,
        page,
        sort: "-createdAt",
        overrideAccess: false,
        user: req.user,
      });
      rows.push(...(result.docs as unknown as Row[]));
      if (!result.hasNextPage || rows.length >= 20000) break;
    }
    const lines = [
      columns.map((c) => cell(c.label)).join(","),
      ...rows.map((doc) => columns.map((c) => cell(c.value(doc))).join(",")),
    ];
    const stamp = new Date().toISOString().slice(0, 10);
    // The byte-order mark makes Excel read accents and non-Latin names correctly.
    return new Response(`﻿${lines.join("\r\n")}\r\n`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  },
});

const attribution = (doc: Row, key: string) => (doc.attribution as Row | undefined)?.[key];

export const submissionsExport = exportEndpoint("submissions", "zirka-enquiries", [
  { label: "Received", value: (d) => date(d.createdAt) },
  { label: "Type", value: (d) => (d.kind === "audit" ? "Free audit" : "Enquiry") },
  { label: "Name", value: (d) => d.name },
  { label: "Email", value: (d) => d.email },
  { label: "Phone / WhatsApp", value: (d) => d.phone },
  { label: "Business", value: (d) => d.company },
  { label: "Website", value: (d) => d.website },
  { label: "Main goal", value: (d) => d.goal },
  { label: "Budget", value: (d) => d.budget },
  { label: "Message", value: (d) => d.message },
  { label: "Stage", value: stageLabel(LEAD_STAGES.enquiry) },
  { label: "Follow up on", value: (d) => date(d.followUp) },
  { label: "Deal value (USD)", value: (d) => d.dealValue },
  { label: "Won on", value: (d) => date(d.wonAt) },
  { label: "Notes", value: (d) => d.notes },
  { label: "utm_source", value: (d) => attribution(d, "utmSource") },
  { label: "utm_medium", value: (d) => attribution(d, "utmMedium") },
  { label: "utm_campaign", value: (d) => attribution(d, "utmCampaign") },
  { label: "Landing page", value: (d) => attribution(d, "landingPage") },
  { label: "Referring site", value: (d) => attribution(d, "referrer") },
]);

export const quotesExport = exportEndpoint("quotes", "zirka-quote-requests", [
  { label: "Received", value: (d) => date(d.createdAt) },
  { label: "Name", value: (d) => d.name },
  { label: "Email", value: (d) => d.email },
  { label: "Phone", value: (d) => d.phone },
  { label: "Business", value: (d) => d.company },
  { label: "Plan", value: (d) => d.plan },
  {
    label: "Services",
    value: (d) =>
      ((d.services as unknown[]) ?? [])
        .map((s) => (typeof s === "object" && s ? (s as { name?: string }).name : null))
        .filter(Boolean),
  },
  { label: "Monthly budget", value: (d) => d.budget },
  { label: "Timeline", value: (d) => d.timeline },
  { label: "Details", value: (d) => d.details },
  { label: "Stage", value: stageLabel(LEAD_STAGES.quote) },
  { label: "Follow up on", value: (d) => date(d.followUp) },
  { label: "Deal value (USD)", value: (d) => d.dealValue },
  { label: "Won on", value: (d) => date(d.wonAt) },
  { label: "Notes", value: (d) => d.notes },
]);
