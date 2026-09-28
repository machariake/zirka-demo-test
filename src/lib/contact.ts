/**
 * Contact links built in one place. The WhatsApp number is stored as typed in
 * the admin, and "+1 (678) 799-4634" there would break every wa.me link that
 * pasted it in raw — wa.me accepts digits only.
 */
export const whatsappDigits = (raw: string | null | undefined) => String(raw ?? "").replace(/\D/g, "");

/** Opening line pre-filled in the visitor's WhatsApp, so the first message is one tap. */
export const WHATSAPP_GREETING = "Hi Zirka, I'd like to talk about my marketing.";

export const whatsappUrl = (raw: string | null | undefined, text?: string) => {
  const digits = whatsappDigits(raw);
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};
