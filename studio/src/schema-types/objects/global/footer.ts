import { defineArrayMember, defineField, defineType } from "sanity";

export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "object",
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    // Legacy links (no longer displayed, kept so existing content stays valid)
    defineField({
      name: "links",
      title: "Links (legacy)",
      type: "array",
      hidden: true,
      of: [defineArrayMember({ type: "link" })],
    }),
    defineField({
      name: "shopLabel",
      title: "Shop strip label",
      type: "string",
      description: "Small label above the footer that links to the shop. Leave empty to hide it.",
      initialValue: "Shop Eyewear",
    }),
    defineField({
      name: "exploreTitle",
      title: "First link column title",
      type: "string",
      initialValue: "Explore",
    }),
    defineField({
      name: "exploreLinks",
      title: "First link column",
      type: "array",
      of: [defineArrayMember({ type: "footerLink" })],
      description: "Defaults to About, Shop, Stories and Instagram when empty.",
    }),
    defineField({
      name: "customerServiceTitle",
      title: "Second link column title",
      type: "string",
      initialValue: "Customer Service",
    }),
    defineField({
      name: "customerServiceLinks",
      title: "Second link column",
      type: "array",
      of: [defineArrayMember({ type: "footerLink" })],
      description:
        "Defaults to Contact, Shipping & Taxes, Returns, Privacy Policy and Terms of Service when empty.",
    }),
    defineField({
      name: "acknowledgement",
      title: "Acknowledgement of Country",
      type: "text",
      rows: 3,
      description: "Shown bottom left of the footer.",
    }),
    defineField({
      name: "legalName",
      title: "Legal name for copyright line",
      type: "string",
      initialValue: "Esoterique Art Studio",
    }),
  ],
});
