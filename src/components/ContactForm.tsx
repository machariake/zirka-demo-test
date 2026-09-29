"use client";

import { useState, useTransition, type FormEvent } from "react";
import { submitEnquiry, type ContactField } from "@/app/(frontend)/contact/actions";
import { budgetRanges as BUDGETS } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import HumanCheck from "./HumanCheck";

/**
 * Inputs are uncontrolled and never reset on an error, so a mistake in one
 * field never costs the visitor what they typed in the others. Validation runs
 * on the server, which reports one message per field (same pattern as the
 * free-audit form).
 */
export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [pending, startTransition] = useTransition();
  const [attempt, setAttempt] = useState(0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setFirstName(String(formData.get("name") ?? "").split(" ")[0]);
    setFormError(null);

    startTransition(async () => {
      const result = await submitEnquiry(formData);
      if (result.ok) {
        trackEvent("contact_form_submit");
        setSubmitted(true);
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error ?? "Something went wrong. Please try again.");
      setAttempt((n) => n + 1);
      // Take the visitor straight to the first thing that needs fixing.
      const first = Object.keys(result.fieldErrors ?? {})[0];
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
    });
  }

  // Clear a field's error as soon as the visitor starts correcting it.
  const clear = (field: ContactField) => () =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  const invalid = (field: ContactField) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `contact-${field}-error` : undefined,
    onInput: clear(field),
  });

  const errorText = (field: ContactField) =>
    errors[field] ? (
      <p className="field-error" id={`contact-${field}-error`}>
        {errors[field]}
      </p>
    ) : null;

  if (submitted) {
    return (
      <div className="success-note" role="status">
        <h3>Thanks, {firstName || "there"} &mdash; message received.</h3>
        <p>
          A strategist will reply within one business day. If it&rsquo;s urgent, message us on
          WhatsApp and you&rsquo;ll get someone faster.
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" required {...invalid("name")} />
          {errorText("name")}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
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
          <label htmlFor="phone">Phone or WhatsApp (optional)</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" {...invalid("phone")} />
          {errorText("phone")}
        </div>
        <div className="field">
          <label htmlFor="company">Company (optional)</label>
          <input id="company" name="company" type="text" autoComplete="organization" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="budget">Monthly budget</label>
        <select id="budget" name="budget" defaultValue={BUDGETS[0]}>
          {BUDGETS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="message">What are you trying to solve?</label>
        <textarea id="message" name="message" rows={5} required {...invalid("message")} />
        {errorText("message")}
      </div>

      <HumanCheck resetSignal={attempt} />

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-gold"
        style={{ alignSelf: "flex-start" }}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
