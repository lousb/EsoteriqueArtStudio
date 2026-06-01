import { defineField, defineType } from "sanity";

export const blogFullwidthBlock = defineType({
  name: "blogFullwidthBlock",
  title: "Full Width Media",
  type: "object",
  fields: [
    defineField({
      name: "media",
      title: "Media",
      type: "media",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
  ],
  preview: {
    select: {
      media: "media.image",
      caption: "caption",
    },
    prepare({ media, caption }) {
      return {
        title: caption || "Full Width Media",
        media,
      };
    },
  },
});