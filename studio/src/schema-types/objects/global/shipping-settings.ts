import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Delivery options shown by the "Select a shipping location" dropdown on every product
 * page and on the Shipping & Taxes page. Lives inside the Settings singleton.
 */
export const shippingSettings = defineType({
  name: "shippingSettings",
  title: "Shipping",
  type: "object",
  options: { collapsed: false, collapsible: true },
  fields: [
    defineField({
      name: "selectorLabel",
      title: "Dropdown label",
      type: "string",
      initialValue: "Select a shipping location",
    }),
    defineField({
      name: "regions",
      title: "Regions",
      type: "array",
      description:
        "Each region appears in the dropdown, in this order. Keep these in step with the shipping zones and rates set up in Shopify.",
      of: [
        defineArrayMember({
          type: "object",
          name: "shippingRegion",
          fields: [
            defineField({
              name: "name",
              title: "Region name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "lines",
              title: "Lines shown when picked",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              description:
                "Short lines, usually the price first, then the carrier and delivery time, then any note about taxes.",
              validation: (rule) => rule.required().min(1),
            }),
          ],
          preview: {
            select: { title: "name", lines: "lines" },
            prepare({ title, lines }) {
              return { title, subtitle: (lines ?? []).join(" · ") };
            },
          },
        }),
      ],
    }),
  ],
});
