import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Categorises products (for example "Eyewear"). The excerpt is the short line
 * shown under the price on the product page of every product of this type.
 */
export const productType = defineType({
  name: "productType",
  title: "Product type",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: 'For example "Eyewear" or "Accessories".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      description:
        "Short line shown under the price on the product page, for every product of this type. For example: Premium eyewear. Fits most head shapes.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "excerpt" },
  },
});
