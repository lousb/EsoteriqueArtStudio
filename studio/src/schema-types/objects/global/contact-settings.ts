import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Contact details and contact form configuration. Lives inside the Settings singleton and
 * drives the /pages/contact page. Only fields that are filled in are shown on the site.
 */
export const contactSettings = defineType({
  name: "contactSettings",
  title: "Contact",
  type: "object",
  options: {
    collapsed: false,
    collapsible: true,
  },
  fieldsets: [
    { name: "details", title: "Contact details", options: { columns: 1 } },
    { name: "form", title: "Contact form", options: { columns: 1 } },
  ],
  fields: [
    defineField({
      fieldset: "details",
      name: "email",
      title: "Public email",
      type: "string",
      description: "Shown on the contact page.",
      validation: (rule) => rule.email(),
    }),
    defineField({
      fieldset: "details",
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      fieldset: "details",
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      description: "Also used for the Instagram link in the footer.",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      fieldset: "details",
      name: "instagramHandle",
      title: "Instagram handle",
      type: "string",
      description: "Display text, e.g. @esoterique",
    }),
    defineField({
      fieldset: "details",
      name: "address",
      title: "Studio / store address",
      type: "text",
      rows: 3,
    }),
    defineField({
      fieldset: "details",
      name: "hours",
      title: "Opening hours",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "hoursRow",
          fields: [
            defineField({ name: "days", title: "Days", type: "string", validation: (r) => r.required() }),
            defineField({ name: "hours", title: "Hours", type: "string", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "days", subtitle: "hours" } },
        }),
      ],
    }),
    defineField({
      fieldset: "details",
      name: "note",
      title: "Note under the details",
      type: "text",
      rows: 2,
      description: "Optional, e.g. by appointment only, or typical reply time.",
    }),
    defineField({
      fieldset: "form",
      name: "formEnabled",
      title: "Show contact form",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      fieldset: "form",
      name: "formRecipient",
      title: "Send form messages to",
      type: "string",
      description:
        "Email address that receives contact form messages. Requires RESEND_API_KEY to be set on the site; messages are always also saved in Sanity when SANITY_API_WRITE_TOKEN is set.",
      validation: (rule) => rule.email(),
    }),
    defineField({
      fieldset: "form",
      name: "formSubjects",
      title: "Subject options",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "Dropdown choices on the form. Defaults are used when empty.",
      initialValue: [
        "Order enquiry",
        "Returns and exchanges",
        "Shipping",
        "Product question",
        "Wholesale and press",
        "Something else",
      ],
    }),
    defineField({
      fieldset: "form",
      name: "formIntro",
      title: "Text above the form",
      type: "text",
      rows: 2,
    }),
    defineField({
      fieldset: "form",
      name: "formSuccessMessage",
      title: "Message after sending",
      type: "string",
      initialValue: "Thank you, your message is on its way to us. We will reply as soon as we can.",
    }),
  ],
});
