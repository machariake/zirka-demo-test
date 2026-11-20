/**
 * Contact links built in one place. The WhatsApp number is stored as typed in
 * the admin, and "+1 (678) 799-4634" there would break every wa.me link that
 * pasted it in raw — wa.me accepts digits only.
 */
export const whatsappDigits = (raw: string | null | undefined) => String(raw ?? "").replace(/\D/g, "");

/** The public inbox, used wherever Site Settings has no email of its own. */
export const DEFAULT_EMAIL = "info@zirkadigitalsolutions.com";

/** Primary US studio line (Atlanta, Georgia). */
export const DEFAULT_PHONE_DISPLAY = "+1 (678) 799-4634";
export const DEFAULT_PHONE_DIGITS = "16787994634";

/** Opening line pre-filled in SMS / WhatsApp messages so reaching out takes one tap. */
export const WHATSAPP_GREETING = "Hi Zirka, I'd like to talk about my marketing.";
export const SMS_GREETING = "Hi Zirka! I'm interested in your marketing and website services.";

export const whatsappUrl = (raw: string | null | undefined, text?: string) => {
  const digits = whatsappDigits(raw) || DEFAULT_PHONE_DIGITS;
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};

export const telUrl = (raw: string | null | undefined) => {
  const digits = whatsappDigits(raw) || DEFAULT_PHONE_DIGITS;
  return digits ? `tel:+${digits}` : null;
};

export const smsUrl = (raw: string | null | undefined, text?: string) => {
  const digits = whatsappDigits(raw) || DEFAULT_PHONE_DIGITS;
  if (!digits) return null;
  return `sms:+${digits}${text ? `?body=${encodeURIComponent(text)}` : ""}`;
};
