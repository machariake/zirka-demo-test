"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type WebsitePreviewProps = {
  title: string;
  label: string;
  desktopSrc: string;
  mobileSrc: string;
};

/**
 * Interactive desktop + mobile website showcase inside a sleek browser/phone
 * frame. Visitors can scroll freely, run a smooth auto-scroll tour, or expand
 * to full-screen focus mode — without ever exposing any external staging URL.
 */
export default function WebsitePreview({
  title,
  label,
  desktopSrc,
  mobileSrc,
}: WebsitePreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [expanded, setExpanded] = useState(false);
  const [autoScrolling, setAutoScrolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopAutoScroll = useCallback(() => {
    setAutoScrolling(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0;
    setProgress(pct);
    if (el.scrollTop > 24) setHasScrolled(true);
  }, []);

  useEffect(() => {
    if (!autoScrolling) return;
    const el = scrollRef.current;
    if (!el) return;

    const step = () => {
      const max = el.scrollHeight - el.clientHeight;
      if (el.scrollTop >= max - 1) {
        stopAutoScroll();
        return;
      }
      el.scrollTop += 1.6;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [autoScrolling, stopAutoScroll]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  const switchViewport = (next: "desktop" | "mobile") => {
    stopAutoScroll();
    setViewport(next);
    setProgress(0);
    setHasScrolled(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    stopAutoScroll();
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleAutoScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (autoScrolling) {
      stopAutoScroll();
      return;
    }
    const max = el.scrollHeight - el.clientHeight;
    if (el.scrollTop >= max - 4) {
      el.scrollTop = 0;
    }
    setHasScrolled(true);
    setAutoScrolling(true);
  };

  return (
    <div className={`preview-showcase${expanded ? " is-expanded" : ""}`} id="interactive-preview">
      <div className="preview-showcase__head">
        <div>
          <span className="eyebrow">Interactive Studio Preview</span>
          <h2>Scroll through the live design</h2>
        </div>

        <div className="preview-toolbar">
          <div className="preview-showcase__controls" role="group" aria-label="Viewport size">
            <button
              type="button"
              className={`preview-toggle${viewport === "desktop" ? " is-active" : ""}`}
              onClick={() => switchViewport("desktop")}
              aria-pressed={viewport === "desktop"}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="1.5" y="2.5" width="13" height="9" rx="1.5" />
                <path d="M5.5 13.5h5M8 11.5v2" />
              </svg>
              Desktop
            </button>
            <button
              type="button"
              className={`preview-toggle${viewport === "mobile" ? " is-active" : ""}`}
              onClick={() => switchViewport("mobile")}
              aria-pressed={viewport === "mobile"}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="4.5" y="1.5" width="7" height="13" rx="1.5" />
                <path d="M7.2 12h1.6" strokeLinecap="round" />
              </svg>
              Mobile
            </button>
          </div>

          <button
            type="button"
            className={`preview-action-btn${autoScrolling ? " is-active" : ""}`}
            onClick={toggleAutoScroll}
          >
            {autoScrolling ? (
              <>
                <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <rect x="4" y="3" width="3" height="10" rx="0.8" />
                  <rect x="9" y="3" width="3" height="10" rx="0.8" />
                </svg>
                Pause tour
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M4.5 3.2 12.8 8l-8.3 4.8V3.2Z" />
                </svg>
                Auto-scroll
              </>
            )}
          </button>

          <button
            type="button"
            className="preview-action-btn"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Close fullscreen" : "Expand view"}
          </button>
        </div>
      </div>

      <div className={`preview-frame${viewport === "mobile" ? " is-mobile" : ""}`}>
        <div className="preview-chrome">
          <div className="preview-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="preview-bar" aria-label={label}>
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="3" y="7" width="10" height="7" rx="1.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            <span>{label}</span>
          </div>
          <div className="preview-chrome__right">
            <span className="preview-pct" aria-hidden="true">
              {Math.round(progress)}%
            </span>
            <button type="button" className="preview-top-btn" onClick={scrollToTop}>
              Top &uarr;
            </button>
          </div>
        </div>

        <div className="preview-progress" aria-hidden="true">
          <span className="preview-progress__bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="preview-viewport-wrap">
          <div
            ref={scrollRef}
            className="preview-viewport"
            tabIndex={0}
            onScroll={handleScroll}
            onWheel={stopAutoScroll}
            onTouchStart={stopAutoScroll}
            aria-label={`Scrollable ${viewport} preview of ${title}`}
          >
            {viewport === "desktop" ? (
              <Image
                src={desktopSrc}
                alt={`Full scrollable desktop website view for ${title}`}
                width={1440}
                height={6000}
                unoptimized
                priority
                className="preview-img"
              />
            ) : (
              <Image
                src={mobileSrc}
                alt={`Full scrollable mobile website view for ${title}`}
                width={390}
                height={4000}
                unoptimized
                priority
                className="preview-img"
              />
            )}
          </div>

          {!hasScrolled && !autoScrolling && (
            <button
              type="button"
              className="preview-scroll-cue"
              onClick={toggleAutoScroll}
            >
              Scroll inside or click to tour &darr;
            </button>
          )}
        </div>

        {viewport === "mobile" && (
          <div className="preview-phone-chin" aria-hidden="true">
            <span />
          </div>
        )}
      </div>

      <p className="preview-hint">
        Scroll smoothly inside the frame, switch between Desktop and Mobile, or hit Auto-scroll for
        a guided walkthrough.
      </p>
    </div>
  );
}
