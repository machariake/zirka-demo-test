"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { submitOnboarding, type OnboardingField } from "@/app/(frontend)/onboarding/actions";
import { trackEvent } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/contact";
import { WhatsAppIcon } from "./Icons";
import HumanCheck from "./HumanCheck";

export const PAID_PACKAGE_OPTIONS = [
  "Starter Visibility ($299/mo)",
  "Business Growth ($599/mo)",
  "Premium Digital Growth ($900/mo)",
  "Landing Page ($997)",
  "Business Website (3–5 pages) ($2,000)",
  "Large Business Website (6–10 pages) ($4,000)",
  "Website Care ($129/mo)",
  "Other / Custom Package",
];

export default function OnboardingForm({
  defaultPackage,
  whatsappNumber,
}: {
  defaultPackage?: string;
  whatsappNumber?: string;
}) {
  const [selectedPkg, setSelectedPkg] = useState(defaultPackage || PAID_PACKAGE_OPTIONS[0]);
  const [errors, setErrors] = useState<Partial<Record<OnboardingField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [attempt, setAttempt] = useState(0);

  const clear = (field: OnboardingField) => () =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  const invalid = (field: OnboardingField) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `ob-${field}-error` : undefined,
    onInput: clear(field),
  });

  const errorText = (field: OnboardingField) =>
    errors[field] ? (
      <p className="field-error" id={`ob-${field}-error`}>
        {errors[field]}
      </p>
    ) : null;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setFormError(null);

    startTransition(async () => {
      const result = await submitOnboarding(formData);
      if (result.ok) {
        trackEvent("onboarding_submit", { package: String(formData.get("packageName") ?? "") });
        setSubmittedName(String(formData.get("name") ?? "").split(" ")[0] || "there");
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error ?? "Something went wrong. Please try again.");
      setAttempt((n) => n + 1);
      const first = Object.keys(result.fieldErrors ?? {})[0];
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
    });
  }

  const kickoffWhatsApp = whatsappNumber
    ? whatsappUrl(
        whatsappNumber,
        `Hi Zirka! I just completed payment for ${selectedPkg} and submitted my onboarding form. I'm ready to get started!`
      )
    : null;

  if (submittedName) {
    return (
      <div className="booking-done" role="status">
        <span className="eyebrow">Onboarding received</span>
        <h2>Welcome aboard, {submittedName}!</h2>
        <p className="booking-done__meta">
          We&rsquo;ve received your kickoff details for <strong>{selectedPkg}</strong>. Your
          dedicated strategist will reach out within 24 hours (1 business day) with your kickoff
          plan and timeline.
        </p>
        <div className="hero-ctas" style={{ marginTop: 24 }}>
          {kickoffWhatsApp && (
            <a
              className="btn btn-gold"
              href={kickoffWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              Message Your Strategist on WhatsApp
            </a>
          )}
          <Link className="btn btn-outline" href="/book">
            Book a Kickoff Call
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="ob-website">Leave this empty</label>
        <input id="ob-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field">
        <label htmlFor="ob-package">Which package did you purchase?</label>
        <select
          id="ob-package"
          name="packageName"
          value={selectedPkg}
          onChange={(e) => {
            setSelectedPkg(e.target.value);
            clear("packageName")();
          }}
        >
          {PAID_PACKAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errorText("packageName")}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="ob-name">Full name</label>
          <input id="ob-name" name="name" type="text" autoComplete="name" required {...invalid("name")} />
          {errorText("name")}
        </div>
        <div className="field">
          <label htmlFor="ob-email">Email used on Stripe</label>
          <input
            id="ob-email"
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
          <label htmlFor="ob-phone">Phone or WhatsApp</label>
          <input
            id="ob-phone"
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
          <label htmlFor="ob-company">Business name</label>
          <input id="ob-company" name="company" type="text" autoComplete="organization" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="ob-links">Website URL or social media handles (optional)</label>
        <input
          id="ob-links"
          name="links"
          type="text"
          placeholder="e.g. https://yourbusiness.com, @yourinstagram"
        />
      </div>

      <div className="field">
        <label htmlFor="ob-details">Tell us about your business, goals, and any brand assets</label>
        <textarea
          id="ob-details"
          name="details"
          rows={5}
          required
          placeholder="Share what your business offers, your target customers, preferred colors/style, or any links to logos and photos..."
          {...invalid("details")}
        />
        {errorText("details")}
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
        {pending ? "Submitting…" : "Complete Onboarding & Start Service"}
      </button>
    </form>
  );
}
