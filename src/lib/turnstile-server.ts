/** Server side of the Turnstile check; imported only by the forms' server actions. */
import { TURNSTILE_FIELD, TURNSTILE_SITE_KEY } from "./turnstile";

/** True when the check passed, or when Turnstile is not set up. */
export async function passesHumanCheck(formData: FormData, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  // Both keys, or neither: a secret without a site key would reject every form.
  if (!secret || !TURNSTILE_SITE_KEY) return true;

  const token = String(formData.get(TURNSTILE_FIELD) ?? "").trim();
  if (!token || token.length > 2048) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const result = (await res.json()) as { success?: boolean };
    return result.success === true;
  } catch (err) {
    // Cloudflare unreachable: let the enquiry through rather than lose a real
    // lead. The honeypot and rate limit still apply.
    console.error("Turnstile verification unavailable", err);
    return true;
  }
}
