/**
 * Cloudflare Turnstile: a free, usually invisible check that a form was sent by
 * a person. Off until both keys are set (Cloudflare dashboard → Turnstile →
 * add the site), so the forms work exactly as before without them:
 *
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY   public, shown in the page
 *   TURNSTILE_SECRET_KEY             private, server only
 *
 * The honeypot fields and rate limits stay in place either way.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";

/** The form field the widget fills in with its token. */
export const TURNSTILE_FIELD = "cf-turnstile-response";

export const HUMAN_CHECK_FAILED =
  "Please wait for the security check above to finish, then send again. If it keeps failing, message us on WhatsApp.";
