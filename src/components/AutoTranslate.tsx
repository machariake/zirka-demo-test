"use client";

import { useEffect, useState } from "react";
import { COUNTRY_LANGUAGE, findLanguage, languageFromBrowserTag, type Language } from "@/lib/languages";
import { dismissOffer, offerDismissed, resumeTranslation, storedChoice, translateTo } from "@/lib/translate";

/**
 * Picks the visitor's language on arrival, in this order:
 *
 * 1. A language already in use (chosen earlier, or detected on a previous page).
 * 2. A language they chose themselves, English included: never second-guessed.
 * 3. Their device language, when it is not English: the site switches to it.
 * 4. Their country, when their device is in English but the country mainly
 *    speaks something else: the site *offers* that language rather than
 *    switching, because many people there read English by choice.
 */
export default function AutoTranslate() {
  const [offer, setOffer] = useState<Language | null>(null);

  useEffect(() => {
    if (resumeTranslation()) return;
    if (storedChoice()) return;

    const tag = navigator.languages?.[0] ?? navigator.language ?? "";
    const fromDevice = languageFromBrowserTag(tag);
    if (fromDevice && fromDevice.code !== "en") {
      void translateTo(fromDevice.code, { remember: false });
      return;
    }

    if (offerDismissed()) return;
    let cancelled = false;
    fetch("/geo", { cache: "no-store" })
      .then((r) => r.json())
      .then(({ country }: { country: string | null }) => {
        const language = country ? findLanguage(COUNTRY_LANGUAGE[country]) : undefined;
        if (!cancelled && language && language.code !== "en") setOffer(language);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!offer) return null;

  const close = () => {
    dismissOffer();
    setOffer(null);
  };

  return (
    <div className="lang-offer notranslate" translate="no" role="region" aria-label="Language suggestion">
      <p>
        <span lang={offer.code} dir={offer.rtl ? "rtl" : undefined}>
          {offer.prompt ?? offer.name}
        </span>
        <span className="lang-offer__sub">View this site in {offer.name}?</span>
      </p>
      <div className="lang-offer__actions">
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => {
            close();
            void translateTo(offer.code, { remember: true });
          }}
        >
          <span lang={offer.code}>{offer.name}</span>
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            close();
            void translateTo("en", { remember: true });
          }}
        >
          Keep English
        </button>
      </div>
    </div>
  );
}
