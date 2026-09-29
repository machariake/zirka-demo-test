"use server";

import { getCms, getEngagements, getFeatures } from "@/lib/cms";
import { allow, clientIp } from "@/lib/rate-limit";
import { passesHumanCheck } from "@/lib/turnstile-server";
import { HUMAN_CHECK_FAILED } from "@/lib/turnstile";

export type QuoteField = "name" | "email" | "phone" | "services";
export type QuoteResult = {
  ok: boolean;
  /** One message per field, so the form can mark exactly what needs fixing. */
  fieldErrors?: Partial<Record<QuoteField, string>>;
  error?: string;
};

const MAX = { name: 120, email: 200, phone: 40, company: 160, budget: 60, timeline: 60, details: 5000, plan: 120 };
const field = (form: FormData, key: keyof typeof MAX) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, MAX[key]);

export async function requestQuote(formData: FormData): Promise<QuoteResult> {
  if (String(formData.get("website") ?? "").trim() !== "") return { ok: true };

  if (!(await getFeatures()).quotesEnabled) {
    return { ok: false, error: "Quote requests are closed at the moment. Please reach us on WhatsApp." };
  }

  const name = field(formData, "name");
  const email = field(formData, "email");
  const phone = field(formData, "phone");

  // Only a plan that is really on the Pricing page is kept.
  const requestedPlan = field(formData, "plan");
  const plan = requestedPlan
    ? ((await getEngagements()).find((e) => e.name === requestedPlan)?.name ?? "")
    : "";

  // Only accept ids that match real, published services.
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "services",
    limit: 100,
    depth: 0,
    where: { _status: { equals: "published" } },
    select: { slug: true },
  });
  const allowed = new Set((docs as { id: number }[]).map((s) => String(s.id)));
  const services = formData
    .getAll("services")
    .map(String)
    .filter((id) => allowed.has(id))
    .slice(0, 20)
    .map(Number);

  const fieldErrors: QuoteResult["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Please add your name.";
  if (!email) fieldErrors.email = "Please add your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "That email address doesn't look right.";
  // Checked here as well as in the browser, since the required attribute only
  // stops an honest mistake — it is not a constraint anyone has to obey.
  if (!phone) fieldErrors.phone = "Please add a phone or WhatsApp number.";
  else if (phone.replace(/\D/g, "").length < 7) {
    fieldErrors.phone = "That phone number doesn't look right. Please include the area code.";
  }
  // A plan already says what they want priced; otherwise we need at least one service.
  if (services.length === 0 && !plan) {
    fieldErrors.services = "Please choose at least one service you'd like quoted.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: "A few details need attention — see the highlighted fields." };
  }

  // Counted only once the details are valid, so someone correcting typos is
  // never locked out; a flood of well-formed requests still is.
  const ip = await clientIp();
  if (!(await passesHumanCheck(formData, ip))) return { ok: false, error: HUMAN_CHECK_FAILED };
  if (!allow(`quote:${ip}`, 5, 30 * 60 * 1000)) {
    return { ok: false, error: "Too many requests in a short time. Please wait a little, or message us on WhatsApp." };
  }

  try {
    await payload.create({
      collection: "quotes",
      data: {
        name,
        email,
        phone,
        company: field(formData, "company"),
        plan,
        services,
        budget: field(formData, "budget"),
        timeline: field(formData, "timeline"),
        details: field(formData, "details"),
        status: "new",
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong sending that. Please try WhatsApp instead." };
  }
}
