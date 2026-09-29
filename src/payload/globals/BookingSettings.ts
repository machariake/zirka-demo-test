import type { GlobalConfig } from "payload";
import { isAdmin } from "../access";
import { isValidTimeZone } from "../../lib/timezone";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const validTime = (v: unknown) => (typeof v === "string" && TIME.test(v)) || "Use 24-hour time, e.g. 09:00";

const DAYS = [
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
  { label: "Sunday", value: "0" },
];

export const BookingSettings: GlobalConfig = {
  slug: "booking-settings",
  label: "Booking Availability",
  admin: {
    group: "Setup",
    description: "When people can book a free consultation. Visitors see these times in their own timezone.",
  },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "timezone",
          type: "text",
          required: true,
          defaultValue: "America/New_York",
          admin: {
            width: "50%",
            description: 'Your working hours\' timezone, e.g. "America/New_York" or "Africa/Nairobi".',
          },
          validate: (v: unknown) =>
            (typeof v === "string" && isValidTimeZone(v)) || "Not a recognised timezone name.",
        },
        {
          name: "callMinutes",
          label: "Call length (minutes)",
          type: "number",
          required: true,
          defaultValue: 30,
          min: 15,
          max: 180,
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "bufferMinutes",
          label: "Gap between calls (minutes)",
          type: "number",
          defaultValue: 15,
          min: 0,
          max: 120,
          admin: { width: "33%" },
        },
        {
          name: "minNoticeHours",
          label: "Minimum notice (hours)",
          type: "number",
          defaultValue: 12,
          min: 0,
          admin: { width: "33%", description: "No bookings sooner than this." },
        },
        {
          name: "daysAhead",
          label: "Book up to (days ahead)",
          type: "number",
          defaultValue: 21,
          min: 1,
          max: 120,
          admin: { width: "33%" },
        },
      ],
    },
    {
      name: "meetingDetails",
      type: "text",
      defaultValue: "Video call — we'll email you the link",
      admin: { description: "Shown to the person booking, e.g. how the call happens." },
    },
    {
      name: "weeklyHours",
      label: "Weekly hours",
      type: "array",
      admin: {
        description: "Add a row per block of availability. Use two rows for one day to leave a lunch break.",
      },
      defaultValue: ["1", "2", "3", "4", "5"].map((day) => ({ day, start: "09:00", end: "17:00" })),
      fields: [
        {
          type: "row",
          fields: [
            { name: "day", type: "select", required: true, options: DAYS, admin: { width: "40%" } },
            { name: "start", type: "text", required: true, validate: validTime, admin: { width: "30%", placeholder: "09:00" } },
            { name: "end", type: "text", required: true, validate: validTime, admin: { width: "30%", placeholder: "17:00" } },
          ],
        },
      ],
    },
    {
      name: "blockedDates",
      label: "Days off",
      type: "array",
      admin: { description: "Holidays or days you're unavailable. No slots are offered on these dates." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "date", type: "date", required: true, admin: { width: "40%", date: { pickerAppearance: "dayOnly" } } },
            { name: "reason", type: "text", admin: { width: "60%", placeholder: "e.g. Public holiday" } },
          ],
        },
      ],
    },
  ],
};
