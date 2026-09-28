"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { FEATURED_LANGUAGES, MORE_LANGUAGES, findLanguage } from "@/lib/languages";
import { currentLanguage, subscribeLanguage, translateTo } from "@/lib/translate";

/**
 * The language picker in the header. Marked "notranslate" so the language
 * names stay in their own language whatever the page is showing.
 */
export default function LanguageMenu() {
  // Server render assumes English; the browser corrects it from the cookie.
  const code = useSyncExternalStore(subscribeLanguage, currentLanguage, () => "en");
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  const choose = (next: string) => {
    setOpen(false);
    void translateTo(next, { remember: true });
  };

  const name = findLanguage(code)?.name ?? "English";

  return (
    <div className="lang-menu notranslate" translate="no" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="lang-menu__toggle"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Language: ${name}. Change language`}
        title="Change language"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
        <span className="lang-menu__code">{code.split("-")[0].toUpperCase()}</span>
      </button>
      <div className="lang-menu__panel" id={menuId} hidden={!open}>
        <ul>
          {FEATURED_LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                lang={l.code}
                dir={l.rtl ? "rtl" : undefined}
                aria-current={l.code === code ? "true" : undefined}
                onClick={() => choose(l.code)}
              >
                {l.name}
              </button>
            </li>
          ))}
        </ul>
        <label className="lang-menu__more">
          <span>More languages</span>
          <select
            value={FEATURED_LANGUAGES.some((l) => l.code === code) ? "" : code}
            onChange={(e) => e.target.value && choose(e.target.value)}
          >
            <option value="">Choose…</option>
            {MORE_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} lang={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <p className="lang-menu__note">Translated automatically by Google.</p>
      </div>
    </div>
  );
}
