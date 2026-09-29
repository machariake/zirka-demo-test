import type { CollectionConfig } from "payload";
import { isAdmin, isStaff } from "../access";

export const Bookings: CollectionConfig = {
  slug: "bookings",
  labels: { singular: "Booked Call", plural: "Booked Calls" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["start", "name", "company", "status"],
    group: "Leads",
    description: "Consultations booked through the website. Times are stored in UTC and shown in your browser's timezone.",
  },
  defaultSort: "start",
  access: {
    // Created only through the booking page's server action, which checks availability.
    create: () => false,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "start",
          type: "date",
          required: true,
          index: true,
          admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } },
        },
        {
          name: "end",
          type: "date",
          required: true,
          admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } },
        },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "confirmed",
      index: true,
      options: [
        { label: "Confirmed", value: "confirmed" },
        { label: "Completed", value: "completed" },
        { label: "No-show", value: "no-show" },
        { label: "Cancelled (frees the slot)", value: "cancelled" },
      ],
    },
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "company", type: "text" },
    { name: "topic", type: "textarea", admin: { description: "What they want to talk about." } },
    { name: "visitorTimezone", type: "text", admin: { readOnly: true, description: "The timezone they booked from." } },
    { name: "notes", type: "textarea", admin: { description: "Internal only." } },
  ],
};
