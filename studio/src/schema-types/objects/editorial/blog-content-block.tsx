import { defineField, defineType } from "sanity";

export const blogContentBlock = defineType({
  name: "blogContentBlock",
  title: "Content Block",
  type: "object",
  fields: [
    defineField({
      name: "content",
      title: "Content",
      type: "blockContent",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Content Block" }),
  },
});