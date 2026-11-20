"use server";

import { getCms } from "@/lib/cms";
import { allow, clientIp } from "@/lib/rate-limit";
import { passesHumanCheck } from "@/lib/turnstile-server";
import { HUMAN_CHECK_FAILED } from "@/lib/turnstile";

export type OnboardingField = "name" | "email" | "phone" | "packageName" | "details";

export type OnboardingResult = {
  ok: boolean;
  fieldErrors?: Partial<Record<OnboardingField, string>>;
  error?: string;
};

const MAX = {
  name: 120,
  email: 200,
  phone: 40,
  company: 160,
  packageName: 120,
  links: 500,
  details: 4000,
};

const field = (form: FormData, key: keyof typeof MAX) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, MAX[key]);

export async function submitOnboarding(formData: FormData): Promise<OnboardingResult> {
  // Honeypot field
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { ok: true };
  }

  const name = field(formData, "name");
  const email = field(formData, "email");
  const phone = field(formData, "phone");
  const company = field(formData, "company");
  const packageName = field(formData, "packageName");
  const links = field(formData, "links");
  const details = field(formData, "details");

  const fieldErrors: OnboardingResult["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Please add your full name.";
  if (!email) fieldErrors.email = "Please add the email address you used on Stripe.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "That email address doesn't look right.";
  }
  if (!phone) fieldErrors.phone = "Please add your phone or WhatsApp number so we can reach you quickly.";
  else if (phone.replace(/\D/g, "").length < 7) {
    fieldErrors.phone = "That number looks too short. Please include the country/area code.";
  }
  if (!packageName) fieldErrors.packageName = "Please choose the package you purchased.";
  if (!details) fieldErrors.details = "Please share a quick note on your goals or what you'd like us to start with.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: "A few details need attention — see the highlighted fields." };
  }

  const ip = await clientIp();
  if (!(await passesHumanCheck(formData, ip))) return { ok: false, error: HUMAN_CHECK_FAILED };
  if (!allow(`onboarding:${ip}`, 5, 15 * 60 * 1000)) {
    return {
      ok: false,
      error: "Several submissions were sent in a short time. Please wait a few minutes or message us on WhatsApp.",
    };
  }

  const composedMessage = [
    `[PAID ORDER ONBOARDING]`,
    `Package Purchased: ${packageName}`,
    links ? `Website / Social Handles: ${links}` : null,
    ``,
    `Project Goals & Notes:`,
    details,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const payload = await getCms();
    await payload.create({
      collection: "submissions",
      data: {
        name,
        email,
        phone,
        company,
        budget: `Paid: ${packageName}`,
        message: composedMessage,
        status: "new",
      },
    });
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Something went wrong saving your onboarding details. Please message us directly on WhatsApp and we will get started right away.",
    };
  }
}
