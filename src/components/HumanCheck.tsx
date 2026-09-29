"use client";

import { useEffect, useRef, useState } from "react";
import { TURNSTILE_FIELD, TURNSTILE_SITE_KEY } from "@/lib/turnstile";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
type TurnstileWindow = Window & { turnstile?: TurnstileApi; zkTurnstileReady?: () => void };

let loading: Promise<TurnstileApi> | null = null;

/** Cloudflare's script, loaded once and only on pages that show a form. */
const loadTurnstile = (): Promise<TurnstileApi> => {
  const w = window as TurnstileWindow;
  if (w.turnstile) return Promise.resolve(w.turnstile);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    w.zkTurnstileReady = () => (w.turnstile ? resolve(w.turnstile) : reject(new Error("Turnstile missing")));
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=zkTurnstileReady";
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error("Turnstile could not load"));
    };
    document.head.appendChild(script);
  });
  return loading;
};

/**
 * The spam check inside a form. Renders nothing until Turnstile keys are set.
 * Cloudflare only shows a checkbox when it is unsure; most people see nothing.
 *
 * A token can be used once, so the form bumps `resetSignal` after every failed
 * attempt and the widget fetches a fresh one.
 */
export default function HumanCheck({ resetSignal = 0 }: { resetSignal?: number }) {
  const holder = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !holder.current) return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !holder.current || widgetId.current) return;
        widgetId.current = api.render(holder.current, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: "interaction-only",
          theme: "auto",
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      const api = (window as TurnstileWindow).turnstile;
      if (api && widgetId.current) api.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetSignal === 0) return;
    const api = (window as TurnstileWindow).turnstile;
    if (api && widgetId.current) {
      api.reset(widgetId.current);
      queueMicrotask(() => setToken(""));
    }
  }, [resetSignal]);

  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <div className="human-check">
      <div ref={holder} />
      <input type="hidden" name={TURNSTILE_FIELD} value={token} readOnly />
    </div>
  );
}
