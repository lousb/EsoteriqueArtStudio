import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cover",
      title: "Cover",
      type: "media",
    }),
    defineField({
      name: "pageBuilder",
      title: "Page Builder",
      type: "array",
      of: [
        { type: "blogColumnBlock" },
        { type: "blogContentBlock" },
        { type: "blogFullwidthBlock" },
      ],
    }),
    defineField({
      name: "pageSeo",
      type: "pageSeo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      date: "date",
      media: "cover.image",
    },
    prepare({ title, date, media }) {
      return {
        title: title || "Untitled Post",
        subtitle: date,
        media,
      };
    },
  },
});