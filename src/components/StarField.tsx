"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number; r: number; tw: number };

/** Twinkle is a slow ~9-second cycle, so 30 frames a second is indistinguishable from 60. */
const FRAME_MS = 1000 / 30;

/**
 * The constellation behind the homepage hero.
 *
 * The stars never move — only their brightness changes — so the connecting
 * lines are drawn once to an offscreen canvas and each frame just copies them
 * and repaints the stars. It also stops completely whenever the hero is off
 * screen or the tab is hidden, and starts only once the page has loaded, so it
 * never competes with the first paint (brief §24: no animation at the expense
 * of speed). With reduced motion requested it is drawn once and left still.
 */
export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = document.createElement("canvas");
    const linesCtx = lines.getContext("2d");
    // The connecting lines take the site theme's accent (Features → Theme).
    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim() || "184, 115, 51";
    let points: Point[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let visible = false;

    function build() {
      if (!canvas || !hero || !ctx || !linesCtx) return;
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [canvas, lines]) {
        c.width = width * dpr;
        c.height = height * dpr;
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      linesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(36, Math.round((width * height) / 14000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.4,
        tw: Math.random() * Math.PI * 2,
      }));

      // The connecting lines, once, instead of every frame.
      linesCtx.clearRect(0, 0, width, height);
      linesCtx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            linesCtx.strokeStyle = `rgba(${accent}, ${0.18 * (1 - dist / 130)})`;
            linesCtx.beginPath();
            linesCtx.moveTo(points[i].x, points[i].y);
            linesCtx.lineTo(points[j].x, points[j].y);
            linesCtx.stroke();
          }
        }
      }
      paint(performance.now());
    }

    function paint(t: number) {
      // A hero that is hidden or not laid out yet has a 0×0 canvas, which drawImage rejects.
      if (!ctx || lines.width === 0 || lines.height === 0) return;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(lines, 0, 0, width, height);
      for (const p of points) {
        const flicker = reduced ? 1 : 0.55 + 0.45 * Math.sin(t / 1400 + p.tw);
        ctx.beginPath();
        ctx.fillStyle = `rgba(245,242,230,${0.5 * flicker + 0.25})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function tick(t: number) {
      frame = 0;
      if (!visible || document.hidden) return;
      if (t - last >= FRAME_MS) {
        last = t;
        paint(t);
      }
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (reduced || frame || !visible || document.hidden) return;
      frame = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    const onVisibility = () => start();

    // Wait for the page to finish loading before doing any drawing at all.
    const begin = () => {
      build();
      observer.observe(hero);
      window.addEventListener("resize", build);
      document.addEventListener("visibilitychange", onVisibility);
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const startWhenLoaded = () => idle(begin);
    if (document.readyState === "complete") startWhenLoaded();
    else window.addEventListener("load", startWhenLoaded, { once: true });

    return () => {
      window.removeEventListener("load", startWhenLoaded);
      window.removeEventListener("resize", build);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
