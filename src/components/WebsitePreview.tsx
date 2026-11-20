"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type WebsitePreviewProps = {
  title: string;
  label: string;
  desktopSrc: string;
  mobileSrc: string;
};

/**
 * Displays a full-page desktop and mobile website capture inside a scrollable
 * browser frame so visitors can inspect and scroll the entire site without
 * exposing any external staging URL.
 */
export default function WebsitePreview({
  title,
  label,
  desktopSrc,
  mobileSrc,
}: WebsitePreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const switchViewport = (next: "desktop" | "mobile") => {
    setViewport(next);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="preview-showcase" id="interactive-preview">
      <div className="preview-showcase__head">
        <div>
          <span className="eyebrow">Interactive Preview</span>
          <h2>Scroll through the live design</h2>
        </div>
        <div className="preview-showcase__controls" role="group" aria-label="Viewport size">
          <button
            type="button"
            className={`preview-toggle${viewport === "desktop" ? " is-active" : ""}`}
            onClick={() => switchViewport("desktop")}
            aria-pressed={viewport === "desktop"}
          >
            Desktop view
          </button>
          <button
            type="button"
            className={`preview-toggle${viewport === "mobile" ? " is-active" : ""}`}
            onClick={() => switchViewport("mobile")}
            aria-pressed={viewport === "mobile"}
          >
            Mobile view
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
          <button type="button" className="preview-top-btn" onClick={scrollToTop}>
            Back to top
          </button>
        </div>

        <div
          ref={scrollRef}
          className="preview-viewport"
          tabIndex={0}
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
      </div>

      <p className="preview-hint">
        Scroll inside the frame above to explore every section from header to footer ({viewport} view).
      </p>
    </div>
  );
}
