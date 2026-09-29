"use server";

import { getCms, getFeatures } from "@/lib/cms";
import { allow, clientIp } from "@/lib/rate-limit";
import { passesHumanCheck } from "@/lib/turnstile-server";
import { HUMAN_CHECK_FAILED } from "@/lib/turnstile";
import { AUDIT_GOALS } from "@/lib/audit";

export type AuditField = "name" | "company" | "email" | "phone" | "website" | "goal";
export type AuditResult = {
  ok: boolean;
  /** One message per field, so the form can mark exactly what needs fixing. */
  fieldErrors?: Partial<Record<AuditField, string>>;
  error?: string;
};

const MAX: Record<string, number> = {
  name: 120,
  company: 160,
  email: 200,
  phone: 40,
  website: 300,
  goal: 80,
  message: 3000,
  utm: 150,
  path: 200,
};

const read = (form: FormData, key: string, max = MAX[key] ?? 200) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, max);

/** Accepts "example.com" as readily as "https://www.example.com/page". */
const normaliseWebsite = (raw: string): string | null => {
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
};

export async function requestAudit(formData: FormData): Promise<AuditResult> {
  // Bot trap. Named differently from the other forms' trap, because this form
  // has a real "website" field of its own.
  if (read(formData, "hp_confirm") !== "") return { ok: true };

  if (!(await getFeatures()).contactFormEnabled) {
    return { ok: false, error: "Audit requests are paused at the moment. Please reach us on WhatsApp." };
  }

  const name = read(formData, "name");
  const company = read(formData, "company");
  const email = read(formData, "email");
  const phone = read(formData, "phone");
  const websiteRaw = read(formData, "website");
  const goal = read(formData, "goal");
  const website = normaliseWebsite(websiteRaw);

  const fieldErrors: AuditResult["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Please add your name.";
  if (!company) fieldErrors.company = "Please add your business name.";
  if (!email) fieldErrors.email = "Please add your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "That email address doesn't look right.";
  // Optional, but if given it has to be a number someone can actually call.
  if (phone && phone.replace(/\D/g, "").length < 7) {
    fieldErrors.phone = "That number looks too short. Include the area code, or leave it blank.";
  }
  if (!websiteRaw) fieldErrors.website = "Please add your website address.";
  else if (!website) fieldErrors.website = "That doesn't look like a website address — for example, yourbusiness.com.";
  if (!goal) fieldErrors.goal = "Please choose your main goal.";
  else if (!(AUDIT_GOALS as readonly string[]).includes(goal)) fieldErrors.goal = "Please choose one of the listed goals.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: "A few details need attention — see the highlighted fields." };
  }

  // Counted only once the details are valid, so someone correcting typos is
  // never locked out; a flood of well-formed requests still is.
  const ip = await clientIp();
  if (!(await passesHumanCheck(formData, ip))) return { ok: false, error: HUMAN_CHECK_FAILED };
  if (!allow(`audit:${ip}`, 5, 10 * 60 * 1000)) {
    return {
      ok: false,
      error: "Several requests came from you in a short time. Please wait a few minutes, or message us on WhatsApp.",
    };
  }

  try {
    const payload = await getCms();
    await payload.create({
      collection: "submissions",
      data: {
        kind: "audit",
        name,
        company,
        email,
        phone,
        website,
        goal,
        message: read(formData, "message"),
        status: "new",
        attribution: {
          utmSource: read(formData, "utm_source", MAX.utm),
          utmMedium: read(formData, "utm_medium", MAX.utm),
          utmCampaign: read(formData, "utm_campaign", MAX.utm),
          utmContent: read(formData, "utm_content", MAX.utm),
          utmTerm: read(formData, "utm_term", MAX.utm),
          landingPage: read(formData, "landing_page", MAX.path),
          referrer: read(formData, "referrer_host", MAX.utm),
        },
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong sending that. Please try again, or message us on WhatsApp." };
  }
}
