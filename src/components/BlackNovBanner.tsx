"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowIcon } from "./Icons";

// Black November ends Nov 30, 2026 at 23:59:59 EAT (+03:00)
const BLACK_NOV_END_MS = new Date("2026-11-30T23:59:59+03:00").getTime();
const STORAGE_KEY = "zirka_black_nov_dismissed_2026";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function getTimeLeft(): TimeLeft {
  const diff = BLACK_NOV_END_MS - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, expired: false };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function BlackNovBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    let intervalId: number | undefined;
    queueMicrotask(() => {
      try {
        if (sessionStorage.getItem(STORAGE_KEY) === "1") {
          setDismissed(true);
          return;
        }
      } catch {
        // Ignore storage errors in private browsing.
      }

      setTimeLeft(getTimeLeft());
      intervalId = window.setInterval(() => {
        setTimeLeft(getTimeLeft());
      }, 1000);
    });
    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  if (dismissed || timeLeft?.expired) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors.
    }
  };

  return (
    <div className="bn-bar" role="region" aria-label="Black November special offer">
      <div className="bn-bar__glow" aria-hidden="true" />
      <div className="wrap bn-bar__inner">
        <div className="bn-bar__offer">
          <span className="bn-badge">
            <span className="bn-dot" aria-hidden="true" />
            Black Nov
          </span>
          <p className="bn-bar__text">
            <strong>Black November Deals Live</strong>
            <span className="bn-bar__sep" aria-hidden="true">&mdash;</span>
            <span>Social Media from $299/mo &amp; Websites from $997</span>
          </p>
        </div>

        <div className="bn-bar__right">
          <div className="bn-timer" aria-label="Time remaining for Black November offer">
            <span className="bn-timer__label">Ends in</span>
            <div className="bn-timer__grid">
              <span className="bn-timer__unit">
                <strong>{timeLeft ? pad(timeLeft.days) : "--"}</strong>
                <em>d</em>
              </span>
              <span className="bn-timer__colon" aria-hidden="true">:</span>
              <span className="bn-timer__unit">
                <strong>{timeLeft ? pad(timeLeft.hours) : "--"}</strong>
                <em>h</em>
              </span>
              <span className="bn-timer__colon" aria-hidden="true">:</span>
              <span className="bn-timer__unit">
                <strong>{timeLeft ? pad(timeLeft.minutes) : "--"}</strong>
                <em>m</em>
              </span>
              <span className="bn-timer__colon" aria-hidden="true">:</span>
              <span className="bn-timer__unit">
                <strong>{timeLeft ? pad(timeLeft.seconds) : "--"}</strong>
                <em>s</em>
              </span>
            </div>
          </div>

          <Link className="bn-bar__cta" href="/#pricing">
            Claim Offer
            <ArrowIcon />
          </Link>

          <button
            type="button"
            className="bn-bar__close"
            onClick={dismiss}
            aria-label="Dismiss Black November banner"
            title="Dismiss"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
