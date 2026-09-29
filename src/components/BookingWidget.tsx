"use client";

import { useMemo, useState, useSyncExternalStore, useTransition, type FormEvent } from "react";
import { createBooking, refreshAvailability } from "@/app/(frontend)/book/actions";
import type { DayAvailability } from "@/lib/booking";
import { trackEvent } from "@/lib/analytics";
import HumanCheck from "./HumanCheck";

type Props = {
  initialDays: DayAvailability[];
  businessTz: string;
  callMinutes: number;
  meetingDetails: string;
};

// The visitor's timezone only exists in the browser; render the business timezone on the server.
const noop = () => () => {};
const useVisitorTz = (fallback: string) =>
  useSyncExternalStore(noop, () => Intl.DateTimeFormat().resolvedOptions().timeZone || fallback, () => fallback);

const dayKey = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

const fmt = (iso: string, tz: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(new Date(iso));

const tzLabel = (tz: string, iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "long" })
    .formatToParts(new Date(iso))
    .find((p) => p.type === "timeZoneName")?.value ?? tz;

const googleCalendarLink = (start: string, end: string, details: string) => {
  const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: "Consultation — Zirka Digital Solutions",
    dates: `${stamp(start)}/${stamp(end)}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
};

export default function BookingWidget({ initialDays, businessTz, callMinutes, meetingDetails }: Props) {
  const visitorTz = useVisitorTz(businessTz);
  const [days, setDays] = useState(initialDays);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ start: string; end: string; name: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [attempt, setAttempt] = useState(0);

  // Regroup slots by the visitor's own calendar day — a 9am Atlanta slot can be evening in Nairobi.
  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const slot of days.flatMap((d) => d.slots)) {
      const key = dayKey(slot, visitorTz);
      map.set(key, [...(map.get(key) ?? []), slot]);
    }
    return [...map.entries()].map(([key, slots]) => ({ key, slots }));
  }, [days, visitorTz]);

  const activeDay = grouped.find((g) => g.key === pickedDay) ?? grouped[0] ?? null;
  const differentTz = visitorTz !== businessTz;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pickedSlot) return;
    const form = new FormData(e.currentTarget);
    form.set("start", pickedSlot);
    form.set("timezone", visitorTz);
    setError(null);

    startTransition(async () => {
      const result = await createBooking(form);
      if (result.ok) {
        trackEvent("booking_submit");
        setDone({ start: result.start, end: result.end, name: String(form.get("name") ?? "") });
        return;
      }
      setError(result.error);
      setAttempt((n) => n + 1);
      // The slot may have just gone — show what's genuinely free now.
      setDays(await refreshAvailability());
      setPickedSlot(null);
    });
  }

  if (done) {
    return (
      <div className="booking-done" role="status">
        <span className="eyebrow">You&rsquo;re booked in</span>
        <h2>See you then, {done.name.split(" ")[0] || "there"}.</h2>
        <p className="booking-done__when">
          {fmt(done.start, visitorTz, { weekday: "long", month: "long", day: "numeric" })} at{" "}
          {fmt(done.start, visitorTz, { hour: "numeric", minute: "2-digit" })}
        </p>
        <p className="booking-done__meta">
          {callMinutes} minutes · {meetingDetails}. A confirmation is on its way to your inbox.
        </p>
        <a
          className="btn btn-outline"
          href={googleCalendarLink(done.start, done.end, meetingDetails)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to Google Calendar
        </a>
      </div>
    );
  }

  if (grouped.length === 0) {
    return (
      <div className="booking-empty">
        <h2>No open times right now</h2>
        <p>Every slot in the booking window is taken. Message us on WhatsApp and we&rsquo;ll find a time.</p>
      </div>
    );
  }

  return (
    <div className="booking">
      <div className="booking__step">
        <h2 className="booking__label">1. Pick a day</h2>
        <div className="booking__days" role="listbox" aria-label="Available days">
          {grouped.map((g) => {
            const iso = g.slots[0];
            const selected = activeDay?.key === g.key;
            return (
              <button
                key={g.key}
                type="button"
                role="option"
                aria-selected={selected}
                className={`day-chip${selected ? " is-selected" : ""}`}
                onClick={() => {
                  setPickedDay(g.key);
                  setPickedSlot(null);
                }}
              >
                <span className="day-chip__dow">{fmt(iso, visitorTz, { weekday: "short" })}</span>
                <span className="day-chip__num">{fmt(iso, visitorTz, { day: "numeric" })}</span>
                <span className="day-chip__mon">{fmt(iso, visitorTz, { month: "short" })}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeDay && (
        <div className="booking__step">
          <h2 className="booking__label">2. Pick a time</h2>
          <p className="booking__tz">
            Times shown in {tzLabel(visitorTz, activeDay.slots[0])}
          </p>
          <div className="booking__times">
            {activeDay.slots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={`time-chip${pickedSlot === slot ? " is-selected" : ""}`}
                aria-pressed={pickedSlot === slot}
                onClick={() => setPickedSlot(slot)}
              >
                {fmt(slot, visitorTz, { hour: "numeric", minute: "2-digit" })}
              </button>
            ))}
          </div>
        </div>
      )}

      {pickedSlot && (
        <form className="booking__step booking__form" onSubmit={submit}>
          <h2 className="booking__label">3. Your details</h2>
          <div className="booking__summary">
            <strong>
              {fmt(pickedSlot, visitorTz, { weekday: "long", month: "long", day: "numeric" })} ·{" "}
              {fmt(pickedSlot, visitorTz, { hour: "numeric", minute: "2-digit" })}
            </strong>
            <span>
              {callMinutes} minutes · {meetingDetails}
              {differentTz &&
                ` · ${fmt(pickedSlot, businessTz, { hour: "numeric", minute: "2-digit", timeZoneName: "short" })} our time`}
            </span>
          </div>

          <div className="hp-field" aria-hidden="true">
            <label htmlFor="bk-website">Leave this empty</label>
            <input id="bk-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="bk-name">Full name</label>
              <input id="bk-name" name="name" type="text" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="bk-email">Email</label>
              <input id="bk-email" name="email" type="email" autoComplete="email" required />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="bk-phone">Phone or WhatsApp (optional)</label>
              <input id="bk-phone" name="phone" type="tel" autoComplete="tel" />
            </div>
            <div className="field">
              <label htmlFor="bk-company">Company (optional)</label>
              <input id="bk-company" name="company" type="text" autoComplete="organization" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="bk-topic">What would you like to talk about? (optional)</label>
            <textarea id="bk-topic" name="topic" rows={3} />
          </div>

          <HumanCheck resetSignal={attempt} />

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-gold" disabled={pending}>
            {pending ? "Booking…" : "Confirm booking"}
          </button>
        </form>
      )}

      {error && !pickedSlot && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
