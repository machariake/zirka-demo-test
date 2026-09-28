/**
 * Languages offered through the automatic (Google Translate) translation.
 * Names are written in their own language so a visitor can find theirs.
 */
export type Language = {
  code: string;
  name: string;
  rtl?: boolean;
  /** "View this site in …?" in the language itself, for the country suggestion. */
  prompt?: string;
};

/** Shown first in the language menu. */
export const FEATURED_LANGUAGES: Language[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Español", prompt: "¿Ver este sitio en español?" },
  { code: "fr", name: "Français", prompt: "Voir ce site en français ?" },
  { code: "ar", name: "العربية", rtl: true, prompt: "هل تريد عرض هذا الموقع بالعربية؟" },
];

/** The rest, alphabetical by English name. Codes are Google Translate's. */
export const MORE_LANGUAGES: Language[] = [
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Shqip" },
  { code: "am", name: "አማርኛ" },
  { code: "hy", name: "Հայերեն" },
  { code: "az", name: "Azərbaycan" },
  { code: "bn", name: "বাংলা" },
  { code: "bg", name: "Български" },
  { code: "zh-CN", name: "简体中文" },
  { code: "zh-TW", name: "繁體中文" },
  { code: "hr", name: "Hrvatski" },
  { code: "cs", name: "Čeština" },
  { code: "da", name: "Dansk" },
  { code: "nl", name: "Nederlands" },
  { code: "et", name: "Eesti" },
  { code: "tl", name: "Filipino" },
  { code: "fi", name: "Suomi" },
  { code: "ka", name: "ქართული" },
  { code: "de", name: "Deutsch" },
  { code: "el", name: "Ελληνικά" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "ht", name: "Kreyòl ayisyen" },
  { code: "ha", name: "Hausa" },
  { code: "iw", name: "עברית", rtl: true },
  { code: "hi", name: "हिन्दी" },
  { code: "hu", name: "Magyar" },
  { code: "ig", name: "Igbo" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "日本語" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "kk", name: "Қазақ" },
  { code: "km", name: "ខ្មែរ" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "ko", name: "한국어" },
  { code: "lv", name: "Latviešu" },
  { code: "lt", name: "Lietuvių" },
  { code: "ms", name: "Bahasa Melayu" },
  { code: "ml", name: "മലയാളം" },
  { code: "mr", name: "मराठी" },
  { code: "ne", name: "नेपाली" },
  { code: "no", name: "Norsk" },
  { code: "fa", name: "فارسی", rtl: true },
  { code: "pl", name: "Polski" },
  { code: "pt", name: "Português" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "ro", name: "Română" },
  { code: "ru", name: "Русский" },
  { code: "sr", name: "Српски" },
  { code: "sk", name: "Slovenčina" },
  { code: "sl", name: "Slovenščina" },
  { code: "so", name: "Soomaali" },
  { code: "sw", name: "Kiswahili" },
  { code: "sv", name: "Svenska" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "th", name: "ไทย" },
  { code: "tr", name: "Türkçe" },
  { code: "uk", name: "Українська" },
  { code: "ur", name: "اردو", rtl: true },
  { code: "uz", name: "Oʻzbek" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "yo", name: "Yorùbá" },
  { code: "zu", name: "isiZulu" },
];

export const ALL_LANGUAGES = [...FEATURED_LANGUAGES, ...MORE_LANGUAGES];

export const findLanguage = (code: string | null | undefined) =>
  code ? ALL_LANGUAGES.find((l) => l.code === code) : undefined;

/**
 * A browser tag such as "es-MX", "zh-TW" or "he" mapped to one of the codes
 * above, or undefined when it is English or not offered.
 */
export const languageFromBrowserTag = (tag: string): Language | undefined => {
  const lower = tag.toLowerCase();
  if (lower.startsWith("zh")) {
    return findLanguage(/tw|hk|mo|hant/.test(lower) ? "zh-TW" : "zh-CN");
  }
  const base = lower.split("-")[0];
  const aliases: Record<string, string> = { he: "iw", nb: "no", nn: "no", fil: "tl" };
  return findLanguage(aliases[base] ?? base);
};

/**
 * The main language of a country, for countries where it is not English.
 * Used only to *offer* a translation, never to force one: plenty of people in
 * any country read English, which is why their browser language wins.
 */
export const COUNTRY_LANGUAGE: Record<string, string> = {
  // Spanish
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", EC: "es", GT: "es", CU: "es",
  BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es", PR: "es",
  GQ: "es",
  // French
  FR: "fr", BE: "fr", LU: "fr", MC: "fr", SN: "fr", CI: "fr", ML: "fr", BF: "fr", NE: "fr", TG: "fr",
  BJ: "fr", GN: "fr", CD: "fr", CG: "fr", GA: "fr", CM: "fr", MG: "fr", HT: "fr", TD: "fr", CF: "fr",
  // Arabic
  SA: "ar", AE: "ar", EG: "ar", MA: "ar", DZ: "ar", TN: "ar", LY: "ar", JO: "ar", LB: "ar", SY: "ar",
  IQ: "ar", KW: "ar", QA: "ar", BH: "ar", OM: "ar", YE: "ar", SD: "ar", PS: "ar",
  // Others with a clear majority language
  DE: "de", AT: "de", IT: "it", PT: "pt", BR: "pt", AO: "pt", MZ: "pt", NL: "nl", RU: "ru", UA: "uk",
  PL: "pl", TR: "tr", CN: "zh-CN", TW: "zh-TW", JP: "ja", KR: "ko", VN: "vi", TH: "th", ID: "id",
  IR: "fa", IL: "iw", GR: "el", RO: "ro", CZ: "cs", HU: "hu", SE: "sv", DK: "da", FI: "fi", NO: "no",
  BG: "bg", HR: "hr", RS: "sr", SK: "sk", SI: "sl", TZ: "sw", SO: "so", ET: "am",
};
