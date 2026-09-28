import { getFeatures, getSettings } from "@/lib/cms";
import { WHATSAPP_GREETING, whatsappUrl } from "@/lib/contact";
import { WhatsAppIcon } from "./Icons";

/**
 * A WhatsApp shortcut fixed to the corner of every page. Plain server-rendered
 * link, no script: PageTracker already counts clicks on any wa.me link.
 */
export default async function WhatsAppFloat() {
  const [settings, features] = await Promise.all([getSettings(), getFeatures()]);
  const href = features.showWhatsApp && features.whatsappFloat ? whatsappUrl(settings.whatsapp, WHATSAPP_GREETING) : null;
  if (!href) return null;
  return (
    <a
      className="wa-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Zirka on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
