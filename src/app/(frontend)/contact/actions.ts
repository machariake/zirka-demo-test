"use server";

import { getCms, getFeatures } from "@/lib/cms";
import { allow, clientIp } from "@/lib/rate-limit";

export type ContactField = "name" | "email" | "phone" | "message";
export type ContactResult = {
  ok: boolean;
  /** One message per field, so the form can mark exactly what needs fixing. */
  fieldErrors?: Partial<Record<ContactField, string>>;
  error?: string;
};

const MAX = { name: 120, email: 200, phone: 40, company: 160, budget: 60, message: 5000 };

const str = (form: FormData, key: keyof typeof MAX) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, MAX[key]);

export async function submitEnquiry(formData: FormData): Promise<ContactResult> {
  // Honeypot: hidden from people, irresistible to bots. Pretend it worked so
  // the bot has no signal to adapt to.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { ok: true };
  }

  // Enforced here as well as hidden on the page, so a direct call can't bypass it.
  if (!(await getFeatures()).contactFormEnabled) {
    return { ok: false, error: "The contact form is currently closed. Please reach us on WhatsApp." };
  }

  const name = str(formData, "name");
  const email = str(formData, "email");
  const phone = str(formData, "phone");
  const message = str(formData, "message");

  const fieldErrors: ContactResult["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Please add your name.";
  if (!email) fieldErrors.email = "Please add your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "That email address doesn't look right.";
  // Optional, but if given it has to be a number someone can actually call.
  if (phone && phone.replace(/\D/g, "").length < 7) {
    fieldErrors.phone = "That number looks too short. Include the area code, or leave it blank.";
  }
  if (!message) fieldErrors.message = "Please tell us a little about what you need.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: "A few details need attention — see the highlighted fields." };
  }

  // Counted only once the details are valid, so someone correcting typos is
  // never locked out; a flood of well-formed requests still is.
  const ip = await clientIp();
  if (!allow(`enquiry:${ip}`, 5, 10 * 60 * 1000)) {
    return {
      ok: false,
      error: "You've sent several messages in a short time. Please wait a few minutes, or reach us on WhatsApp.",
    };
  }

  try {
    const payload = await getCms();
    await payload.create({
      collection: "submissions",
      data: {
        name,
        email,
        phone,
        company: str(formData, "company"),
        budget: str(formData, "budget"),
        message,
        status: "new",
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong sending that. Please try WhatsApp instead." };
  }
}
