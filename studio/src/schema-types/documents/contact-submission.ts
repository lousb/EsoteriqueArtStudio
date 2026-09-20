import { EnvelopeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * A message sent through the contact form. Created by the website (needs SANITY_API_WRITE_TOKEN),
 * so the fields are read-only here; use the Status field to keep track of replies.
 */
export const contactSubmission = defineType({
  name: "contactSubmission",
  title: "Contact message",
  type: "document",
  icon: EnvelopeIcon,
  fields: [
    defineField({ name: "name", type: "string", readOnly: true }),
    defineField({ name: "email", type: "string", readOnly: true }),
    defineField({ name: "subject", type: "string", readOnly: true }),
    defineField({ name: "message", type: "text", rows: 8, readOnly: true }),
    defineField({ name: "submittedAt", type: "datetime", readOnly: true }),
    defineField({
      name: "status",
      type: "string",
      initialValue: "new",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Replied", value: "replied" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "subject", status: "status" },
    prepare({ title, subtitle, status }) {
      return { title: title || "Anonymous", subtitle: `${status === "new" ? "● " : ""}${subtitle || ""}` };
    },
  },
});
