import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Customer service pages: Shipping & Taxes and Returns live under /pages/<slug>, and the
 * Privacy Policy and Terms of Service live under /policies/<slug>. The site ships with default
 * copy for each; creating a document here with the same slug and section overrides it.
 */
export const policyPage = defineType({
  name: "policyPage",
  title: "Customer service page",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "section",
      title: "URL section",
      type: "string",
      initialValue: "pages",
      options: {
        list: [
          { title: "/pages/…  (Shipping, Returns)", value: "pages" },
          { title: "/policies/…  (Privacy, Terms)", value: "policies" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Use shipping-taxes and returns for pages, privacy-policy and terms-of-service for policies to replace the default copy.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "date",
    }),
    defineField({
      name: "body",
      title: "Content",
      type: "blockContent",
    }),
  ],
  preview: {
    select: { title: "title", section: "section", slug: "slug.current" },
    prepare({ title, section, slug }) {
      return { title, subtitle: `/${section ?? "pages"}/${slug ?? ""}` };
    },
  },
});
