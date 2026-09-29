"use client";

import { useState, useTransition, type FormEvent } from "react";
import { requestQuote, type QuoteField } from "@/app/(frontend)/quote/actions";
import { budgetRanges as BUDGETS } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import HumanCheck from "./HumanCheck";

export type QuoteService = { id: number; name: string; short: string };

const TIMELINES = ["As soon as possible", "Within a month", "In the next quarter", "Just exploring"];

export default function QuoteForm({
  services,
  preselected,
  plan,
}: {
  services: QuoteService[];
  preselected: number[];
  /** The Pricing-page plan the visitor came from, if any. */
  plan?: string;
}) {
  const [picked, setPicked] = useState<number[]>(preselected);
  const [errors, setErrors] = useState<Partial<Record<QuoteField, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [attempt, setAttempt] = useState(0);

  const toggle = (id: number) => {
    setPicked((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
    clear("services")();
  };

  // Clear a field's error as soon as the visitor starts correcting it.
  const clear = (key: QuoteField) => () =>
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));

  const invalid = (key: QuoteField) => ({
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `q-${key}-error` : undefined,
    onInput: clear(key),
  });

  const errorText = (key: QuoteField) =>
    errors[key] ? (
      <p className="field-error" id={`q-${key}-error`}>
        {errors[key]}
      </p>
    ) : null;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const form = new FormData(el);
    form.delete("services");
    for (const id of picked) form.append("services", String(id));
    setError(null);

    startTransition(async () => {
      const result = await requestQuote(form);
      if (result.ok) {
        trackEvent("quote_submit", plan ? { plan } : undefined);
        setSent(String(form.get("name") ?? ""));
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setError(result.error ?? "Something went wrong.");
      setAttempt((n) => n + 1);
      // Take the visitor straight to the first thing that needs fixing.
      const first = Object.keys(result.fieldErrors ?? {})[0];
      if (first === "services") {
        el.querySelector<HTMLElement>(".quote-chip")?.focus();
      } else if (first) {
        (el.elements.namedItem(first) as HTMLElement | null)?.focus();
      }
    });
  }

  if (sent) {
    return (
      <div className="booking-done" role="status">
        <span className="eyebrow">Request received</span>
        <h2>Thanks, {sent.split(" ")[0] || "there"}.</h2>
        <p className="booking-done__meta">
          We&rsquo;ll put together a quote for {plan ? `the ${plan} plan` : "the services you picked"} and reply by email within one
          business day. If it&rsquo;s urgent, message us on WhatsApp and we&rsquo;ll get straight to it.
        </p>
      </div>
    );
  }

  return (
    <form className="quote" onSubmit={submit} noValidate>
      {plan && (
        <>
          <input type="hidden" name="plan" value={plan} />
          <div className="quote__plan" role="note">
            <span className="eyebrow">Plan selected</span>
            <strong>{plan}</strong>
            <span>
              We&rsquo;ll confirm the exact price for this plan. Add any specific services below if
              you&rsquo;d like them priced too — or skip straight to your details.
            </span>
          </div>
        </>
      )}
      <div className="quote__step">
        <div className="quote__step-head">
          <h2 className="booking__label">1. What do you need?{plan ? " (optional)" : ""}</h2>
          {/* Announced politely so a screen reader hears the count change too. */}
          <span className="quote__count" aria-live="polite">
            {picked.length === 0
              ? "Nothing selected yet"
              : `${picked.length} service${picked.length === 1 ? "" : "s"} selected`}
          </span>
        </div>
        <p className="booking__tz">Pick as many as you like — we price each one separately.</p>
        <div
          className="quote__services"
          role="group"
          aria-label="Services to quote"
          aria-describedby={errors.services ? "q-services-error" : undefined}
        >
          {services.map((s) => {
            const on = picked.includes(s.id);
            return (
              <button
                type="button"
                key={s.id}
                className={`quote-chip${on ? " is-selected" : ""}`}
                aria-pressed={on}
                onClick={() => toggle(s.id)}
              >
                <span className="quote-chip__tick" aria-hidden="true">
                  {on ? "✓" : "+"}
                </span>
                <span>
                  <strong>{s.name}</strong>
                  <em>{s.short}</em>
                </span>
              </button>
            );
          })}
        </div>
        {errorText("services")}
      </div>

      <div className="quote__step booking__form">
        <h2 className="booking__label">2. About you</h2>

        {/* So nobody sends a request without seeing what they actually asked for. */}
        {picked.length > 0 && (
          <div className="quote__chosen">
            <span className="quote__chosen-label">We&rsquo;ll quote you for</span>
            <ul>
              {services
                .filter((s) => picked.includes(s.id))
                .map((s) => (
                  <li key={s.id}>
                    {s.name}
                    <button
                      type="button"
                      onClick={() => toggle(s.id)}
                      aria-label={`Remove ${s.name}`}
                      title={`Remove ${s.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="hp-field" aria-hidden="true">
          <label htmlFor="q-website">Leave this empty</label>
          <input id="q-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="q-name">Full name</label>
            <input id="q-name" name="name" type="text" autoComplete="name" required {...invalid("name")} />
            {errorText("name")}
          </div>
          <div className="field">
            <label htmlFor="q-email">Email</label>
            <input
              id="q-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              {...invalid("email")}
            />
            {errorText("email")}
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="q-phone">Phone or WhatsApp</label>
            <input
              id="q-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              {...invalid("phone")}
            />
            {errorText("phone")}
          </div>
          <div className="field">
            <label htmlFor="q-company">Business name (optional)</label>
            <input id="q-company" name="company" type="text" autoComplete="organization" />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="q-budget">Monthly budget</label>
            <select
              id="q-budget"
              name="budget"
              defaultValue={BUDGETS[0]}
              aria-describedby="q-budget-hint"
            >
              {BUDGETS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <p className="field-hint" id="q-budget-hint">
              Roughly what you can spend with us each month. Advertising budget is separate.
            </p>
          </div>
          <div className="field">
            <label htmlFor="q-timeline">When do you want to start?</label>
            <select id="q-timeline" name="timeline" defaultValue={TIMELINES[0]}>
              {TIMELINES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="q-details">Anything else we should know? (optional)</label>
          <textarea id="q-details" name="details" rows={4} />
        </div>

        <HumanCheck resetSignal={attempt} />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-gold" disabled={pending} aria-busy={pending}>
          {pending ? "Sending…" : `Request my quote${picked.length ? ` (${picked.length})` : ""}`}
        </button>
      </div>
    </form>
  );
}
