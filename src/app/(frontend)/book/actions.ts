"use server";

import { getCms, getFeatures, getSettings } from "@/lib/cms";
import { allow, clientIp } from "@/lib/rate-limit";
import { passesHumanCheck } from "@/lib/turnstile-server";
import { HUMAN_CHECK_FAILED } from "@/lib/turnstile";
import { getAvailability, getBookingConfig, isSlotAvailable } from "@/lib/booking";
import { isValidTimeZone } from "@/lib/timezone";
import { SITE_URL } from "@/lib/site";
import { escapeHtml, mailSetup } from "@/payload/mailer";

export type BookingResult = { ok: true; start: string; end: string } | { ok: false; error: string };

/**
 * Serialises bookings in this server process, so two people clicking the same
 * slot at the same moment can't both pass the availability check.
 */
let queue: Promise<unknown> = Promise.resolve();
const exclusive = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
};

export async function refreshAvailability() {
  const payload = await getCms();
  const { days } = await getAvailability(payload);
  return days;
}

const MAX = { name: 120, email: 200, phone: 40, company: 160, topic: 2000, timezone: 64 };
const field = (form: FormData, key: keyof typeof MAX) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, MAX[key]);

const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (v: string) => v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export async function createBooking(formData: FormData): Promise<BookingResult> {
  if (String(formData.get("website") ?? "").trim() !== "") {
    // Honeypot: look successful so the bot learns nothing.
    const s = new Date().toISOString();
    return { ok: true, start: s, end: s };
  }

  if (!(await getFeatures()).bookingEnabled) {
    return { ok: false, error: "Online booking is currently closed. Please reach us on WhatsApp." };
  }

  const ip = await clientIp();
  if (!allow(`booking:${ip}`, 4, 30 * 60 * 1000)) {
    return { ok: false, error: "Too many booking attempts. Please wait a little, or reach us on WhatsApp." };
  }

  const name = field(formData, "name");
  const email = field(formData, "email");
  const startIso = String(formData.get("start") ?? "");
  const visitorTz = field(formData, "timezone");

  if (!name || !email) return { ok: false, error: "Please add your name and email." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "That email address doesn't look right." };
  if (!(await passesHumanCheck(formData, ip))) return { ok: false, error: HUMAN_CHECK_FAILED };

  const payload = await getCms();

  const booked = await exclusive(async () => {
    if (!(await isSlotAvailable(payload, startIso))) return null;
    const config = await getBookingConfig(payload);
    const start = new Date(startIso);
    const end = new Date(start.getTime() + config.callMinutes * 60e3);
    const doc = await payload.create({
      collection: "bookings",
      data: {
        start: start.toISOString(),
        end: end.toISOString(),
        status: "confirmed",
        name,
        email,
        phone: field(formData, "phone"),
        company: field(formData, "company"),
        topic: field(formData, "topic"),
        visitorTimezone: isValidTimeZone(visitorTz) ? visitorTz : "",
      },
    });
    return { doc, config, start, end };
  });

  if (!booked) {
    return { ok: false, error: "Sorry — that time was just taken. Please pick another slot." };
  }

  const { doc, config, start, end } = booked;
  await sendBookingEmails({ payload, doc, config, start, end, visitorTz });

  return { ok: true, start: start.toISOString(), end: end.toISOString() };
}

async function sendBookingEmails({
  payload,
  doc,
  config,
  start,
  end,
  visitorTz,
}: {
  payload: Awaited<ReturnType<typeof getCms>>;
  doc: { id: number | string; name: string; email: string; phone?: string | null; company?: string | null; topic?: string | null };
  config: Awaited<ReturnType<typeof getBookingConfig>>;
  start: Date;
  end: Date;
  visitorTz: string;
}) {
  try {
    const mail = await mailSetup(payload);
    const settings = await getSettings();

    const fmt = (tz: string) =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(start);

    const businessTime = fmt(config.timezone);
    const theirTime = isValidTimeZone(visitorTz) ? fmt(visitorTz) : businessTime;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Zirka Digital Solutions//Booking//EN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:booking-${doc.id}@zirka`,
      `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART:${icsStamp(start)}`,
      `DTEND:${icsStamp(end)}`,
      `SUMMARY:${icsText(`Consultation — Zirka Digital Solutions`)}`,
      `DESCRIPTION:${icsText(config.meetingDetails)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const shell = (body: string) =>
      `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0e2a20;max-width:560px">${body}</div>`;

    if (mail.teamInbox) {
      await mail.send({
        to: mail.teamInbox,
        replyTo: doc.email,
        subject: `New call booked: ${String(doc.name).slice(0, 60)} — ${businessTime}`,
        html: shell(`
          <p style="font-size:18px;margin:0 0 14px">New consultation booked</p>
          <p style="margin:0 0 14px"><strong>${escapeHtml(businessTime)}</strong><br>
          <span style="color:#5f6b64">Their time: ${escapeHtml(theirTime)}</span></p>
          <p style="margin:0 0 6px">${escapeHtml(doc.name)}${doc.company ? ` · ${escapeHtml(doc.company)}` : ""}</p>
          <p style="margin:0 0 6px">${escapeHtml(doc.email)}${doc.phone ? ` · ${escapeHtml(doc.phone)}` : ""}</p>
          ${doc.topic ? `<p style="white-space:pre-wrap;background:#f6f3ea;padding:14px 16px;border-radius:8px">${escapeHtml(doc.topic)}</p>` : ""}
          <p><a href="${SITE_URL}/admin/collections/bookings/${doc.id}" style="color:#9c5c33">Open in the admin</a></p>`),
        attachments: [{ filename: "call.ics", content: ics, contentType: "text/calendar; method=REQUEST" }],
      });
    }

    // Confirmation to the person who booked, in their own timezone.
    await mail.send({
      to: doc.email,
      subject: `Your call with Zirka Digital Solutions — ${theirTime}`,
      html: shell(`
        <p style="font-size:18px;margin:0 0 14px">You're booked in, ${escapeHtml(String(doc.name).split(" ")[0])}.</p>
        <p style="margin:0 0 14px"><strong>${escapeHtml(theirTime)}</strong><br>
        ${escapeHtml(config.callMinutes)} minutes · ${escapeHtml(config.meetingDetails)}</p>
        <p style="margin:0 0 14px">The attached invite adds it to your calendar. Need to change the time?
        Reply to this email${settings.phoneDisplay ? ` or message us on WhatsApp at ${escapeHtml(settings.phoneDisplay)}` : ""}.</p>
        <p style="margin:0;color:#5f6b64">Zirka Digital Solutions — Where Ideas Become Impact</p>`),
      replyTo: mail.teamInbox ?? undefined,
      attachments: [{ filename: "call.ics", content: ics, contentType: "text/calendar; method=REQUEST" }],
    });
  } catch (err) {
    // The booking is already saved — a mail problem must never undo it.
    payload.logger.error({ err }, "Could not send booking emails");
  }
}
