/**
 * Automatic translation through the Google Translate website widget.
 *
 * Browser-only. The widget script is loaded only once a visitor uses another
 * language, so English visitors never download it or send Google anything.
 *
 * The chosen language lives in the "googtrans" cookie, which is what the
 * widget itself reads: "/en/es" means English page, shown in Spanish. An
 * explicit choice (including "English, thanks") is also kept in localStorage so
 * automatic detection never overrides it.
 */
import { findLanguage } from "./languages";

const COOKIE = "googtrans";
const CHOICE_KEY = "zk-lang";
const OFFER_KEY = "zk-lang-offer";
const SCRIPT_ID = "zk-google-translate";
const HOLDER_ID = "google_translate_element";

type TranslateWindow = Window & {
  google?: { translate?: { TranslateElement?: new (options: object, id: string) => unknown } };
  zkTranslateInit?: () => void;
  zkDomPatched?: boolean;
};

// ---- current language, shared with the header menu ------------------------

const listeners = new Set<() => void>();

export const subscribeLanguage = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

const notify = () => listeners.forEach((l) => l());

/** The language the page is shown in: "en" unless the cookie says otherwise. */
export const currentLanguage = (): string => {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
  const code = match ? decodeURIComponent(match[1]) : "en";
  return findLanguage(code) ? code : "en";
};

// ---- cookie + stored choice ---------------------------------------------------

/** The widget may have set the cookie on the bare host and on the parent domain; clear or set both. */
const cookieDomains = () => {
  const host = window.location.hostname;
  const parts = host.split(".");
  const parent = parts.length > 2 ? `.${parts.slice(-2).join(".")}` : `.${host}`;
  return host === "localhost" || /^[\d.]+$/.test(host) ? [null] : [null, host, parent];
};

const writeCookie = (value: string | null) => {
  // Set on this host only; cleared everywhere the widget may have put a copy.
  for (const domain of value ? [null] : cookieDomains()) {
    const scope = `path=/${domain ? `; domain=${domain}` : ""}; SameSite=Lax`;
    document.cookie = value
      ? `${COOKIE}=${value}; ${scope}; max-age=${60 * 60 * 24 * 365}`
      : `${COOKIE}=; ${scope}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

const storage = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Private browsing: the choice just won't be remembered.
    }
  },
};

/** The language the visitor picked themselves, if they ever did. */
export const storedChoice = () => storage.get(CHOICE_KEY);
export const offerDismissed = () => storage.get(OFFER_KEY) === "dismissed";
export const dismissOffer = () => storage.set(OFFER_KEY, "dismissed");

// ---- page direction -----------------------------------------------------------

/** Right-to-left languages need the layout mirrored, which the widget does not do. */
export const applyDirection = (code: string) => {
  const rtl = Boolean(findLanguage(code)?.rtl);
  document.documentElement.dir = rtl ? "rtl" : "ltr";
};

// ---- loading the widget ---------------------------------------------------------

/**
 * The widget rewrites text in place, and React then fails when it updates a
 * node that is no longer where it left it ("removeChild: not a child").
 * Make those two DOM calls forgiving, as React's own issue tracker recommends
 * for translation tools (facebook/react#11538). Only applied once translation
 * is actually in use.
 */
const patchDom = (w: TranslateWindow) => {
  if (w.zkDomPatched) return;
  w.zkDomPatched = true;
  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return insertBefore.call(this, node, ref) as T;
  };
};

let loading: Promise<void> | null = null;

const loadWidget = (): Promise<void> => {
  const w = window as TranslateWindow;
  if (loading) return loading;
  patchDom(w);
  loading = new Promise<void>((resolve, reject) => {
    if (!document.getElementById(HOLDER_ID)) {
      const holder = document.createElement("div");
      holder.id = HOLDER_ID;
      holder.hidden = true;
      document.body.appendChild(holder);
    }
    w.zkTranslateInit = () => {
      const Element = w.google?.translate?.TranslateElement;
      if (Element) new Element({ pageLanguage: "en", autoDisplay: false }, HOLDER_ID);
      resolve();
    };
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://translate.google.com/translate_a/element.js?cb=zkTranslateInit";
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error("Translation could not load"));
    };
    document.head.appendChild(script);
  });
  return loading;
};

/** The widget's own (hidden) language dropdown, once it has drawn it. */
const waitForCombo = async (): Promise<HTMLSelectElement | null> => {
  for (let i = 0; i < 50; i++) {
    const combo = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
    if (combo && combo.options.length > 1) return combo;
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
};

// ---- public actions ----------------------------------------------------------------

/**
 * Show the site in `code`. `remember` marks it as the visitor's own choice, so
 * automatic detection leaves it alone from then on.
 */
export const translateTo = async (code: string, { remember }: { remember: boolean }) => {
  if (code === "en") return showEnglish({ remember });
  if (!findLanguage(code)) return;
  if (remember) storage.set(CHOICE_KEY, code);
  writeCookie(`/en/${code}`);
  applyDirection(code);
  notify();
  try {
    await loadWidget();
    const combo = await waitForCombo();
    if (combo && combo.value !== code) {
      combo.value = code;
      combo.dispatchEvent(new Event("change"));
    }
  } catch {
    // Blocked or offline: stay in English rather than leave a half state.
    writeCookie(null);
    applyDirection("en");
    notify();
  }
};

/** Back to the original English. The widget cannot un-translate cleanly, so reload. */
export const showEnglish = ({ remember }: { remember: boolean }) => {
  if (remember) storage.set(CHOICE_KEY, "en");
  const wasTranslated = currentLanguage() !== "en";
  writeCookie(null);
  applyDirection("en");
  notify();
  if (wasTranslated) window.location.reload();
};

/** On page load: carry on in the language already chosen, if any. */
export const resumeTranslation = () => {
  const code = currentLanguage();
  if (code === "en") return false;
  applyDirection(code);
  void translateTo(code, { remember: false });
  return true;
};
