import { defineField, defineType } from "sanity";

/**
 * Simple footer link: a label and a path or URL. Accepts relative paths such as
 * "/pages/contact" as well as full URLs, unlike the reference-based `link` object.
 */
export const footerLink = defineType({
  name: "footerLink",
  title: "Footer link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Path or URL",
      type: "string",
      description:
        "Use a path for pages on this site (e.g. /pages/contact) or a full URL for external sites (e.g. https://instagram.com/...).",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true;
          if (value.startsWith("/") || /^https?:\/\//.test(value) || value.startsWith("mailto:")) {
            return true;
          }
          return "Start with / for a page on this site, or with https:// for an external link";
        }),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
